
-- Enum role
CREATE TYPE public.app_role AS ENUM ('admin', 'ustadz', 'staff');

-- Enum status
CREATE TYPE public.santri_status AS ENUM ('aktif', 'alumni', 'keluar', 'cuti');
CREATE TYPE public.gender_type AS ENUM ('L', 'P');
CREATE TYPE public.izin_status AS ENUM ('menunggu', 'disetujui', 'ditolak', 'kembali');

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- =========================
-- USER ROLES
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_self" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Admins can manage roles
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- Auto-create profile + first user becomes admin
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- updated_at helper
-- =========================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- Generic policy macro replaced by explicit statements per table
-- Pattern: authenticated read, admin write
-- =========================

-- KELAS
CREATE TABLE public.kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  tingkat TEXT,
  wali_kelas TEXT,
  kapasitas INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kelas TO authenticated;
GRANT ALL ON public.kelas TO service_role;
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kelas_read" ON public.kelas FOR SELECT TO authenticated USING (true);
CREATE POLICY "kelas_admin_write" ON public.kelas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER kelas_touch BEFORE UPDATE ON public.kelas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- KAMAR
CREATE TABLE public.kamar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor TEXT NOT NULL,
  gedung TEXT,
  kapasitas INT NOT NULL DEFAULT 8,
  pengasuh TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kamar TO authenticated;
GRANT ALL ON public.kamar TO service_role;
ALTER TABLE public.kamar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kamar_read" ON public.kamar FOR SELECT TO authenticated USING (true);
CREATE POLICY "kamar_admin_write" ON public.kamar FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER kamar_touch BEFORE UPDATE ON public.kamar FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SANTRI
CREATE TABLE public.santri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nis TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  gender gender_type NOT NULL DEFAULT 'L',
  tanggal_lahir DATE,
  alamat TEXT,
  nama_wali TEXT,
  telepon_wali TEXT,
  kelas_id UUID REFERENCES public.kelas(id) ON DELETE SET NULL,
  kamar_id UUID REFERENCES public.kamar(id) ON DELETE SET NULL,
  status santri_status NOT NULL DEFAULT 'aktif',
  foto_url TEXT,
  tanggal_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.santri TO authenticated;
GRANT ALL ON public.santri TO service_role;
ALTER TABLE public.santri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "santri_read" ON public.santri FOR SELECT TO authenticated USING (true);
CREATE POLICY "santri_admin_write" ON public.santri FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER santri_touch BEFORE UPDATE ON public.santri FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- KITAB
CREATE TABLE public.kitab (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  pengarang TEXT,
  kategori TEXT,
  stok INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kitab TO authenticated;
GRANT ALL ON public.kitab TO service_role;
ALTER TABLE public.kitab ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kitab_read" ON public.kitab FOR SELECT TO authenticated USING (true);
CREATE POLICY "kitab_admin_write" ON public.kitab FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER kitab_touch BEFORE UPDATE ON public.kitab FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- KESEHATAN
CREATE TABLE public.kesehatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  keluhan TEXT,
  diagnosa TEXT,
  tindakan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kesehatan TO authenticated;
GRANT ALL ON public.kesehatan TO service_role;
ALTER TABLE public.kesehatan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kesehatan_read" ON public.kesehatan FOR SELECT TO authenticated USING (true);
CREATE POLICY "kesehatan_admin_write" ON public.kesehatan FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER kesehatan_touch BEFORE UPDATE ON public.kesehatan FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- KONSELING
CREATE TABLE public.konseling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  masalah TEXT,
  solusi TEXT,
  konselor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.konseling TO authenticated;
GRANT ALL ON public.konseling TO service_role;
ALTER TABLE public.konseling ENABLE ROW LEVEL SECURITY;
CREATE POLICY "konseling_read" ON public.konseling FOR SELECT TO authenticated USING (true);
CREATE POLICY "konseling_admin_write" ON public.konseling FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER konseling_touch BEFORE UPDATE ON public.konseling FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- IZIN KELUAR
CREATE TABLE public.izin_keluar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_keluar TIME,
  jam_kembali TIME,
  keperluan TEXT,
  status izin_status NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.izin_keluar TO authenticated;
GRANT ALL ON public.izin_keluar TO service_role;
ALTER TABLE public.izin_keluar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "izin_keluar_read" ON public.izin_keluar FOR SELECT TO authenticated USING (true);
CREATE POLICY "izin_keluar_admin_write" ON public.izin_keluar FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER izin_keluar_touch BEFORE UPDATE ON public.izin_keluar FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- IZIN PULANG
CREATE TABLE public.izin_pulang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  tanggal_pulang DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_kembali DATE,
  keperluan TEXT,
  status izin_status NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.izin_pulang TO authenticated;
GRANT ALL ON public.izin_pulang TO service_role;
ALTER TABLE public.izin_pulang ENABLE ROW LEVEL SECURITY;
CREATE POLICY "izin_pulang_read" ON public.izin_pulang FOR SELECT TO authenticated USING (true);
CREATE POLICY "izin_pulang_admin_write" ON public.izin_pulang FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER izin_pulang_touch BEFORE UPDATE ON public.izin_pulang FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
