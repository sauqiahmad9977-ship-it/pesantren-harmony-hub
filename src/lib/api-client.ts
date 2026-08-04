import { supabase } from "@/integrations/supabase/client";

// ─── Auth ───────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  roles: string[];
  message?: string;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  
  if (!data.user) throw new Error("Login failed");

  // Fetch role and full name from user metadata or profile table if needed
  const user = data.user;
  const authUser: AuthUser = {
    id: user.id,
    email: user.email || "",
    full_name: user.user_metadata?.full_name || user.email,
    phone: user.phone || user.user_metadata?.phone || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at,
  };
  
  const roles = user.user_metadata?.roles || ["admin"]; // Fallback or customize as needed

  return {
    token: data.session?.access_token || "",
    user: authUser,
    roles: roles,
  };
}

export async function apiRegister(email: string, password: string, fullName: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        roles: ["staff"] // Default role for new registrations
      }
    }
  });
  
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Pendaftaran gagal");

  const user = data.user;
  const authUser: AuthUser = {
    id: user.id,
    email: user.email || "",
    full_name: user.user_metadata?.full_name || fullName,
    phone: user.phone || user.user_metadata?.phone || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at,
  };

  const roles = user.user_metadata?.roles || ["staff"];

  return {
    token: data.session?.access_token || "",
    user: authUser,
    roles: roles,
    message: "Pendaftaran berhasil"
  };
}

export async function apiGetMe(): Promise<{ user: AuthUser; roles: string[] }> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error(error?.message || "Sesi tidak valid");

  const authUser: AuthUser = {
    id: user.id,
    email: user.email || "",
    full_name: user.user_metadata?.full_name || user.email,
    phone: user.phone || user.user_metadata?.phone || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at,
  };
  
  const roles = user.user_metadata?.roles || ["admin"];
  
  return { user: authUser, roles };
}

export async function apiLogout() {
  await supabase.auth.signOut();
}

export async function apiGetUsers(): Promise<any[]> {
  const { data, error } = await supabase.rpc('get_users');
  if (error) throw new Error(error.message);
  return data;
}

export async function apiUpdateUserRole(targetUserId: string, newRole: string): Promise<void> {
  const { error } = await supabase.rpc('update_user_role', { 
    target_user_id: targetUserId, 
    new_role: newRole 
  });
  if (error) throw new Error(error.message);
}

export async function apiAdminCreateUser(email: string, password: string, fullName: string, role: string): Promise<void> {
  const { error } = await supabase.rpc('admin_create_user', {
    new_email: email,
    new_password: password,
    new_full_name: fullName,
    new_role: role
  });
  if (error) throw new Error(error.message);
}

export async function apiChangePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function apiUpdateProfile(fullName: string, phone: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      phone: phone
    }
  });
  if (error) throw new Error(error.message);
}

// These are no longer necessary for Supabase as it handles its own session
// but we keep them for compatibility with any components still using them
export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("sb-your_supabase_url-auth-token"); // standard supabase key if you know it, otherwise just return null
  return null;
}

export function getStoredRoles(): string[] {
  return [];
}

export function isLoggedIn(): boolean {
  // A synchronous check isn't perfectly accurate with Supabase, 
  // rely on useAuth instead.
  return !!localStorage.getItem("supabase.auth.token"); // this key varies depending on project
}

// ─── CRUD ───────────────────────────────────────────

export async function apiGetAll(table: string): Promise<any[]> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw new Error(error.message);
  return data;
}

export async function apiCount(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

export async function apiCreate(table: string, data: any) {
  console.log(`[apiCreate] Starting insert to ${table}`, data);
  
  try {
    let result;
    if (Array.isArray(data)) {
      const { data: res, error } = await supabase.from(table).insert(data).select();
      if (error) throw new Error(error.message);
      result = res;
    } else {
      const { data: res, error } = await supabase.from(table).insert([data]).select();
      if (error) throw new Error(error.message);
      result = res?.[0];
    }
    console.log(`[apiCreate] Success insert:`, result);
    return result;
  } catch (err: any) {
    console.error(`[apiCreate] Catch block:`, err);
    throw err;
  }
}

export async function apiUpdate(table: string, id: string, data: any) {
  const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
  if (error) throw new Error(error.message);
  return result?.[0];
}

export async function apiDelete(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
