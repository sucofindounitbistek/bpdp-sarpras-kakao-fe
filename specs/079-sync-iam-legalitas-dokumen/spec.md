# Feature Specification: Sinkronisasi Dua Arah Dokumen Legalitas KP dan Surat Penunjukan Ketua (IAM ⇄ Sarpras)

**Feature Branch**: `079-sync-iam-legalitas-dokumen`  
**Created**: 2026-09-09  
**Status**: Draft  
**Input**: User description: "sinkronisasi file upload di iam dengan sarpras khususnya di file Legalitas KP dan Surat penunjukan ketua, mencakup alur pengusulan baru, revisi kedua dokumen, snapshot audit trail, dan reverse-sync dari Sarpras ke IAM"

---

## Clarifications

### Session 2026-09-09

- Q: Pada alur revisi kedua dokumen (Legalitas KP & Penunjukan Ketua) di Sarpras, kapan pembaruan berkas tersebut harus resmi aktif di profil master IAM? → A: Sinkronkan langsung ke IAM saat pemohon submit revisi usulan, dan langsung aktif sebagai dokumen profil IAM.
- Q: Jika pada tahap pengusulan usulan baru (Draf) pemohon memilih mengganti berkas Akta/SK Ketua dengan upload manual, kapan perubahan tersebut disinkronkan ke IAM? → A: Sinkronkan ke IAM hanya saat proposal resmi disubmit (SUBMITTED), agar draf usulan yang belum selesai/dibatalkan tidak mengotori data master IAM.
- Q: Bagaimana penempatan slot dokumen Surat Penunjukan Ketua pada tampilan formulir pengusulan Sarpras (StepUploadDokumen.vue)? → A: Tambahkan slot tersendiri: "5. Surat Penunjukan Ketua / SK Pengurus" di bawah slot Akta Legalitas.
- Q: Bagaimana penamaan berkas dari IAM saat diunduh atau dipratinjau dalam konteks usulan Sarpras? → A: Sajikan dengan nama standar Sarpras (misal: Akta-Lembaga_SPKA109260001_Koperasi-Makmur.pdf) saat diunduh/dipratinjau di Sarpras.
- Q: Jika akun Kelembagaan Pekebun belum memiliki berkas Legalitas atau SK Penunjukan Ketua di akun IAM mereka (misal akun lama), bagaimana kebijakan sistem Sarpras? → A: Berikan kebebasan: Izinkan pemohon mengunggah langsung di formulir Sarpras, lalu sistem yang otomatis menyinkronkannya ke IAM saat submit usulan.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pemohon Mengajukan Usulan Baru dengan Auto-Attach Dokumen dari IAM (Priority: P1) 🎯 MVP

Sebagai Pemohon (Kelembagaan Pekebun), saya ingin dokumen Akta Legalitas Kelembagaan (`legalitas_kp`) dan Surat Penunjukan Ketua (`penunjukan_ketua`) otomatis terpasang saat saya membuat usulan baru di Sarpras, sehingga saya tidak perlu mencari dan mengunggah ulang berkas biner berukuran besar yang sudah pernah saya unggah dan verifikasi saat pendaftaran akun di IAM.

**Why this priority**: Menghilangkan duplikasi pengunggahan berkas fisik (*zero redundant upload*), mempercepat pengisian usulan dari hitungan menit ke hitungan detik, serta menjamin integritas data awal antara profil master IAM dan usulan Sarpras.

**Independent Test**: Masuk sebagai Kelembagaan Pekebun yang memiliki dokumen legalitas dan SK ketua di IAM. Buka formulir pengusulan Sarpras pada langkah upload dokumen (`StepUploadDokumen.vue`). Sistem langsung menampilkan kartu berkas Akta Legalitas dan Surat Penunjukan Ketua dengan status "✓ Terverifikasi dari IAM", menampilkan nama berkas, dan menyediakan tombol pratinjau (Presigned URL) aktif tanpa menuntut upload manual.

**Acceptance Scenarios**:

1. **Given** Pemohon memiliki akun Kelembagaan Pekebun terdaftar di IAM dengan berkas `legalitas_kp` dan `penunjukan_ketua`,  
   **When** Pemohon membuka halaman Pengusulan Tahap Upload Dokumen di Sarpras,  
   **Then** Sistem Sarpras otomatis menampilkan kedua dokumen tersebut sebagai dokumen yang telah terunggah dan valid, tanpa mewajibkan upload ulang berkas fisik.
2. **Given** Dokumen dari IAM telah terpasang pada draf proposal,  
   **When** Pemohon mengklik tombol pratinjau pada dokumen tersebut,  
   **Then** Sistem menyajikan berkas PDF melalui Presigned URL resmi yang dapat dibuka dan dibaca.
3. **Given** Berkas di IAM belum dilengkapi oleh akun pemohon, atau koneksi API ke IAM sedang terputus,  
   **When** Pemohon membuka halaman pengusulan dokumen,  
   **Then** Sistem menampilkan form upload manual biasa (*graceful fallback*) dengan pesan panduan yang jelas sehingga pemohon tetap dapat melanjutkan usulan.

---

### User Story 2 - Penanganan Revisi pada Kedua Dokumen & Sinkronisasi Balik ke IAM (Priority: P2)

Sebagai Pemohon, ketika Verifikator Dinas menolak/meminta perbaikan atas kedua dokumen tersebut (Akta Legalitas KP dan Surat Penunjukan Ketua) pada tahap verifikasi, saya ingin dapat memperbaikinya secara langsung di Sarpras atau menarik pembaruan dari IAM, dan sistem secara otomatis memperbarui dokumen usulan (dengan riwayat versi) serta menyinkronkan berkas baru tersebut kembali ke master profil IAM (*reverse-sync*).

**Why this priority**: Menyelesaikan dinamika operasional di mana terjadi perombakan kepengurusan, perpanjangan SK, atau perbaikan akta notaris di tengah berjalannya usulan, sekaligus menjaga profil master IAM tetap mutakhir (*up-to-date*) tanpa mengharuskan pemohon login ke dua aplikasi berbeda.

**Independent Test**: Masuk sebagai pemohon pada usulan yang berstatus `REV_FROM_KAB` di mana kedua dokumen ditolak. Buka `RevisiProposalView.vue`. Unggah berkas perbaikan untuk Akta Legalitas dan SK Penunjukan Ketua baru. Submit revisi usulan. Pastikan di Sarpras kedua dokumen tercatat sebagai Versi 2 (versi 1 tersimpan di riwayat), dan di IAM profil kelembagaan otomatis terbarui merujuk pada berkas baru tersebut.

**Acceptance Scenarios**:

1. **Given** Verifikator menandai Dokumen Legalitas KP dan Surat Penunjukan Ketua sebagai "TIDAK SESUAI" dengan catatan perbaikan,  
   **When** Pemohon membuka halaman `RevisiProposalView.vue`,  
   **Then** Tampil kotak peringatan bahwa kedua dokumen memerlukan perbaikan, menampilkan catatan verifikator, berkas lama (Versi 1) yang ditolak, dan slot tindakan perbaikan.
2. **Given** Pemohon telah memperbarui kedua dokumen di akun IAM terlebih dahulu,  
   **When** Pemohon menekan tombol "🔄 Sinkronkan Seluruh Dokumen dari IAM",  
   **Then** Sistem Sarpras mendeteksi kedua berkas baru dari IAM, menampilkan dialog perbandingan berkas lama vs baru, dan memperbarui kedua dokumen usulan menjadi Versi 2 secara serentak.
3. **Given** Pemohon mengunggah berkas perbaikan kedua dokumen langsung di halaman revisi Sarpras,  
   **When** Pemohon menekan tombol "Submit Perbaikan Usulan",  
   **Then** Sarpras menyimpan dokumen baru sebagai Versi 2, dan Sarpras BE secara otomatis memanggil API internal IAM BE untuk memperbarui referensi dokumen master di IAM (*reverse sync*) dengan penanda `source_service: "SARPRAS_KELAPA"`.
4. **Given** Terjadi kegagalan sementara (*timeout/downtime*) pada server IAM saat *reverse sync*,  
   **When** Pemohon menekan submit perbaikan di Sarpras,  
   **Then** Usulan di Sarpras tetap berhasil disubmit, dan payload sinkronisasi ke IAM disimpan ke dalam antrean percobaan ulang (*retry queue*) tanpa memblokir proses pemohon.

---

### User Story 3 - Peninjauan Riwayat Versi Dokumen oleh Verifikator (Priority: P3)

Sebagai Verifikator (Dinas Kabupaten, Ditjenbun, BPDPKS), saya ingin dapat melihat berkas versi terbaru sekaligus membandingkannya dengan berkas versi lama yang sebelumnya ditolak beserta catatan tanggapan pemohon, sehingga keputusan persetujuan dapat diambil secara objektif dan akuntabel.

**Why this priority**: Menjamin kepatuhan audit tata kelola pemerintahan dan mempermudah verifikator memvalidasi apakah catatan perbaikan yang diminta pada tahap sebelumnya sudah dipenuhi dengan benar.

**Independent Test**: Masuk sebagai Verifikator Dinas Kabupaten. Buka proposal usulan revisi. Pada tabel dokumen kelembagaan, periksa label "Versi 2 (Revisi)", buka tombol "Bandingkan Riwayat Versi 1", dan pastikan berkas baru serta catatan tanggapan pemohon tampil dengan jelas.

**Acceptance Scenarios**:

1. **Given** Proposal usulan revisi masuk ke antrean verifikator,  
   **When** Verifikator membuka tab dokumen proposal,  
   **Then** Dokumen Akta Legalitas dan SK Penunjukan Ketua menampilkan indikator "Versi 2" dan tautan untuk membuka riwayat "Versi 1 (Ditolak)".
2. **Given** Verifikator mengklik tombol riwayat versi sebelumnya,  
   **When** Modal riwayat terbuka,  
   **Then** Sistem menyajikan perbandingan nama berkas V1, alasan penolakan terdahulu, nama berkas V2, dan catatan klarifikasi pemohon.
3. **Given** Berkas V2 telah memenuhi seluruh persyaratan hukum,  
   **When** Verifikator mengklik "Setujui Dokumen",  
   **Then** Status dokumen berubah menjadi "SESUAI" dan proposal dapat dilanjutkan ke tahap verifikasi berikutnya.

---

### Edge Cases

- **Immutability of Historical Approved Proposals**: Proposal yang sudah berstatus disetujui final (SK Dirut terbit) mengunci seluruh dokumennya sebagai *immutable snapshot*. Pembaruan profil di IAM di masa depan TIDAK BOLEH mengubah arsip dokumen usulan masa lalu. Jika ketua berganti saat serah terima barang, dokumen baru dicatat pada modul Penyaluran/BAST.
- **Infinite Sync Loop Prevention**: Komunikasi sinkronisasi dua arah wajib memuat penanda asal layanan (`source_service: "SARPRAS_KELAPA"` atau `"IAM"`). Ketika IAM menerima update dari Sarpras, IAM tidak boleh memicu event sinkronisasi balik ke Sarpras.
- **Shared Object Storage No-Hard-Delete Policy**: Karena kedua sistem berbagi MinIO/S3 object storage (`SERVICES_URL`), operasi penggantian berkas di IAM maupun Sarpras HANYA melakukan *soft-delete* atau pembuatan record baru dengan `object_key` UUID baru. File biner fisik tidak boleh di-hard delete agar tidak merusak referensi pada proposal yang sedang berjalan (*dangling reference*).
- **Tenant Isolation & IDOR Protection**: Endpoint internal pertukaran dokumen antar-layanan wajib dilindungi dengan `X-Internal-Secret` untuk komunikasi *backend-to-backend*, dan endpoint berbasis pengguna wajib memvalidasi kecocokan `kelembagaan_id` dengan token JWT pemohon aktif.

---

## Requirements *(mandatory)*

### Functional Requirements

#### A. Layanan IAM (`bpdp-iam-be`)
- **FR-001**: `bpdp-iam-be` MUST menyediakan endpoint internal aman `GET /api/v1/internal/kelembagaan/:id/documents` untuk mengembalikan metadata dokumen profil (`legalitas_kp` dan `penunjukan_ketua`), mencakup `upload_name`, `object_key`, `original_name`, `filesize`, dan `content_type`.
- **FR-002**: `bpdp-iam-be` MUST menyediakan endpoint internal aman `PATCH /api/v1/internal/kelembagaan/:id/documents` untuk menerima pembaruan berkas dari Sarpras (*reverse sync*).
- **FR-003**: `bpdp-iam-be` MUST memvalidasi header `X-Internal-Secret` pada seluruh komunikasi API internal service-to-service.
- **FR-004**: Saat menerima pembaruan dari Sarpras dengan penanda `source_service: "SARPRAS_KELAPA"`, IAM MUST segera mengaktifkan dokumen tersebut sebagai dokumen profil kelembagaan aktif tanpa menunggu verifikasi dinas, dan MUST NOT memicu event sinkronisasi rekursif kembali ke Sarpras.
- **FR-005**: `bpdp-iam-be` MUST mencatat entri `audit_logs` ketika dokumen kelembagaan diperbarui melalui alur usulan Sarpras.

#### B. Layanan Sarpras Backend (`bpdp-sarpras-kelapa-be`)
- **FR-006**: `bpdp-sarpras-kelapa-be` MUST menyediakan *IAM Client* untuk mengambil metadata dokumen kelembagaan saat inisialisasi draf usulan baru.
- **FR-007**: `bpdp-sarpras-kelapa-be` MUST mendaftarkan referensi `object_key` dari berkas IAM ke dalam tabel `file_uploads` Sarpras tanpa menduplikasi data biner di MinIO/S3, dengan menyimpan atribut `filename` / `original_name` mengikuti format standar Sarpras (`[Nama-File]_[No-Proposal]_[Nama-Kelembagaan].[ext]`).
- **FR-008**: `bpdp-sarpras-kelapa-be` MUST menghasilkan Presigned URL yang valid melalui `FileService.PopulateURL` untuk dokumen yang bersumber dari IAM dengan `Content-Disposition filename` yang menggunakan nama standar Sarpras.
- **FR-009**: Saat proposal disubmit secara resmi (`status = SUBMITTED`), Sarpras BE MUST mengunci referensi dokumen sebagai *immutable snapshot* bagi usulan tersebut.
- **FR-010**: Pada alur revisi usulan, Sarpras BE MUST mendukung *document versioning* (`version = 2`, `is_active = true`), menandai berkas terdahulu sebagai `SUPERSEDED`, dan menyimpan alasan perbaikan.
- **FR-011**: Saat pemohon mengunggah berkas revisi di Sarpras dan menekan submit revisi, Sarpras BE MUST segera memanggil endpoint internal IAM untuk memperbarui profil master (*immediate reverse sync*), dilengkapi mekanisme antrean coba-ulang (*retry queue*) jika IAM tidak merespons seketika.

#### C. Antarmuka Pengguna Sarpras (`bpdp-sarpras-kelapa-fe`)
- **FR-012**: `StepUploadDokumen.vue` MUST menyediakan slot khusus bernomor "4. Legalitas Kelembagaan / Akta" dan "5. Surat Penunjukan Ketua / SK Pengurus" yang secara otomatis mendeteksi keberadaan berkas dari IAM, menampilkan status "Terverifikasi dari IAM", tombol pratinjau, dan meniadakan kewajiban upload fisik ulang.
- **FR-013**: `StepUploadDokumen.vue` MUST tetap menyediakan opsi upload manual sebagai alternatif atau *fallback* jika berkas di IAM belum tersedia atau pemohon ingin menggantinya; Sarpras MUST TIDAK memblokir pengusulan, dan pembaruan/pengisian pertama ke master IAM atas berkas manual tersebut HANYA akan disinkronkan saat proposal resmi berstatus `SUBMITTED`.
- **FR-014**: `RevisiProposalView.vue` MUST menampilkan status perbaikan untuk kedua dokumen secara jelas, menyediakan tombol *"🔄 Sinkronkan Seluruh Dokumen dari IAM"*, serta slot upload manual per dokumen.
- **FR-015**: Halaman verifikasi dinas MUST menampilkan nomor versi dokumen aktif, badge sumber data ("IAM" vs "Manual"), dan tautan untuk melihat riwayat versi dokumen sebelumnya yang ditolak.

---

### Key Entities

- **IAM Kelembagaan Document**: Entitas metadata berkas di IAM (`kelembagaan_pekebun_uploads` & `file_uploads`) yang merepresentasikan dokumen resmi profil lembaga di object storage bersama.
- **Sarpras Proposal Document**: Entitas relasi di Sarpras (`dokumen_proposals`) yang mengikat proposal dengan berkas, dilengkapi atribut `version` (integer), `is_active` (boolean), `source` (`IAM_SYNC` / `MANUAL_UPLOAD`), `review_status`, dan `review_notes`.
- **Sync Payload**: Objek transfer data antar-layanan yang membawa `source_service`, `proposal_number`, daftar dokumen (`upload_name`, `object_key`, `original_name`, `filesize`, `content_type`), dan stempel waktu.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% pemohon Kelembagaan Pekebun yang telah mengunggah Akta Legalitas dan Surat Penunjukan Ketua di IAM dapat mengajukan proposal di Sarpras tanpa perlu mengunggah ulang berkas fisik tersebut.
- **SC-002**: Waktu pengisian tahap upload dokumen legalitas terpangkas hingga <10 detik pada pengusulan baru.
- **SC-003**: 0 MB duplikasi berkas fisik biner di object storage MinIO/S3 untuk seluruh berkas yang disinkronkan antara IAM dan Sarpras.
- **SC-004**: Konsistensi data 100%: Berkas revisi yang diunggah di Sarpras ter-update ke profil master IAM dalam waktu <5 detik (atau segera setelah antrean retry sukses dieksekusi).
- **SC-005**: 100% proposal yang sudah disetujui (SK Dirut) terlindungi secara permanen dan tidak mengalami perubahan dokumen meskipun profil ketua di IAM berganti di kemudian hari.
- **SC-006**: Tingkat keberhasilan pengajuan usulan 100% terjamin melalui *graceful fallback* manual upload meskipun server IAM sedang tidak dapat dijangkau.

---

## Assumptions

1. Layanan Object Storage (MinIO/S3) yang digunakan oleh `bpdp-iam-be` dan `bpdp-sarpras-kelapa-be` adalah instans bersama yang diakses melalui variabel konfigurasi `SERVICES_URL` dan `SERVICE_API_KEY`.
2. Akta Legalitas Kelembagaan di IAM (`upload_name = 'legalitas_kp'`) dipetakan ke persyaratan dokumen Sarpras `AKTA_LEMBAGA`.
3. Surat Penunjukan Ketua di IAM (`upload_name = 'penunjukan_ketua'`) dipetakan ke persyaratan dokumen Sarpras `PENUNJUKAN_KETUA`.
4. Komunikasi *backend-to-backend* antara Sarpras BE dan IAM BE dilakukan dalam jaringan internal yang aman dengan autentikasi berbasis secret key / token.
