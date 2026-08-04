-- Menambahkan kolom referensi_id (jika belum ada) agar bisa melacak dari mana asal transaksinya
ALTER TABLE public.buku_kas ADD COLUMN IF NOT EXISTS referensi_id UUID;

-- Membuat fungsi pemicu (trigger function)
CREATE OR REPLACE FUNCTION public.trg_pembayaran_to_buku_kas()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika ada pembayaran baru (Setor SPP)
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.buku_kas (tanggal, jenis, kategori, nominal, keterangan, referensi_id)
    VALUES (
      NEW.tanggal_bayar, 
      'pemasukan', 
      'Pembayaran SPP', 
      NEW.nominal_bayar, 
      'Otomatis: Pembayaran Tagihan SPP (ID: ' || left(NEW.tagihan_id::text, 8) || ')', 
      NEW.id
    );
    RETURN NEW;
  
  -- Jika pembayaran dibatalkan/dihapus, hapus juga catatannya dari buku kas
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.buku_kas WHERE referensi_id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Hapus trigger lama jika ada agar tidak terjadi duplikasi
DROP TRIGGER IF EXISTS pembayaran_to_buku_kas ON public.pembayaran;

-- Memasang trigger ke tabel pembayaran
CREATE TRIGGER pembayaran_to_buku_kas
AFTER INSERT OR DELETE ON public.pembayaran
FOR EACH ROW
EXECUTE FUNCTION public.trg_pembayaran_to_buku_kas();
