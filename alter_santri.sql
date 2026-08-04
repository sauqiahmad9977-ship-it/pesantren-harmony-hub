-- Sesuaikan kolom agar cocok dengan frontend (santri.tsx)
ALTER TABLE public.santri RENAME COLUMN nis TO no_induk;
ALTER TABLE public.santri RENAME COLUMN nama TO nama_santri;
ALTER TABLE public.santri RENAME COLUMN nama_wali TO nama_ortu;
ALTER TABLE public.santri RENAME COLUMN telepon_wali TO no_wa;

ALTER TABLE public.santri ADD COLUMN IF NOT EXISTS nik TEXT;
ALTER TABLE public.santri ADD COLUMN IF NOT EXISTS ttlh TEXT;
ALTER TABLE public.santri ADD COLUMN IF NOT EXISTS tamatan TEXT;
ALTER TABLE public.santri ADD COLUMN IF NOT EXISTS pekerjaan_ortu TEXT;
