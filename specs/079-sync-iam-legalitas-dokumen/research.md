# Research & Technical Decisions: Sinkronisasi Dua Arah Dokumen Legalitas KP dan Surat Penunjukan Ketua (IAM ⇄ Sarpras)

**Feature**: `079-sync-iam-legalitas-dokumen`  
**Date**: 2026-09-09  
**Status**: Completed

---

## 1. Arsitektur Object Storage & Eliminasi Duplikasi Fisik

### Problem
Dokumen Legalitas Kelembagaan Pekebun (`legalitas_kp`) dan Surat Penunjukan Ketua (`penunjukan_ketua`) sudah diunggah oleh pemohon saat pendaftaran akun di IAM (`bpdp-iam-be`). Ketika pemohon mengajukan proposal di Sarpras (`bpdp-sarpras-kelapa-fe`), sistem Sarpras mewajibkan pemohon mencari dan mengunggah ulang file biner fisik dari komputer lokalnya. Hal ini menyebabkan duplikasi penyimpanan dan pengalaman pengguna yang buruk.

### Decision
Memanfaatkan shared object storage (MinIO/S3 compatible) yang sudah terkonfigurasi pada kedua layanan melalui `SERVICES_URL` dan `SERVICE_API_KEY`. Sarpras BE tidak mendownload atau mengunggah ulang binary fisik file, melainkan hanya menyalin metadata referensi `object_key` dari IAM ke tabel `file_uploads` lokal Sarpras.

### Rationale
- Baik `bpdp-iam-be` maupun `bpdp-sarpras-kelapa-be` memiliki struktur model `file_uploads` yang identik (memiliki kolom `object_key`, `store_name`, `filesize`, `extension`, `content_type`).
- Fungsi `FileService.PopulateURL(ctx, &file)` di Sarpras BE dapat langsung membuat Presigned URL resmi Sarpras asalkan kolom `object_key` terisi valid.
- 0 MB penambahan kapasitas penyimpanan fisik untuk dokumen yang disinkronkan.

### Alternatives Considered
- *Base64 Stream / Binary Transfer*: Sarpras BE mendownload stream biner dari IAM lalu mengunggahnya lagi ke storage service. (Ditolak: boros bandwidth, lambat, dan membuang kuota storage).
- *Frontend File Forwarding*: Browser meminta blob dari IAM lalu melemparnya via form upload multipart ke Sarpras. (Ditolak: boros bandwidth kuota internet pemohon dan tidak andal untuk koneksi lambat).

---

## 2. Pola Komunikasi Antar-Layanan (Service-to-Service)

### Problem
Bagaimana Sarpras BE dan IAM BE bertukar metadata dokumen secara aman, andal, dan tidak saling memblokir?

### Decision
Menggunakan **Internal REST API terproteksi** dengan header autentikasi `X-Internal-Secret`:
1. **Forward Sync (IAM ➔ Sarpras)**:
   `GET /api/v1/internal/kelembagaan/:id/documents`
   Dipanggil oleh Sarpras BE saat pemohon membuka draf proposal baru atau menekan tombol sinkronisasi.
2. **Reverse Sync (Sarpras ➔ IAM)**:
   `PATCH /api/v1/internal/kelembagaan/:id/documents`
   Dipanggil oleh Sarpras BE saat pemohon melakukan perbaikan/revisi dokumen di Sarpras untuk memperbarui profil master di IAM secara seketika (*immediate activation*).

### Rationale
- Pola REST API internal sangat terukur, mudah diuji, dan langsung mengembalikan status konfirmasi sinkronisasi.
- Autentikasi berbasis `X-Internal-Secret` (dibaca dari environment variable kedua backend) mencegah akses publik atau eksploitasi IDOR dari browser pengguna.

### Alternatives Considered
- *Message Broker (Kafka/RabbitMQ)*: Mengirim event asinkron. (Ditunda: Meskipun bagus, untuk kebutuhan MVP form interaktif di mana pemohon ingin langsung melihat dokumen terpasang, REST API memberikan respon synchronous instan yang lebih deterministik).

---

## 3. Kebijakan Aktivasi Reverse-Sync & Pencegahan Loop

### Problem
Kapan berkas yang direvisi di Sarpras resmi menggantikan berkas di IAM? Dan bagaimana mencegah *infinite sync loop* jika kedua sistem saling menyinkronkan data?

### Decision
- **Saat Revisi Usulan**: Ketika pemohon menekan tombol submit revisi di Sarpras, Sarpras BE langsung mengirim payload pembaruan ke IAM, dan IAM **segera mengaktifkan** berkas tersebut sebagai dokumen profil kelembagaan aktif.
- **Saat Draf Usulan Baru**: Jika pemohon mengunggah file manual saat proposal masih draf baru, perubahan HANYA disinkronkan ke IAM saat proposal berstatus `SUBMITTED`.
- **Pencegahan Infinite Loop**: Setiap panggilan membawa penanda `source_service: "SARPRAS_KELAPA"`. IAM tidak akan menerbitkan event sinkronisasi balik jika menerima penanda ini.
- **Resilience (Anti-Gagal)**: Jika server IAM mengalami kegagalan/timeout saat pemohon menekan submit di Sarpras, transaksi lokal Sarpras tetap berhasil, dan payload reverse-sync disimpan dalam tabel antrean lokal (`sync_outbox_queue`) untuk dicoba kirim ulang otomatis di latar belakang (*background worker*).

---

## 4. Penataan Slot Formulir Pengusulan (`StepUploadDokumen.vue`)

### Problem
Bagaimana penempatan Surat Penunjukan Ketua pada formulir pengusulan Sarpras yang saat ini hanya memiliki 4 slot?

### Decision
Menambahkan slot ke-5 tersendiri:
1. KTP Pengurus & Anggota
2. Kartu Keluarga (KK) Pekebun
3. Proposal Pengajuan Sarpras
4. Legalitas Kelembagaan / Akta (`AKTA_LEMBAGA`) ➔ Auto-sync dari IAM `legalitas_kp`
5. Surat Penunjukan Ketua / SK Pengurus (`PENUNJUKAN_KETUA`) ➔ Auto-sync dari IAM `penunjukan_ketua`

### Rationale
- Penempatan terpisah memberikan kejelasan hukum yang spesifik bagi verifikator dinas dalam memeriksa status legalitas badan hukum koperasi vs surat mandat kepengurusan ketua.
- Masing-masing dokumen memiliki status validasi, riwayat versi, dan catatan revisi independen.

---

## 5. Standar Penamaan File saat Diunduh (Feature 078 Alignment)

### Problem
Berkas asli di IAM memiliki nama beragam (misal `scan_akta_notaris.pdf`). Di sisi lain, Feature 078 mewajibkan penamaan file berstandar `[Nama-File]_[No-Proposal]_[Nama-Kelembagaan].[ext]`.

### Decision
Di database Sarpras, record `file_uploads` yang merujuk pada `object_key` IAM akan menyimpan `original_name` dan `filename` dengan format standar Sarpras:
- `Akta-Lembaga_SPKA109260001_Koperasi-Tani-Makmur.pdf`
- `Penunjukan-Ketua_SPKA109260001_Koperasi-Tani-Makmur.pdf`
Ketika `FileService.PopulateURL` membuat Presigned URL, parameter `response-content-disposition` akan menetapkan nama file standar tersebut, sehingga file yang diunduh verifikator seragam 100%.
