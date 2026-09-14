# Research: Penambahan Kolom Tanggal dan Tahun Terbit Rekomtek pada Ekspor Data Ditjenbun & Excel Pekebun

**Feature Directory**: `specs/084-export-pekebun-rekomtek-date/`  
**Date**: 2026-09-14  
**Status**: Completed  

---

## 1. Technical Decisions & Research Findings

### Decision 1: Mekanisme Penyimpanan dan Resolusi Tanggal Terbit Rekomtek

- **Problem**: Dari mana sistem mendapatkan nilai tanggal terbit Rekomtek secara konsisten untuk proposal yang sedang/telah diproses di Ditjenbun?
- **Decision**: 
  1. **Primary Persistence saat Generate**: Saat verifikator menekan tombol generate draf Rekomtek (`handleDownloadRekomtekDraft` atau `handlePreviewRekomtekDraft`) pada `CekiDitjenbunView.vue`, sistem menyimpan timestamp saat itu ke properti `tanggal_rekomtek` (ISO 8601 string) pada state usulan dan dokumen Rekomtek terkait.
  2. **Multi-Source Resolution Fallback**: Saat mengekspor (baik Laporan Titik Koordinat, Profil Pekebun, maupun Daftar Proposal), utilitas penarikan data mengecek resolusi bertingkat (*graceful fallback*):
     - `proposal.tanggal_rekomtek` / `proposal.tanggalRekomtek` (tersimpan saat generate / submit Ditjenbun)
     - `proposal.rekomtek?.tanggalTerbit` / `proposal.rekomtek?.uploadedAt`
     - Timestamp `created_at` dari dokumen proposal bertipe `REKOMTEK`
  3. **Empty/Draft Fallback**: Apabila usulan belum pernah di-generate atau belum memiliki nomor/dokumen Rekomtek (misal usulan baru masuk dari Provinsi), nilai tanggal dan tahun terbit secara deterministik bernilai strip `-`.
- **Rationale**: Menjaga integritas data tanpa bergantung pada backend database migration baru jika belum dideploy, sekaligus mendukung persistensi reaktif di frontend Pinia store dan dokumen proposal.

---

### Decision 2: Susunan dan Pemetaan Kolom pada Laporan Excel Pekebun

- **Problem**: Bagaimana urutan kolom baru disisipkan agar format spasial dan profil tetap konsisten dengan format baku kementerian?
- **Decision**: Sesuai hasil klarifikasi (Option A):
  1. **Laporan Titik Koordinat (16 kolom)**:
     - Kolom 1-12: `No`, `Nomor Proposal`, `Provinsi`, `Kabupaten`, `Nama Kelembagaan Pekebun`, `Nama Pekebun`, `NIK Pekebun`, `Luas Lahan (Ha)`, `Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)`, `Nama Tertera di SHM`, `Nomor SHM`, `Nomor SKT/GIRIK/SPORADIK`.
     - **Kolom 13**: `Tanggal Terbit Rekomtek` (Format `DD-MM-YYYY` atau `-`)
     - **Kolom 14**: `Tahun Terbit Rekomtek` (Format `YYYY` numerik atau `-`)
     - Kolom 15-16: `Latitude`, `Longitude` (Format 8 desimal koordinat sudut poligon).
     - *Catatan*: Menempatkan kolom Rekomtek sebelum `Latitude` dan `Longitude` memastikan seluruh atribut administratif usulan berada di depan, sedangkan data koordinat spasial tetap berada di kolom paling akhir.
  2. **Laporan Profil Pekebun (12 kolom)**:
     - Kolom 1-10: `No`, `Nama Pekebun`, `NIK Pekebun`, `KK Pekebun`, `Alamat Pekebun`, `Jenis Legalitas`, `No / Nama Dokumen Legalitas Lahan`, `Tanggal Terbit Legalitas Lahan`, `Luas Lahan Sesuai Legalitas (Ha)`, `Luas Lahan (Ha)`.
     - **Kolom 11**: `Tanggal Terbit Rekomtek` (Format `DD-MM-YYYY` atau `-`)
     - **Kolom 12**: `Tahun Terbit Rekomtek` (Format `YYYY` numerik atau `-`)
- **Rationale**: Memenuhi spesifikasi bisnis Ditjenbun yang disepakati, menjaga struktur data tabular mudah dibaca dan diolah di Excel.

---

### Decision 3: Penyelarasan Penarikan Data Daftar Usulan Ditjenbun (`exportProposal.ts`)

- **Problem**: Pengguna menyebutkan "Ditjenbun, Data hasil penarikan perlu mencantumkan kolom tanggal dan tahun terbit Rekomtek".
- **Decision**: 
  - Pada berkas `src/utils/exportProposal.ts` (`exportProposalsToCsv` dan `exportProposalsToPdf`), kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` disisipkan berdampingan setelah kolom `No. Rekomtek`.
  - Header CSV menjadi: `No., Nomor Proposal, Nama Lembaga / Pemohon, Paket Sarpras, Total Anggaran, Status, No. Rekomtek, Tanggal Terbit Rekomtek, Tahun Terbit Rekomtek, Tanggal Pengajuan`.
  - Tabel print/PDF pada `ExportProposalModal` disesuaikan agar header dan barisnya turut menyajikan kedua kolom tersebut.
- **Rationale**: Memastikan istilah "Data hasil penarikan" Ditjenbun konsisten 100% di level daftar proposal maupun level rincian pekebun.

---

### Decision 4: Format XML Spreadsheet & Styling

- **Problem**: Bagaimana memastikan file hasil ekspor Excel tetap cepat, kompatibel di semua versi Excel, dan tidak menghasilkan error *corrupt file*?
- **Decision**: Tetap memanfaatkan engine `generateXmlSpreadsheet` yang sudah ada di `exportPekebunExcel.ts`:
  - `Tanggal Terbit Rekomtek`: menggunakan style `CenterCell` dengan type `String`.
  - `Tahun Terbit Rekomtek`: menggunakan style `CenterCell` dengan type `String` (atau `Number` jika tahun numerik valid).
  - Kolom width otomatis dihitung berdasarkan panjang header.
- **Rationale**: Format XML Spreadsheet (`urn:schemas-microsoft-com:office:spreadsheet`) telah terbukti sangat stabil, mendukung styling border/background/alignment, dan dapat dibuka native di MS Excel, Google Sheets, dan LibreOffice tanpa dependensi library eksternal berbobot besar.
