-- Drop existing key-value columns
ALTER TABLE public.pengaturan
  DROP COLUMN IF EXISTS key,
  DROP COLUMN IF EXISTS value,
  DROP COLUMN IF EXISTS keterangan;

-- Add new columns for settings
ALTER TABLE public.pengaturan
  ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'SIM Pondok Pesantren',
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS alamat TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tahun_ajaran TEXT DEFAULT '2026/2027 - Ganjil';

-- Insert default row if empty using a valid UUID
INSERT INTO public.pengaturan (id, app_name, logo_url, alamat, tahun_ajaran)
VALUES ('00000000-0000-0000-0000-000000000001', 'SIM Pondok Pesantren', '', '', '2026/2027 - Ganjil')
ON CONFLICT (id) DO NOTHING;

-- Force reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
