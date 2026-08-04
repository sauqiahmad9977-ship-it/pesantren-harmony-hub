-- Membuatkan profil untuk user yang mendaftar sebelum tabel selesai dibuat
INSERT INTO public.profiles (id, full_name)
SELECT id, split_part(email, '@', 1) FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Memberikan hak akses 'admin' ke user Anda
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;
