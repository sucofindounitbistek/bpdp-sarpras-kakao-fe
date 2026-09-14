# Feature Specification: Penyelarasan Alur Modul Penyaluran Barang (SOP Swimlane)

**Feature Branch**: `056-penyaluran-barang-swimlane-alignment`

**Created**: 2026-08-31

**Status**: Ready for Planning / Aligned

**Input**: User description: "nah kemudian lanjut ke BPDP Teknis, dia menerima pengajuan yaitu Menerima Surat Permohonan Pengadaan Barang dan mengecek iya atau tidak kalau iya lanjut BPDP Teknis Mengupload Nota Dinas dan ada button mengirim ke BPDP PPK, jika ditolak balik lagi di proses Draft. Kemudian ketika di BPDP PPK dia menerima hasil pengajuan dari BPDP Teknis dan PPK hanya meriview kemudian dilanjutkan lagi ke BPDP ULP"

---

## Clarifications

### Session 2026-08-31
- Q: Apakah pembuatan data Permohonan Penyaluran Barang oleh Kelembagaan Pekebun harus memilih Proposal Sarpras yang sudah berstatus SK Dirut atau dapat diisi mandiri? → A: Model Hybrid — Pekebun dapat memilih dari daftar Proposal Sarpras yang telah disetujui (SK Dirut / SPKA) untuk menarik otomatis data legalitas & RAB, atau mengisi permohonan secara mandiri.
- Q: Bagaimana Dokumen Kontrak "A" diterbitkan jika dalam 1 permohonan terdapat lebih dari 1 item barang yang dimenangkan oleh vendor? → A: Single Kontrak Terkonsolidasi (1 Dokumen Kontrak SPK mencakup seluruh rincian item barang paket sarpras dan mengakumulasi total nilai kontrak).
- Q: Aksi operasional apa yang disediakan di dalam sistem untuk pengguna dengan peran SURVEYOR saat menerima paket tugas? → A: View-Only Antrean Penugasan — Surveyor dapat melihat daftar penugasan dan mengunduh berkas surat tugas, sedangkan penyelesaian administrasi & BASTP dikelola oleh BPDP Teknis.
- Q: Apakah data preferensi RAB pada modal pengajuan permohonan penyaluran barang bersifat read-only atau dapat diubah oleh pekebun? → A: Terkunci (Read-Only) — Data rincian RAB ditarik langsung secara otomatis dari proposal yang disetujui (SK Dirut/SPKA) dan dikunci dalam mode review read-only agar konsisten dengan pagu dan volume teknis pengusulan sarpras.
- Q: Bagaimana alur perbaikan yang disediakan bagi pekebun saat membuka modal permohonan berstatus "PERLU_REVISI" atau dikembalikan? → A: Akses Penuh Modal Revisi — Sistem menampilkan banner catatan perbaikan verifikator di bagian atas modal, tombol unduh draft PDF, fasilitas ganti/unggah ulang file PDF surat bertandatangan, serta tombol aksi "Kirim Ulang Permohonan Perbaikan" di modal yang sama.
- Q: Bagaimana verifikasi BPDP Teknis dan pengiriman ke PPK berjalan? → A: BPDP Teknis menerima surat permohonan pekebun (Konektor 1), melakukan pengecekan (Iya/Tidak). Jika **Tidak**, pengajuan dikembalikan ke status `DRAFT` (dengan catatan perbaikan). Jika **Ya**, BPDP Teknis mengunggah berkas **Nota Dinas** Direktur Teknis dan menekan tombol **"Kirim ke BPDP PPK"** (Konektor 2).
- Q: Bagaimana mekanisme penyediaan berkas dan data Nota Dinas di dalam modal verifikasi BPDP Teknis? → A: Upload Berkas PDF Nota Dinas saja — Modal verifikasi menyediakan area upload file PDF Nota Dinas Direktur Teknis (maks 5 MB) tanpa perlu menginput field teks nomor atau tanggal terpisah.
- Q: Apa peran BPDP PPK pada tahap penerimaan Nota Dinas dan bagaimana tombol aksinya? → A: Review & Satu Tombol Universal — BPDP PPK menerima berkas permohonan & Nota Dinas dari BPDP Teknis, me-review dokumen, lalu menekan tombol aksi "Kirim ke BPDP ULP" / "Lanjutkan ke BPDP ULP" untuk menginformasikan/mendisposisikan paket pengadaan ke **BPDP ULP** (Konektor 3).
- Q: Bagaimana alur interaksi dan tombol aksi di sisi BPDP-ULP? → A: Ubah Status & Tombol Selesai dengan Dialog Konfirmasi — BPDP ULP menerima tiket dari PPK (Konektor 3), menekan tombol "Mulai Pemilihan Penyedia" untuk mengubah status ke `PROSES_PEMILIHAN_PENYEDIA` saat tender e-catalog dimulai di luar aplikasi. Setelah tender selesai di luar aplikasi, BPDP ULP menekan tombol "Selesai" yang memunculkan dialog konfirmasi penyelesaian sebelum mengalirkan tiket ke **BPDP Teknis** sebagai `PENETAPAN_PEMENANG` (Konektor 4).
- Q: Bagaimana penempatan form input Dokumen Kontrak di BPDP Teknis? → A: Langsung di Panel Detail (Tanpa Modal Bertumpuk) & Wording "Dokumen Kontrak" — Form input 10 atribut data kontrak dan dropzone upload PDF kontrak disematkan langsung di dalam panel detail permohonan di bawah tabel RAB saat status `PENETAPAN_PEMENANG`, menggunakan judul "Dokumen Kontrak" (tanpa huruf "A"), dan tombol aksi bertuliskan "Proses Pelaksanaan Kontrak" untuk beralih ke `PROSES_PELAKSANAAN_KONTRAK` (Konektor 5).

---

## 1. Executive Summary & Analisis Kesesuaian Alur (Swimlane Alignment Matrix)

Berdasarkan evaluasi terhadap SOP Swimlane Penyaluran Barang Sarpras Kelapa dan implementasi sistem saat ini di antarmuka web, berikut adalah ringkasan hasil audit kesesuaian:

| Swimlane / Aktor | Tahapan SOP Bisnis | Status Kesesuaian di Sistem | Detail Implementasi & Komponen |
| :--- | :--- | :--- | :--- |
| **Kelembagaan Pekebun** | 1. Masuk menu Penyaluran Barang | ✅ **SESUAI** | Route `/penyaluran-barang/pemohon` di `PekebunPermohonanBarangView.vue` |
| | 2. Input data permohonan & preferensi RAB (Jenis, Nama Barang, Varietas, Jumlah per Item, Satuan) | ✅ **SESUAI** | Form di `PekebunFormPermohonanView.vue` & `ItemRabFormTable.vue` mencakup seluruh atribut preferensi RAB |
| | 3. Download format surat permohonan pengadaan barang resmi | ✅ **SESUAI** | Fitur PDF Generator instan di `utils/permohonanPdfGenerator.ts` |
| | 4. Upload berkas surat permohonan bertandatangan (PDF) | ✅ **SESUAI** | Komponen upload dokumen bertandatangan basah |
| | 5. Transisi ke **[Konektor 1]** (Menunggu Verifikasi Tim Teknis) | ✅ **SESUAI** | Status otomatis `MENUNGGU_VERIFIKASI_TEKNIS` masuk ke antrean Verifikator |
| **BPDP-TEKNIS** | 1. Menerima surat permohonan dari **[Konektor 1]** | ✅ **SESUAI** | Antrean di `BpdpVerifikatorBarangView.vue` |
| | 2. Verifikasi/Cek (Iya / Tidak): Jika **Tidak**, kembali ke Pekebun sebagai **DRAFT** | ✅ **SESUAI** | Dialog verifikasi mengembalikan status ke `DRAFT` / `PERLU_REVISI` dengan catatan verifikator |
| | 3. Jika **Ya**, Upload **Nota Dinas** & Kirim ke PPK via **[Konektor 2]** | ✅ **SESUAI** | Upload PDF Nota Dinas Direktur Teknis & tombol "Kirim ke BPDP PPK" mengubah status ke `DISPOSISI_PPK` |
| | 4. Menerima hasil tender dari **[Konektor 4]** & pembuatan kontrak vendor di luar aplikasi | ✅ **SESUAI** | Masuk ke antrean `PENETAPAN_PEMENANG` / Siap Kontrak |
| | 5. Input & upload data kontrak **Dokumen "A"** (10 atribut wajib) | ✅ **SESUAI** | Modal `DokumenKontrakModal.vue` berisi lengkap 10 poin input & upload PDF |
| | 6. Ubah status ke "Proses Pelaksanaan Kontrak" & terbitkan surat sampling ke Surveyor via **[Konektor 5]** | ✅ **SESUAI** | Modal `SuratTugasSurveyorModal.vue` mengubah status ke `PROSES_PELAKSANAAN_KONTRAK` / `SURVEYOR_DITUGASKAN` |
| **BPDP-PPK** | 1. Menerima surat permohonan & Nota Dinas dari **[Konektor 2]** | ✅ **SESUAI** | Antrean di `BpdpPpkBarangView.vue` |
| | 2. Review rincian & berkas Nota Dinas | ✅ **SESUAI** | Panel detail menampilkan viewer berkas surat permohonan pekebun dan Nota Dinas BPDP Teknis |
| | 3. Menginformasikan pengadaan barang kepada ULP via **[Konektor 3]** (Aturan < 200 juta langsung ke Pejabat Pengadaan) | ✅ **SESUAI** | Modal disposisi PPK meneruskan status ke `DISPOSISI_ULP` / Pejabat Pengadaan |
| **BPDP-ULP** | 1. Menerima disposisi dari **[Konektor 3]** | ✅ **SESUAI** | Antrean di `BpdpUlpBarangView.vue` |
| | 2. Pelaksanaan tender di e-catalog & update status ke "Proses Pemilihan Penyedia" | ✅ **SESUAI** | Aksi "Mulai Pemilihan Penyedia" mengubah status ke `PROSES_PEMILIHAN_PENYEDIA` |
| | 3. Pemilihan/penetapan pemenang tender (di luar aplikasi) & Klik Selesai via **[Konektor 4]** | ✅ **SESUAI** | Modal `TenderUlpModal.vue` menginput nama vendor pemenang, nilai tender, dan beralih ke Verifikator |
| **SURVEYOR** | Menerima penugasan sampling & monitoring lapangan via **[Konektor 5]** | ✅ **SESUAI** | Antrean di `SurveyorBarangView.vue` untuk pemantauan fisik mutu barang & BASTP |

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - Pengajuan Permohonan Penyaluran Barang dari Daftar Proposal oleh Kelembagaan Pekebun (Priority: P1)

Sebagai Pengurus Lembaga Pekebun, ketika saya membuka menu *Penyaluran Barang*, saya ingin melihat daftar proposal pengusulan sarpras yang telah selesai diverifikasi/disetujui, memilih proposal untuk diajukan dengan menekan tombol *Ajukan Penyaluran*, melihat review hasil preferensi RAB barang (Jenis barang, Nama Barang, Varietas, Jumlah per Item, Satuan), mengunduh format surat permohonan pengadaan barang (PDF), dan mengunggah kembali surat yang telah ditandatangani **di dalam modal yang sama**, lalu mengirimkan permohonan ke BPDP Teknis (Konektor 1).

**Acceptance Scenarios**:
1. **Given** Pengurus Pekebun berada di halaman Penyaluran Barang (`/penyaluran-barang/pemohon`), **When** halaman dimuat, **Then** sistem menampilkan daftar proposal sarpras yang dimiliki kelembagaan pekebun dengan tombol aksi *Ajukan Penyaluran* (untuk proposal yang siap diajukan) dan tombol *Detail* (untuk permohonan yang sudah berjalan).
2. **Given** Pengurus Pekebun menekan tombol *Ajukan Penyaluran* pada proposal, **When** modal terbuka, **Then** sistem menampilkan review rincian hasil preferensi RAB barang yang memuat kolom Jenis Barang, Nama Barang, Varietas, Jumlah per Item (Tahap 1, Tahap 2, dan Total), Satuan, Estimasi Harga Satuan & Total Biaya.
3. **Given** Modal pengajuan terbuka, **When** pengguna mengklik tombol *Download Format Surat Permohonan*, **Then** sistem men-generate dan mengunduh berkas PDF resmi surat permohonan pengadaan barang.
4. **Given** Surat permohonan PDF telah ditandatangani dan dicap oleh ketua lembaga, **When** pengguna mengunggah berkas PDF di dalam modal yang sama dan menekan tombol *Kirim Permohonan ke BPDP*, **Then** sistem memvalidasi kelengkapan berkas, menyimpan permohonan, memperbarui status menjadi `MENUNGGU_VERIFIKASI_TEKNIS` (Konektor 1), dan menutup modal.

---

### User Story 2 - Verifikasi Teknis, Cek Iya/Tidak, Upload Nota Dinas & Pengiriman ke BPDP PPK (Priority: P1)

Sebagai Tim BPDP Teknis (Verifikator), ketika menerima berkas surat permohonan pengadaan barang dari pekebun (Konektor 1), saya ingin melakukan verifikasi kelayakan (Cek: Iya atau Tidak). Jika permohonan dinilai **Tidak Layak / Perlu Perbaikan**, saya ingin mengembalikannya ke status **DRAFT** agar dapat diperbaiki oleh pekebun. Jika **Layak / Iya**, saya ingin mengunggah berkas **Nota Dinas Direktur Teknis** dan menekan tombol **"Kirim ke BPDP PPK"** untuk meneruskan permohonan ke BPDP PPK (Konektor 2).

**Why this priority**: Memastikan dasar hukum administrasi pengadaan terpenuhi melalui penerbitan Nota Dinas resmi Direktur Teknis ke PPK.

**Independent Test**: Buka `/penyaluran-barang/verifikator`, pilih permohonan berstatus `MENUNGGU_VERIFIKASI_TEKNIS`, uji skenario penolakan (status kembali ke `DRAFT`), dan uji skenario persetujuan (unggah Nota Dinas PDF, klik Kirim ke PPK, status berubah menjadi `DISPOSISI_PPK`).

**Acceptance Scenarios**:
1. **Given** Permohonan berstatus `MENUNGGU_VERIFIKASI_TEKNIS`, **When** BPDP Teknis memilih keputusan "Tidak" (Tolak / Perlu Revisi) dan memasukkan catatan perbaikan, **Then** sistem memperbarui status permohonan kembali menjadi `DRAFT` (atau `PERLU_REVISI`) dan menampilkan catatan verifikator pada modal pekebun.
2. **Given** Permohonan berstatus `MENUNGGU_VERIFIKASI_TEKNIS`, **When** BPDP Teknis memilih keputusan "Ya" (Setuju), **Then** sistem menampilkan form upload berkas **Nota Dinas** (PDF maks 5 MB) serta input nomor dan tanggal Nota Dinas.
3. **Given** Berkas Nota Dinas telah diunggah dan nomor nota dinas diisi, **When** BPDP Teknis menekan tombol **"Kirim ke BPDP PPK"**, **Then** sistem menyimpan berkas Nota Dinas, mengubah status permohonan menjadi `DISPOSISI_PPK` (Konektor 2), dan meneruskannya ke antrean BPDP PPK.

---

### User Story 3 - Review Pengajuan & Disposisi Pengadaan oleh BPDP PPK ke BPDP ULP (Priority: P1)

Sebagai BPDP PPK, ketika menerima surat permohonan dan Nota Dinas dari BPDP Teknis (Konektor 2), saya ingin me-review seluruh rincian permohonan, memeriksa berkas surat permohonan dan berkas Nota Dinas, kemudian meneruskan / menginformasikan pengadaan barang kepada **BPDP ULP** (Konektor 3) atau Pejabat Pengadaan jika nilai paket di bawah 200 juta rupiah.

**Why this priority**: Menjembatani mandat pengadaan dari Pejabat Pembuat Komitmen (PPK) ke Unit Layanan Pengadaan (ULP).

**Independent Test**: Buka `/penyaluran-barang/ppk`, pilih permohonan berstatus `DISPOSISI_PPK`, review berkas Nota Dinas dan rincian barang, pilih jalur ULP / Pejabat Pengadaan, lalu klik *Kirim ke BPDP ULP*. Status berubah menjadi `DISPOSISI_ULP`.

**Acceptance Scenarios**:
1. **Given** Permohonan berstatus `DISPOSISI_PPK` masuk di antrean PPK, **When** PPK membuka detail permohonan, **Then** sistem menyajikan preview ringkasan permohonan, tabel preferensi RAB, tautan unduh/lihat berkas Surat Permohonan Pekebun, dan tautan unduh/lihat berkas **Nota Dinas BPDP Teknis**.
2. **Given** PPK telah menelaah berkas pengajuan, **When** PPK menekan tombol **"Disposisikan ke BPDP ULP"**, **Then** sistem menampilkan dialog konfirmasi pengadaan dengan opsi jalur tender ULP (default) atau Pengadaan Langsung (jika nilai paket < Rp 200.000.000).
3. **Given** PPK mengonfirmasi disposisi, **When** tombol submit diklik, **Then** sistem memperbarui status permohonan menjadi `DISPOSISI_ULP` (Konektor 3) dan meneruskannya ke dashboard antrean BPDP ULP.

---

### User Story 4 - Pemilihan Penyedia di e-Catalog oleh BPDP ULP (Priority: P1)

Sebagai **BPDP ULP**, ketika menerima berkas disposisi pengadaan dari BPDP PPK (Konektor 3), saya ingin mengubah status permohonan menjadi **"Proses Pemilihan Penyedia"** saat proses tender e-catalog dimulai di luar aplikasi, dan kemudian menekan tombol **"Selesai"** setelah pemilihan serta penetapan pemenang tender selesai di e-catalog (proses di luar aplikasi) untuk mengalirkan tiket ke **BPDP Teknis** (Konektor 4).

**Why this priority**: Menyederhanakan tugas pencatatan status pengadaan barang oleh BPDP ULP sesuai proses riil e-catalog LKPP.

**Independent Test**: Buka `/penyaluran-barang/ulp`, pilih permohonan berstatus `DISPOSISI_ULP`, klik tombol *Mulai Pemilihan Penyedia* (status berubah menjadi `PROSES_PEMILIHAN_PENYEDIA`), kemudian saat tender luar aplikasi selesai, klik tombol *Selesai* untuk mengalirkan permohonan ke antrean Dokumen Kontrak "A" BPDP Teknis (Konektor 4).

**Acceptance Scenarios**:
1. **Given** Permohonan berstatus `DISPOSISI_ULP` masuk di dashboard BPDP ULP (Konektor 3), **When** ULP membuka permohonan dan mengklik tombol **"Mulai Pemilihan Penyedia"**, **Then** sistem memperbarui status permohonan menjadi `PROSES_PEMILIHAN_PENYEDIA`.
2. **Given** Proses tender dan penetapan pemenang telah diselesaikan oleh ULP di sistem e-catalog (proses di luar aplikasi), **When** ULP menekan tombol **"Selesai"** (atau "Selesaikan Pemilihan Penyedia"), **Then** sistem memperbarui status permohonan menjadi `PENETAPAN_PEMENANG` (Konektor 4) dan meneruskannya ke antrean BPDP Teknis untuk pembuatan Dokumen Kontrak "A".

---

### User Story 5 - Input Data Dokumen Kontrak "A" oleh BPDP Teknis (Priority: P1)

Sebagai **BPDP Teknis**, ketika menerima permohonan dari BPDP ULP (Konektor 4), setelah pembuatan kontrak dengan vendor selesai di luar aplikasi (*proses diluar aplikasi*), saya ingin menginput dan mengunggah data **Dokumen Kontrak "A"** (10 atribut wajib), kemudian mengklik tombol **"Proses Pelaksanaan Kontrak"** untuk mengubah status permohonan menjadi **"Proses Pelaksanaan Kontrak"** (`PROSES_PELAKSANAAN_KONTRAK`), sebelum pembuatan surat tugas sampling/monitoring ke Surveyor (Konektor 5).

**Why this priority**: Menetapkan dasar legalitas kontrak pengadaan fisik barang dan rincian pemenuhan sebelum barang disalurkan ke pekebun.

**Independent Test**: Buka `/penyaluran-barang/verifikator`, pilih permohonan berstatus `PENETAPAN_PEMENANG` (Konektor 4), buka form Dokumen Kontrak "A", periksa auto-populate data Jenis Barang & Jumlah Barang dari permohonan, lengkapi atribut kontrak (Nomor Kontrak, Upload Dokumen Kontrak, Nama Vendor, Harga Satuan, Total Nilai Kontrak, Termin Pembayaran, Termin Penyaluran, Jangka Waktu), lalu klik tombol *"Proses Pelaksanaan Kontrak"*. Status permohonan berubah menjadi `PROSES_PELAKSANAAN_KONTRAK`.

**Acceptance Scenarios**:
1. **Given** Permohonan berstatus `PENETAPAN_PEMENANG` dari BPDP ULP masuk di antrean BPDP Teknis (Konektor 4), **When** Verifikator membuka dialog Dokumen Kontrak "A", **Then** sistem menyajikan form 10 atribut wajib dengan Jenis Barang dan Jumlah Barang yang ditarik otomatis dari data permohonan pengadaan barang.
2. **Given** Verifikator telah melengkapi 10 atribut data kontrak dan mengunggah file PDF Dokumen Kontrak, **When** Verifikator menekan tombol **"Proses Pelaksanaan Kontrak"**, **Then** sistem menyimpan data kontrak Dokumen "A", memperbarui status tiket permohonan menjadi `PROSES_PELAKSANAAN_KONTRAK`, dan menyiapkan permohonan untuk penerbitan surat tugas sampling & monitoring ke Surveyor (Konektor 5).

---

## 3. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menyediakan form input permohonan bagi Kelembagaan Pekebun dengan rincian preferensi RAB: Jenis barang, Nama Barang, Varietas, Jumlah per item, dan Satuan.
- **FR-002**: Sistem HARUS menyediakan fitur download format dokumen surat permohonan resmi dalam format PDF yang langsung tersusun dari data inputan pekebun.
- **FR-003**: Sistem HARUS menyediakan fasilitas upload berkas surat permohonan yang telah ditandatangani ketua lembaga dalam format PDF.
- **FR-004**: Sistem HARUS mendukung transisi alur verifikasi BPDP Teknis dengan keputusan:
  - **Tidak (Ditolak / Perlu Perbaikan)**: Status permohonan kembali ke **DRAFT** dengan catatan perbaikan dari verifikator.
  - **Ya (Disetujui)**: Wajib mengunggah berkas **Nota Dinas** (PDF) dan mengirim permohonan ke BPDP PPK.
- **FR-005**: Sistem HARUS menyediakan tombol aksi **"Kirim ke BPDP PPK"** pada verifikasi BPDP Teknis yang mengubah status permohonan menjadi `DISPOSISI_PPK` (Konektor 2).
- **FR-006**: Sistem HARUS menyajikan panel review bagi BPDP PPK untuk memeriksa berkas Surat Permohonan dan berkas Nota Dinas dari BPDP Teknis.
- **FR-007**: Sistem HARUS menyediakan tombol universal **"Lanjutkan ke BPDP ULP"** pada BPDP PPK untuk meneruskan berkas ke antrean ULP (`DISPOSISI_ULP` - Konektor 3).
- **FR-008**: Sistem HARUS memungkinkan BPDP ULP mengubah status menjadi `PROSES_PEMILIHAN_PENYEDIA` dan menyediakan tombol aksi **"Selesai"** (setelah pemilihan vendor di e-catalog selesai di luar aplikasi) yang mengalirkan status ke `PENETAPAN_PEMENANG` (Konektor 4).
- **FR-009**: Sistem HARUS menyediakan form input dan upload data Dokumen Kontrak "A" di BPDP Teknis dengan 10 komponen data wajib:
  1. Nomor Kontrak
  2. Upload Dokumen Kontrak (PDF)
  3. Nama Penyedia / Vendor
  4. Jenis Barang (Ditarik otomatis dari data permohonan)
  5. Jumlah Barang (Ditarik otomatis dari data permohonan)
  6. Harga Satuan
  7. Total Nilai Kontrak
  8. Termin Pembayaran
  9. Termin Penyaluran
  10. Jangka Waktu Pelaksanaan / Pemenuhan Barang
  serta tombol aksi **"Proses Pelaksanaan Kontrak"** yang mengubah status menjadi `PROSES_PELAKSANAAN_KONTRAK`.
- **FR-010**: Sistem HARUS menyediakan fasilitas penugasan monitoring & sampling mutu fisik barang ke Surveyor (Konektor 5).

### Key Entities

- **PermohonanPenyaluranBarang**: Entitas utama yang memuat nomor permohonan, profil lembaga, kategori paket (Ekstensifikasi/Intensifikasi), daftar item preferensi RAB, dokumen surat permohonan, data **Nota Dinas** (`nomorNotaDinas`, `notaDinasNamaFile`, `notaDinasUrl`, `tanggalNotaDinas`), status tahapan alur, dan catatan disposisi.
- **ItemPreferensiRAB**: Entitas rincian komoditas barang (Jenis barang, Nama Barang, Varietas, Jumlah Tahap 1, Jumlah Tahap 2, Total Kuantitas, Satuan, Estimasi Harga Satuan, Estimasi Total).
- **DokumenKontrakA**: Entitas legalitas kontrak pengadaan (Nomor Kontrak, URL Dokumen Kontrak, Nama Vendor, Jenis Barang, Volume Barang, Harga Satuan, Nilai Kontrak, Termin Pembayaran, Termin Penyaluran, Jangka Waktu Hari, Tanggal Mulai & Selesai).
- **SuratTugasSurveyor**: Entitas penugasan pengawasan mutu fisik barang (Nomor Surat Tugas, Lembaga Surveyor, Lingkup Tugas, Tanggal Terbit, Status Monitoring).

---

## 4. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% langkah alur dari Swimlane (Kelembagaan Pekebun -> BPDP Teknis -> BPDP PPK -> BPDP ULP -> BPDP Teknis/Kontrak -> Surveyor) dapat disimulasikan dan dijalankan secara end-to-end tanpa kendala logika antrian.
- **SC-002**: Pada peran BPDP Teknis, jika keputusan "Tidak" dipilih, permohonan 100% kembali ke status DRAFT pekebun; jika "Ya" dipilih, berkas Nota Dinas tervalidasi dan terkirim ke antrean BPDP PPK.
- **SC-003**: Pada peran BPDP PPK, review data permohonan dan Nota Dinas dapat diakses dalam 1 klik, serta disposisi ke ULP berhasil memindahkan tiket ke antrean BPDP ULP.
- **SC-004**: Perubahan status pada setiap konektor otomatis memutakhirkan timeline visual tracker di seluruh tampilan aktor yang relevan.

---

## 5. Assumptions

- Berkas Nota Dinas diunggah oleh Tim BPDP Teknis sebagai surat pengantar resmi dari Direktur Teknis kepada PPK untuk memulai pengadaan barang/jasa sarpras.
- Alur pemilihan e-catalog dan pembuatan kontrak fisik merupakan proses operasional di luar aplikasi (*offline/e-procurement*), sementara sistem ini bertindak sebagai pencatat status (*system of record & tracking*).
