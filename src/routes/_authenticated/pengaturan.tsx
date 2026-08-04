import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Settings, User, Shield, HardDrive, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUpdate, apiGetUsers, apiUpdateUserRole, apiAdminCreateUser, apiChangePassword, apiUpdateProfile } from "@/lib/api-client";
import { toast } from "sonner";
export const Route = createFileRoute("/_authenticated/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan — SIM Pesantren" }] }),
  component: PengaturanModule,
});

function ProfileSettings() {
  const { user, roles } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => apiUpdateProfile(fullName, phone),
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui profil");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      toast.error("Nama lengkap tidak boleh kosong");
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label>Nama Lengkap</Label>
          <Input 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            placeholder="Masukkan nama lengkap" 
            required 
          />
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label>Telepon</Label>
          <Input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Contoh: 08123456789" 
          />
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label>Email <span className="text-muted-foreground font-normal text-xs">(Tidak dapat diubah)</span></Label>
          <Input value={user?.email || ""} disabled className="bg-muted" />
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label>Peran (Role) <span className="text-muted-foreground font-normal text-xs">(Hubungi admin)</span></Label>
          <Input value={roles?.[0] || "Staff"} disabled className="bg-muted capitalize" />
        </div>
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Menyimpan..." : "Simpan Profil"}
      </Button>
    </form>
  );
}

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const mutation = useMutation({
    mutationFn: apiChangePassword,
    onSuccess: () => {
      toast.success("Password berhasil diubah!");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengubah password");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    mutation.mutate(newPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label>Password Baru</Label>
        <Input 
          type="password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
          placeholder="Masukkan password baru" 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label>Konfirmasi Password</Label>
        <Input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          placeholder="Ulangi password baru" 
          required 
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Menyimpan..." : "Simpan Password"}
      </Button>
    </form>
  );
}

function SystemSettings() {
  const { data: settings, isPending } = useSettings();
  const queryClient = useQueryClient();
  const [appName, setAppName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (settings) {
      setAppName(settings.app_name);
      setLogoUrl(settings.logo_url);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: any) => apiUpdate("pengaturan", settings?.id || "00000000-0000-0000-0000-000000000001", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pengaturan"] });
      toast.success("Pengaturan berhasil disimpan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menyimpan pengaturan");
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file logo maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isPending) return <p className="text-sm text-muted-foreground">Memuat pengaturan...</p>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nama Aplikasi / Pesantren</Label>
        <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Contoh: SIM Pondok Pesantren" />
      </div>
      <div className="space-y-2">
        <Label>Logo Aplikasi (Upload Lokal)</Label>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="w-16 h-16 shrink-0 border rounded-md overflow-hidden bg-muted">
              <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
            </div>
          ) : null}
          <div className="flex-1 space-y-2">
            <Input type="file" accept="image/*" onChange={handleLogoUpload} />
            <p className="text-xs text-muted-foreground">Pilih gambar logo dari komputer Anda (Maksimal 2MB). Kosongkan untuk logo bawaan.</p>
            {logoUrl && (
              <Button type="button" variant="outline" size="sm" onClick={() => setLogoUrl("")}>
                Hapus Logo
              </Button>
            )}
          </div>
        </div>
      </div>
      <Button onClick={() => mutation.mutate({ app_name: appName, logo_url: logoUrl })} disabled={mutation.isPending}>
        {mutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
      </Button>

      <div className="mt-8 space-y-2 pt-6 border-t border-border">
        <div className="p-3 bg-muted rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Tahun Ajaran Aktif</p>
            <p className="text-xs text-muted-foreground">{settings?.tahun_ajaran || "2026/2027 - Ganjil"}</p>
          </div>
          <button className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-md font-medium">Ubah</button>
        </div>
        <div className="p-3 bg-muted rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Backup Database</p>
            <p className="text-xs text-muted-foreground">Terakhir dibackup: 2 hari yang lalu</p>
          </div>
          <button className="text-xs flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md font-medium">
            <HardDrive className="w-3 h-3" /> Backup Now
          </button>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState("staff");

  const { data: users, isPending, error } = useQuery({
    queryKey: ["users"],
    queryFn: apiGetUsers,
  });

  const mutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => apiUpdateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role pengguna berhasil diubah");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengubah role pengguna");
    }
  });

  const addMutation = useMutation({
    mutationFn: () => apiAdminCreateUser(newEmail, newPassword, newFullName, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Pengguna baru berhasil ditambahkan");
      setIsAddOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewRole("staff");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menambahkan pengguna");
    }
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newFullName) {
      toast.error("Mohon lengkapi semua bidang");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    addMutation.mutate();
  };

  if (isPending) return <p className="text-sm text-muted-foreground">Memuat data pengguna...</p>;
  if (error) return <p className="text-sm text-destructive">Gagal memuat pengguna: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Tambah Pengguna Baru</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              <DialogDescription>
                Buat akun pengguna baru tanpa perlu logout.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Contoh: Ahmad Abdullah" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Contoh: ahmad@pesantren.id" required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" required />
              </div>
              <div className="space-y-2">
                <Label>Role (Hak Akses)</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="staff">Staff (Administrasi / Keuangan)</option>
                  <option value="ustadz">Ustadz (Pendidikan / Kesantrian)</option>
                  <option value="admin">Admin (Akses Penuh)</option>
                </select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                <Button type="submit" disabled={addMutation.isPending}>{addMutation.isPending ? "Menyimpan..." : "Simpan Pengguna"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nama / Email</th>
              <th className="px-4 py-3 font-medium">Role Saat Ini</th>
              <th className="px-4 py-3 font-medium">Ubah Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((u: any) => (
              <tr key={u.id} className="bg-background">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">
                  {u.roles?.[0] || 'staff'}
                </td>
                <td className="px-4 py-3">
                  <select 
                    className="border text-xs rounded px-2 py-1 bg-transparent"
                    defaultValue={u.roles?.[0] || 'staff'}
                    onChange={(e) => {
                      if (window.confirm(`Ubah role pengguna ini menjadi ${e.target.value}?`)) {
                        mutation.mutate({ userId: u.id, role: e.target.value });
                      } else {
                        e.target.value = u.roles?.[0] || 'staff';
                      }
                    }}
                    disabled={mutation.isPending}
                  >
                    <option value="staff">Staff</option>
                    <option value="ustadz">Ustadz</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PengaturanModule() {
  const { user, roles } = useAuth();
  const isAdmin = roles.includes("admin");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi sistem dan manajemen akun.</p>
      </div>

      <Tabs defaultValue="profil" className="w-full max-w-4xl">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="profil" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil Saya
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="pengguna" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pengguna
            </TabsTrigger>
          )}
          <TabsTrigger value="sistem" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Sistem
          </TabsTrigger>
          <TabsTrigger value="keamanan" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Keamanan
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profil">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Detail akun Anda saat ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="pengguna">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Pengguna</CardTitle>
                <CardDescription>Kelola hak akses (role) untuk pengguna aplikasi.</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="sistem">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Pesantren</CardTitle>
              <CardDescription>Konfigurasi identitas pondok pesantren.</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keamanan">
          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>Pastikan akun Anda menggunakan password yang kuat.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePassword />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
