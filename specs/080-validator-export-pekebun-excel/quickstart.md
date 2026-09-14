# Quickstart Validation: Fitur Ekspor Excel Pekebun & Lahan

## 1. Prasyarat Pengujian

- Aplikasi frontend `bpdp-sarpras-kelapa-fe` berjalan (`npm run dev`).
- Akun salah satu validator:
  - Dinas Kabupaten: menu Verifikasi Proposal -> Tab "Tugasku / My Task" -> Tinjau Proposal -> Section Data Pekebun & Lahan
  - Dinas Provinsi: menu Verifikasi Proposal -> Tab "Tugasku" -> Detail Verifikasi -> Section Pekebun & Dokumen
  - Ditjenbun: menu Rekomtek / Verifikasi -> Tinjau Proposal
  - BPDP KS: menu Kelayakan BPDP -> Tinjau Proposal

## 2. Skenario Uji 1: Ekspor Laporan Titik Koordinat

1. Buka proposal yang memiliki pekebun dan lahan dengan koordinat poligon.
2. Pada toolbar section Data Pekebun, klik tombol **"Ekspor Data Pekebun ▾"**.
3. Pilih menu **"Laporan Titik Koordinat (.xlsx)"**.
4. Periksa berkas Excel yang terunduh:
   - Nama berkas: `Laporan_Titik_Koordinat_[NomorProposal]_[Tanggal].xlsx`
   - Header kolom memuat 14 kolom persis: `No`, `Nomor Proposal`, `Provinsi`, `Kabupaten`, `Nama Kelembagaan Pekebun`, `Nama Pekebun`, `NIK Pekebun`, `Luas Lahan (Ha)`, `Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)`, `Nama Tertera di SHM`, `Nomor SHM`, `Nomor SKT/GIRIK/SPORADIK`, `Latitude`, `Longitude`.
   - Data koordinat poligon terpecah 1 baris per titik koordinat sudut (lat, lng).
   - NIK berformat teks dan tidak berubah menjadi notasi ilmiah.

## 3. Skenario Uji 2: Ekspor Laporan Profil Pekebun

1. Pada proposal yang sama, klik tombol **"Ekspor Data Pekebun ▾"**.
2. Pilih menu **"Laporan Profil Pekebun (.xlsx)"**.
3. Periksa berkas Excel yang terunduh:
   - Nama berkas: `Laporan_Profil_Pekebun_[NomorProposal]_[Tanggal].xlsx`
   - Header kolom memuat 10 kolom persis: `No`, `Nama Pekebun`, `NIK Pekebun`, `KK Pekebun`, `Alamat Pekebun`, `Jenis Legalitas`, `No / Nama Dokumen Legalitas Lahan`, `Tanggal Terbit Legalitas Lahan`, `Luas Lahan Sesuai Legalitas (Ha)`, `Luas Lahan (Ha)`.
   - Jika pekebun memiliki lebih dari 1 lahan, setiap lahan tercatat pada baris terpisah dengan data pekebun yang sesuai.
