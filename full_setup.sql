-- ==========================================
-- BAGIAN 1: ENUM & TABEL DASAR (SANTRI, DLL)
-- ==========================================
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
-- Fix search_path for touch_updated_at
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- Revoke EXECUTE from public/authenticated for SECURITY DEFINER triggers/helper
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- KELAS
-- =========================
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

-- =========================
-- KAMAR
-- =========================
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

-- =========================
-- SANTRI
-- =========================
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

-- =========================
-- KITAB
-- =========================
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

-- =========================
-- KESEHATAN
-- =========================
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

-- =========================
-- KONSELING
-- =========================
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

-- =========================
-- IZIN KELUAR
-- =========================
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

-- =========================
-- IZIN PULANG
-- =========================
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


-- ==========================================
-- BAGIAN 2: PEGAWAI
-- ==========================================
CREATE TYPE public.pegawai_status AS ENUM ('aktif', 'nonaktif', 'cuti', 'pensiun');

CREATE TABLE public.pegawai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  gender gender_type NOT NULL DEFAULT 'L',
  tempat_lahir TEXT,
  tanggal_lahir DATE,
  alamat TEXT,
  telepon TEXT,
  email TEXT,
  jabatan TEXT,
  pendidikan_terakhir TEXT,
  tanggal_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_keluar DATE,
  status pegawai_status NOT NULL DEFAULT 'aktif',
  gaji_pokok NUMERIC(12,2) DEFAULT 0,
  no_rekening TEXT,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pegawai TO authenticated;
GRANT ALL ON public.pegawai TO service_role;
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pegawai_read" ON public.pegawai FOR SELECT TO authenticated USING (true);
CREATE POLICY "pegawai_admin_write" ON public.pegawai FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER pegawai_touch BEFORE UPDATE ON public.pegawai FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ==========================================
-- BAGIAN 3: TABEL TAMBAHAN (SISA MODUL)
-- ==========================================
-- ENUMS TAMBAHAN
CREATE TYPE public.tagihan_status AS ENUM ('belum_lunas', 'cicilan', 'lunas');
CREATE TYPE public.transaksi_jenis AS ENUM ('setor', 'tarik');
CREATE TYPE public.penggajian_status AS ENUM ('belum_dibayar', 'dibayar');
CREATE TYPE public.buku_kas_jenis AS ENUM ('pemasukan', 'pengeluaran');
CREATE TYPE public.jurnal_posisi AS ENUM ('debit', 'kredit');

-- AKADEMIK
CREATE TABLE public.mata_pelajaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  kkm NUMERIC(5,2) DEFAULT 75,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.nilai_santri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  mata_pelajaran_id UUID NOT NULL REFERENCES public.mata_pelajaran(id) ON DELETE CASCADE,
  semester TEXT NOT NULL,
  tahun_ajaran TEXT NOT NULL,
  nilai NUMERIC(5,2) NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- KEUANGAN & TABUNGAN
CREATE TABLE public.tagihan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  jenis TEXT NOT NULL,
  nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
  tenggat_waktu DATE,
  status tagihan_status NOT NULL DEFAULT 'belum_lunas',
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.pembayaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tagihan_id UUID NOT NULL REFERENCES public.tagihan(id) ON DELETE CASCADE,
  tanggal_bayar DATE NOT NULL DEFAULT CURRENT_DATE,
  nominal_bayar NUMERIC(15,2) NOT NULL DEFAULT 0,
  metode_pembayaran TEXT,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.tabungan_santri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  jenis transaksi_jenis NOT NULL,
  nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PENGGAJIAN
CREATE TABLE public.penggajian_pegawai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pegawai_id UUID NOT NULL REFERENCES public.pegawai(id) ON DELETE CASCADE,
  bulan INT NOT NULL,
  tahun INT NOT NULL,
  gaji_pokok NUMERIC(15,2) NOT NULL DEFAULT 0,
  tunjangan NUMERIC(15,2) NOT NULL DEFAULT 0,
  potongan NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_gaji NUMERIC(15,2) NOT NULL DEFAULT 0,
  status penggajian_status NOT NULL DEFAULT 'belum_dibayar',
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DONATUR
CREATE TABLE public.donatur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  telepon TEXT,
  alamat TEXT,
  email TEXT,
  kategori TEXT,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.donasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donatur_id UUID NOT NULL REFERENCES public.donatur(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
  metode_pembayaran TEXT,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BUKU KAS & AKUNTANSI
CREATE TABLE public.buku_kas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jenis buku_kas_jenis NOT NULL,
  kategori TEXT NOT NULL,
  nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.akun_perkiraan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_akun TEXT UNIQUE NOT NULL,
  nama_akun TEXT NOT NULL,
  kategori TEXT,
  saldo_normal jurnal_posisi NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.jurnal_umum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  nomor_bukti TEXT,
  keterangan TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.detail_jurnal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurnal_id UUID NOT NULL REFERENCES public.jurnal_umum(id) ON DELETE CASCADE,
  akun_id UUID NOT NULL REFERENCES public.akun_perkiraan(id) ON DELETE RESTRICT,
  posisi jurnal_posisi NOT NULL,
  nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PENGATURAN
CREATE TABLE public.pengaturan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GRANTS & RLS (DYNAMIC)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'mata_pelajaran', 'nilai_santri', 'tagihan', 'pembayaran', 'tabungan_santri',
    'penggajian_pegawai', 'donatur', 'donasi', 'buku_kas', 'akun_perkiraan', 
    'jurnal_umum', 'detail_jurnal', 'pengaturan'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    -- Grants
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    
    -- Policies (read all for authenticated, write only for admin)
    EXECUTE format('CREATE POLICY "%I_read" ON public.%I FOR SELECT TO authenticated USING (true);', t, t);
    EXECUTE format('CREATE POLICY "%I_admin_write" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''));', t, t);
    
    -- Trigger for updated_at
    EXECUTE format('CREATE TRIGGER %I_touch BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();', t, t);
  END LOOP;
END
$$;
