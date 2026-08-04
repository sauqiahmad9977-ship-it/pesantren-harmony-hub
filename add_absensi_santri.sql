-- Membuat enum status absensi jika belum ada
DO $$ BEGIN
    CREATE TYPE public.status_absensi AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Hapus tabel lama jika ada agar strukturnya benar-benar terganti
DROP TABLE IF EXISTS public.absensi_santri CASCADE;

-- Membuat tabel absensi_santri
CREATE TABLE IF NOT EXISTS public.absensi_santri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.status_absensi NOT NULL DEFAULT 'hadir',
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(santri_id, tanggal) -- Satu santri hanya punya satu absensi per hari
);

-- Atur Hak Akses (Grants)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.absensi_santri TO authenticated;
GRANT ALL ON public.absensi_santri TO service_role;

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.absensi_santri ENABLE ROW LEVEL SECURITY;

-- Kebijakan (Policies)
DROP POLICY IF EXISTS "absensi_santri_read" ON public.absensi_santri;
DROP POLICY IF EXISTS "absensi_santri_admin_write" ON public.absensi_santri;

CREATE POLICY "absensi_santri_read" ON public.absensi_santri FOR SELECT TO authenticated USING (true);
CREATE POLICY "absensi_santri_admin_write" ON public.absensi_santri FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
DROP TRIGGER IF EXISTS absensi_santri_touch ON public.absensi_santri;

CREATE TRIGGER absensi_santri_touch
BEFORE UPDATE ON public.absensi_santri
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- NOTIFY PostgREST untuk memuat ulang schema
NOTIFY pgrst, 'reload schema';
