# Research: Standarisasi Auto-Rename Upload File

**Feature**: `078-auto-rename-upload-file`  
**Date**: 2026-09-09  
**Status**: Complete  

## 1. Context & Problem Statement

Pada aplikasi BPDP Sarpras Kelapa, berbagai peran pengguna (Pemohon/Kelembagaan Pekebun, Dinas Kabupaten, Dinas Provinsi, Ditjenbun, BPDPKS, dan Penyalur) mengunggah puluhan jenis berkas penting (KTP, proposal, RAB, legalitas lahan, SK CPCL, Rekomtek, SK Dirut, BAST, foto gudang, dsb.). Saat ini, berkas yang diunggah menggunakan nama asli dari komputer lokal pengguna yang sering kali acak (misal `Scan_001.pdf`, `IMG_2026.jpg`, `draft(1).pdf`), sehingga menyulitkan proses verifikasi, audit, pengarsipan, dan unduhan berkas lintas instansi.

Kebutuhan bisnis menginginkan standarisasi nama berkas otomatis saat berkas diunggah:
```text
[Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[ext]
```

## 2. Research Decisions & Rationale

### Decision 1: Mekanisme Auto-Rename di Sisi Klien (Frontend Client-Side File Proxy)
- **Keputusan**: Auto-rename dilakukan secara langsung di sisi frontend pada saat berkas dipilih melalui event file input, dengan merekonstruksi objek `File` JavaScript (`new File([originalFile], standardizedName, { type: originalFile.type })`).
- **Rasional**:
  - Browser web secara standar mengirimkan atribut `filename` pada header multipart `Content-Disposition` sesuai dengan properti `file.name`.
  - Backend `bpdp-sarpras-kelapa-be` (dan service penyimpanan berkas) membaca `header.Filename` sebagai `original_name` dan `filename` entitas `file_uploads`.
  - Memberikan feedback visual instan (< 100ms) pada kartu pratinjau `FileUpload.vue` sehingga pengguna langsung melihat nama berkas standar sebelum menekan tombol kirim/unggah.
- **Alternatif yang Ditolak**:
  - *Rename hanya di backend*: Ditolak karena pengguna di antarmuka tidak melihat nama standar saat memilih berkas, dan rawan ketidaksinkronan konteks kelembagaan jika backend tidak menerima metadata kelembagaan secara eksplisit pada setiap request unggah berkas generik (`/files/upload`).

### Decision 2: Ekstraksi Token dan Format Penomoran Proposal
- **Keputusan**: Format nomor proposal mengadopsi standar resmi sistem sarpras yang telah aktif, yaitu `SPKA{kode_penomoran}{MM}{YY}{sequence:04d}` (contoh: `SPKA109260001` atau `SPKA209260001`).
- **Rasional**:
  - Format ini 100% alfanumerik tanpa karakter ilegal filesystem (seperti garis miring `/`), sehingga sangat aman untuk penyimpanan berkas dan S3/MinIO storage.
  - Untuk proposal yang masih dalam tahap awal draf pengusulan baru (Step 1 - Step 3) sebelum nomor resmi diterbitkan, sistem menyematkan placeholder standar `DRAFT`.

### Decision 3: Sanitasi String dan Pemisahan Segmen Token
- **Keputusan**:
  - Pemisah antar 3 blok utama menggunakan garis bawah (`_`): `[Nama-File]_[No-Proposal]_[Nama-Kelembagaan].[ext]`.
  - Spasi kata di dalam masing-masing segmen dikonversi menjadi tanda hubung (`-`), misal `Koperasi-Tani-Makmur`.
  - Karakter non-alfanumerik berbahaya (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`, `%`, `#`) dibersihkan atau diganti dengan `-`.
  - Batas panjang maksimal nama berkas dibatasi 180 karakter untuk mencegah kegagalan sistem berkas OS atau S3 key limits, dengan memotong nama kelembagaan jika berlebih tanpa merusak nomor proposal dan ekstensi berkas.
- **Rasional**: Menjaga integritas parsing berkas jika berkas diekspor atau diunduh oleh auditor.

### Decision 4: Penanganan Slot Unggahan Multi-Berkas (Sub-Label)
- **Keputusan**: Mengintegrasikan sub-label spesifik dari input form ke dalam segmen `[Nama File]`, contoh:
  - `Foto-Gudang-Depan_SPKA109260001_Koperasi-Tani-Makmur.jpg`
  - `Foto-Gudang-Dalam_SPKA109260001_Koperasi-Tani-Makmur.jpg`
  - `Legalitas-Lahan-Bidang-1_SPKA109260001_Koperasi-Tani-Makmur.pdf`
- **Rasional**: Mencegah tabrakan nama file (*collision*) ketika beberapa berkas berada di dalam satu grup kategori yang sama.

### Decision 5: Arsitektur Utilitas Terpusat Sesuai Konstitusi FE
- **Keputusan**: Mengimplementasikan logika pemformatan nama berkas di modul utilitas tunggal `src/utils/fileNaming.ts` dan mengintegrasikannya ke komponen `src/components/ui/FileUpload.vue` serta form upload langsung.
- **Rasional**: Memenuhi Prinsip Konstitusi V (Strict Anti-Redundancy & Single Source of Truth). Seluruh komponen dan view yang membutuhkan auto-rename memanggil helper yang sama.
