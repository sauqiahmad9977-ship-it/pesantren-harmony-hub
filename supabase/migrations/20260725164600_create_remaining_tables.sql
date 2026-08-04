-- ENUMS
CREATE TYPE public.tagihan_status AS ENUM ('belum_lunas', 'cicilan', 'lunas');
CREATE TYPE public.transaksi_jenis AS ENUM ('setor', 'tarik');
CREATE TYPE public.penggajian_status AS ENUM ('belum_dibayar', 'dibayar');
CREATE TYPE public.buku_kas_jenis AS ENUM ('pemasukan', 'pengeluaran');
CREATE TYPE public.jurnal_posisi AS ENUM ('debit', 'kredit');

-- =========================
-- AKADEMIK
-- =========================
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

-- =========================
-- KEUANGAN & TABUNGAN
-- =========================
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

-- =========================
-- PENGGAJIAN
-- =========================
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

-- =========================
-- DONATUR
-- =========================
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

-- =========================
-- BUKU KAS & AKUNTANSI
-- =========================
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

-- =========================
-- PENGATURAN
-- =========================
CREATE TABLE public.pengaturan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
-- GRANTS & RLS (DYNAMIC)
-- =========================
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
