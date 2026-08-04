-- =============================================
-- SIM Pondok Pesantren — MySQL Schema
-- =============================================
-- Jalankan file ini di MySQL/phpMyAdmin untuk
-- membuat database dan semua tabel yang dibutuhkan.
-- =============================================

CREATE DATABASE IF NOT EXISTS sim_pesantren
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sim_pesantren;

-- =========================
-- USERS (pengganti auth.users di Supabase)
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(50) DEFAULT NULL,
  avatar_url TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- USER ROLES
-- =========================
CREATE TABLE IF NOT EXISTS user_roles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  role ENUM('admin', 'ustadz', 'staff') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_role (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- KELAS
-- =========================
CREATE TABLE IF NOT EXISTS kelas (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nama VARCHAR(255) NOT NULL,
  tingkat VARCHAR(100) DEFAULT NULL,
  wali_kelas VARCHAR(255) DEFAULT NULL,
  kapasitas INT NOT NULL DEFAULT 30,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- KAMAR
-- =========================
CREATE TABLE IF NOT EXISTS kamar (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nomor VARCHAR(100) NOT NULL,
  gedung VARCHAR(255) DEFAULT NULL,
  kapasitas INT NOT NULL DEFAULT 8,
  pengasuh VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- SANTRI
-- =========================
CREATE TABLE IF NOT EXISTS santri (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  no_induk VARCHAR(50) UNIQUE NOT NULL,
  nama_santri VARCHAR(255) NOT NULL,
  nik VARCHAR(50) DEFAULT NULL,
  gender ENUM('L', 'P') NOT NULL DEFAULT 'L',
  ttlh VARCHAR(255) DEFAULT NULL,
  tamatan VARCHAR(100) DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  nama_ortu VARCHAR(255) DEFAULT NULL,
  pekerjaan_ortu VARCHAR(255) DEFAULT NULL,
  no_wa VARCHAR(50) DEFAULT NULL,
  kelas_id VARCHAR(36) DEFAULT NULL,
  kamar_id VARCHAR(36) DEFAULT NULL,
  status ENUM('aktif', 'alumni', 'keluar', 'cuti') NOT NULL DEFAULT 'aktif',
  foto_url TEXT DEFAULT NULL,
  tanggal_masuk DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE SET NULL,
  FOREIGN KEY (kamar_id) REFERENCES kamar(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- KITAB
-- =========================
CREATE TABLE IF NOT EXISTS kitab (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  judul VARCHAR(255) NOT NULL,
  pengarang VARCHAR(255) DEFAULT NULL,
  kategori VARCHAR(100) DEFAULT NULL,
  stok INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- KESEHATAN
-- =========================
CREATE TABLE IF NOT EXISTS kesehatan (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  santri_id VARCHAR(36) NOT NULL,
  tanggal DATE NOT NULL DEFAULT (CURRENT_DATE),
  keluhan TEXT DEFAULT NULL,
  diagnosa TEXT DEFAULT NULL,
  tindakan TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- KONSELING
-- =========================
CREATE TABLE IF NOT EXISTS konseling (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  santri_id VARCHAR(36) NOT NULL,
  tanggal DATE NOT NULL DEFAULT (CURRENT_DATE),
  masalah TEXT DEFAULT NULL,
  solusi TEXT DEFAULT NULL,
  konselor VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- IZIN KELUAR
-- =========================
CREATE TABLE IF NOT EXISTS izin_keluar (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  santri_id VARCHAR(36) NOT NULL,
  tanggal DATE NOT NULL DEFAULT (CURRENT_DATE),
  jam_keluar TIME DEFAULT NULL,
  jam_kembali TIME DEFAULT NULL,
  keperluan TEXT DEFAULT NULL,
  status ENUM('menunggu', 'disetujui', 'ditolak', 'kembali') NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- IZIN PULANG
-- =========================
CREATE TABLE IF NOT EXISTS izin_pulang (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  santri_id VARCHAR(36) NOT NULL,
  tanggal_pulang DATE NOT NULL DEFAULT (CURRENT_DATE),
  tanggal_kembali DATE DEFAULT NULL,
  keperluan TEXT DEFAULT NULL,
  status ENUM('menunggu', 'disetujui', 'ditolak', 'kembali') NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- PEGAWAI (Kepegawaian)
-- =========================
CREATE TABLE IF NOT EXISTS pegawai (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nik VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  gender ENUM('L', 'P') NOT NULL DEFAULT 'L',
  tempat_lahir VARCHAR(255) DEFAULT NULL,
  tanggal_lahir DATE DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  telepon VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  jabatan VARCHAR(255) DEFAULT NULL,
  pendidikan_terakhir VARCHAR(255) DEFAULT NULL,
  tanggal_masuk DATE NOT NULL DEFAULT (CURRENT_DATE),
  tanggal_keluar DATE DEFAULT NULL,
  status ENUM('aktif', 'nonaktif', 'cuti', 'pensiun') NOT NULL DEFAULT 'aktif',
  gaji_pokok DECIMAL(12,2) DEFAULT 0,
  no_rekening VARCHAR(100) DEFAULT NULL,
  keterangan TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- PENGGAJIAN PEGAWAI (Kepegawaian/Keuangan)
-- =========================
CREATE TABLE IF NOT EXISTS penggajian_pegawai (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  pegawai_id VARCHAR(36) NOT NULL,
  bulan VARCHAR(20) NOT NULL,
  tahun VARCHAR(4) NOT NULL,
  gaji_pokok DECIMAL(12,2) NOT NULL DEFAULT 0,
  tunjangan DECIMAL(12,2) NOT NULL DEFAULT 0,
  potongan DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_gaji DECIMAL(12,2) NOT NULL DEFAULT 0,
  tanggal_bayar DATE NOT NULL DEFAULT (CURRENT_DATE),
  status ENUM('dibayar', 'pending') NOT NULL DEFAULT 'dibayar',
  keterangan TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- MATA PELAJARAN (Akademik)
-- =========================
CREATE TABLE IF NOT EXISTS mata_pelajaran (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  kode VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  tingkat VARCHAR(100) DEFAULT NULL,
  pengajar_id VARCHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pengajar_id) REFERENCES pegawai(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- NILAI SANTRI (Akademik)
-- =========================
CREATE TABLE IF NOT EXISTS nilai_santri (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  santri_id VARCHAR(36) NOT NULL,
  mata_pelajaran_id VARCHAR(36) NOT NULL,
  nilai DECIMAL(5,2) NOT NULL DEFAULT 0,
  semester ENUM('ganjil', 'genap') NOT NULL DEFAULT 'ganjil',
  tahun_ajaran VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
  FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- TAGIHAN (Keuangan)
-- =========================
CREATE TABLE IF NOT EXISTS tagihan (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  santri_id VARCHAR(36) NOT NULL,
  jenis VARCHAR(100) NOT NULL,
  nominal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tenggat_waktu DATE DEFAULT NULL,
  status ENUM('belum_lunas', 'lunas', 'cicilan') NOT NULL DEFAULT 'belum_lunas',
  keterangan TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- PEMBAYARAN (Keuangan)
-- =========================
CREATE TABLE IF NOT EXISTS pembayaran (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tagihan_id VARCHAR(36) NOT NULL,
  tanggal_bayar DATE NOT NULL DEFAULT (CURRENT_DATE),
  nominal_bayar DECIMAL(12,2) NOT NULL DEFAULT 0,
  metode_pembayaran VARCHAR(100) DEFAULT NULL,
  keterangan TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tagihan_id) REFERENCES tagihan(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- TABUNGAN SANTRI (Keuangan)
-- =========================
CREATE TABLE IF NOT EXISTS tabungan_santri (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  santri_id VARCHAR(36) NOT NULL,
  jenis ENUM('setor', 'tarik') NOT NULL DEFAULT 'setor',
  nominal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tanggal DATE NOT NULL DEFAULT (CURRENT_DATE),
  keterangan TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- DONATUR
-- =========================
CREATE TABLE IF NOT EXISTS donatur (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nama VARCHAR(255) NOT NULL,
  telepon VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  kategori ENUM('individu', 'lembaga', 'alumni') NOT NULL DEFAULT 'individu',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- DONASI
-- =========================
CREATE TABLE IF NOT EXISTS donasi (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  donatur_id VARCHAR(36) DEFAULT NULL,
  tanggal_donasi DATE NOT NULL DEFAULT (CURRENT_DATE),
  nominal DECIMAL(12,2) NOT NULL DEFAULT 0,
  metode_pembayaran VARCHAR(100) DEFAULT NULL,
  peruntukan VARCHAR(255) DEFAULT 'Umum',
  keterangan TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donatur_id) REFERENCES donatur(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- BUKU KAS
-- =========================
CREATE TABLE IF NOT EXISTS buku_kas (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tanggal DATE NOT NULL DEFAULT (CURRENT_DATE),
  tipe ENUM('pemasukan', 'pengeluaran') NOT NULL DEFAULT 'pemasukan',
  nominal DECIMAL(12,2) NOT NULL DEFAULT 0,
  kategori VARCHAR(100) DEFAULT NULL,
  keterangan TEXT DEFAULT NULL,
  referensi_id VARCHAR(36) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- AKUN PERKIRAAN (COA)
-- =========================
CREATE TABLE IF NOT EXISTS akun_perkiraan (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  kode VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  tipe ENUM('aset', 'kewajiban', 'ekuitas', 'pendapatan', 'beban') NOT NULL,
  saldo_normal ENUM('debit', 'kredit') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- JURNAL UMUM
-- =========================
CREATE TABLE IF NOT EXISTS jurnal_umum (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tanggal DATE NOT NULL DEFAULT (CURRENT_DATE),
  keterangan TEXT NOT NULL,
  referensi VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- DETAIL JURNAL
-- =========================
CREATE TABLE IF NOT EXISTS detail_jurnal (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  jurnal_id VARCHAR(36) NOT NULL,
  akun_id VARCHAR(36) NOT NULL,
  debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  kredit DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (jurnal_id) REFERENCES jurnal_umum(id) ON DELETE CASCADE,
  FOREIGN KEY (akun_id) REFERENCES akun_perkiraan(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
