-- Hapus tabel lama jika ada agar strukturnur kolom benar-benar terganti
DROP TABLE IF EXISTS public.izin_keluar CASCADE;

-- Membuat tabel izin_keluar
CREATE TABLE IF NOT EXISTS public.izin_keluar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
  tanggal_keluar DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_kembali DATE NOT NULL,
  waktu_aktual_kembali TIMESTAMPTZ,
  keperluan TEXT NOT NULL,
  penjemput TEXT,
  status TEXT NOT NULL DEFAULT 'diizinkan',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atur Hak Akses (Grants)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.izin_keluar TO authenticated;
GRANT ALL ON public.izin_keluar TO service_role;

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.izin_keluar ENABLE ROW LEVEL SECURITY;

-- Kebijakan (Policies)
DROP POLICY IF EXISTS "izin_keluar_read" ON public.izin_keluar;
DROP POLICY IF EXISTS "izin_keluar_admin_write" ON public.izin_keluar;

CREATE POLICY "izin_keluar_read" ON public.izin_keluar FOR SELECT TO authenticated USING (true);
CREATE POLICY "izin_keluar_admin_write" ON public.izin_keluar FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
DROP TRIGGER IF EXISTS izin_keluar_touch ON public.izin_keluar;

CREATE TRIGGER izin_keluar_touch
BEFORE UPDATE ON public.izin_keluar
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- NOTIFY PostgREST untuk memuat ulang schema
NOTIFY pgrst, 'reload schema';
