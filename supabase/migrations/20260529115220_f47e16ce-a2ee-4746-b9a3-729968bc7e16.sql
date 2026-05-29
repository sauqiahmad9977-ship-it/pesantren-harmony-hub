
-- Fix search_path
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- Revoke EXECUTE from public/authenticated for SECURITY DEFINER triggers/helper
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role still callable by authenticated via RLS policies (definer runs as owner regardless of caller), so revoke from authenticated too is fine because RLS evaluates with definer privileges? Actually policies need authenticated to invoke. Keep authenticated EXECUTE.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
