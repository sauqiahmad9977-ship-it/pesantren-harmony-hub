
-- =========================
-- ENUM: Status Pegawai
-- =========================
CREATE TYPE public.pegawai_status AS ENUM ('aktif', 'nonaktif', 'cuti', 'pensiun');

-- =========================
-- PEGAWAI (Kepegawaian)
-- =========================
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
