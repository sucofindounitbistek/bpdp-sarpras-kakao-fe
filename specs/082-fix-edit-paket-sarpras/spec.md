# Feature Specification: Perbaikan Form Edit Paket Sarpras & Konfigurasi Dokumen Wajib/Opsional

**Feature Branch**: `082-fix-edit-paket-sarpras`  
**Created**: 2026-09-12  
**Status**: Draft  
**Input**: User request: "Paket Sarpras ketika edit sarpras ada beberapa valuenya gadapet, jadi gabisa submit ketika sudah edit" serta penambahan "fitur opsional atau required di menu dokumen persyaratan, dan penegasan label Wajib/Opsional pada persyaratan dokumen proposal di setiap role".

---

## Clarifications

### Session 2026-09-12
- Q: Apakah field Label Singkat perlu dipertahankan atau dihilangkan karena nilainya sebenarnya sama dengan Nama Paket?  
  → A: Input "Label Singkat" dihilangkan sepenuhnya dari tampilan modal form. Pengguna hanya perlu mengisi satu input utama "Nama Paket", dan sistem di background otomatis menyelaraskan nilai `label = name` untuk menjaga kompatibilitas database dan API.
- Q: Apakah label "Wajib" dan "Opsional" pada persyaratan dokumen di alur proposal sebaiknya tetap ditampilkan pada setiap role?  
  → A: YA, tetap ditampilkan secara konsisten. Dokumen wajib diberi badge visual **Wajib** (merah/rose) dan bersifat memblokir submit/approval jika kosong, sedangkan dokumen tambahan diberi badge **Opsional** (abu-abu/slate) tanpa memblokir proses.
- Q: Di mana konfigurasi Wajib vs Opsional ini dikelola?  
  → A: Dikelola secara terpusat pada Master Dokumen Persyaratan (`/master-data/dokumen-persyaratan`).
- Q: Bagaimana mekanisme penentuan status Wajib vs Opsional pada dokumen saat ditautkan ke Paket Sarpras?  
  → A: Dokumen yang dicentang pada form modal Paket Sarpras otomatis mewarisi sifat Wajib atau Opsional dari master katalog dokumen tersebut, dengan badge indikator visual ditampilkan di samping nama dokumen.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Kelengkapan Pengisian Nilai Form saat Membuka Modal Edit Paket (Priority: P1) 🎯 MVP

Sebagai Administrator Pengelola Master Data Sarpras, ketika saya mengklik tombol **"Edit"** pada salah satu kartu Paket Sarpras di halaman `/master-data/paket-sarpras`, saya ingin seluruh formulir (Kategori, Kode Paket, Nama Paket, Ikon, Deskripsi, Jumlah Tahap, Kode Penomoran, Batas Minimum Pekebun/Luas, serta Checklist Dokumen Persyaratan) **terisi lengkap secara otomatis sesuai data paket yang dipilih**, tanpa ada field utama yang kosong melompong dan tanpa input redundan "Label Singkat", sehingga saya dapat langsung melakukan pembaruan tanpa harus mengisi ulang data lama dari nol.

**Why this priority**: Masalah utama saat ini adalah nilai field utama (seperti Nama Paket) tidak terambil (`""`), yang mengakibatkan validasi form gagal dan tombol submit terblokir.

**Independent Test**: Masuk ke halaman Master Data Paket Sarpras, klik tombol Edit pada salah satu paket (misalnya "Ekstensifikasi" atau "UPH Multi-Jenis"). Pastikan seluruh input (termasuk Nama Paket, Kategori, Deskripsi, dan checklist dokumen) terisi nilai yang valid dari data paket tersebut, dan tidak ada lagi input ganda untuk Label Singkat.

**Acceptance Scenarios**:

1. **Given** Pengguna berada di halaman Master Data Paket Sarpras dan memilih salah satu paket untuk diedit,  
   **When** Pengguna mengklik tombol Edit (ikon pensil),  
   **Then** Sistem membuka modal edit dan memuat seluruh nilai atribut paket dengan lengkap, termasuk Nama Paket yang terisi nilai nama/label paket yang sesuai (tidak boleh bernilai kosong).
2. **Given** Form modal dibuka,  
   **Then** Antarmuka hanya menampilkan satu field input nama yaitu "Nama Paket", sedangkan input "Label Singkat" ditiadakan dari tampilan modal.
3. **Given** Data paket di basis data memiliki kolom `name` yang kosong namun memiliki kolom `label`,  
   **When** Modal edit dimuat,  
   **Then** Sistem secara cerdas menggunakan `label` sebagai nilai awal untuk `name` sehingga field Nama Paket langsung terisi.
4. **Given** Data detail paket memuat checklist dokumen persyaratan dan batas minimum,  
   **When** Modal edit dibuka,  
   **Then** Checklist dokumen yang terpasang pada paket tersebut otomatis tercentang (*pre-selected*) sesuai relasi data terkini.

---

### User Story 2 - Kelancaran Pengiriman (Submit) Form Pembaruan Paket (Priority: P1) 🎯 MVP

Sebagai Administrator Pengelola Master Data Sarpras, setelah saya selesai meninjau atau mengubah field pada modal Edit Paket Sarpras, ketika saya menekan tombol **"Simpan Perubahan"**, saya ingin pembaruan berhasil diproses dan disimpan ke basis data dengan notifikasi sukses, tanpa terblokir pesan validasi palsu (seperti *"Nama paket wajib diisi"*), sehingga perubahan konfigurasi paket sarpras tersimpan efektif.

**Why this priority**: Menjamin admin dapat menyimpan konfigurasi paket sarpras secara mulus tanpa terhambat validasi yang keliru.

**Independent Test**: Buka modal edit paket, ubah salah satu nilai (misal: tambah dokumen persyaratan atau ubah jumlah tahap RAB), lalu klik "Simpan Perubahan". Pastikan sistem merespons sukses, modal tertutup, dan data di kartu paket langsung ter-refresh dengan nilai baru.

**Acceptance Scenarios**:

1. **Given** Form modal edit paket telah terisi seluruh field wajib dengan nilai valid,  
   **When** Pengguna menekan tombol "Simpan Perubahan",  
   **Then** Sistem mengirimkan payload pembaruan ke API `PUT /master/paket-sarpras/:code` dan menampilkan toast *"Paket [Nama] berhasil diperbarui"*.
2. **Given** Pengguna hanya mengedit Nama Paket tanpa mengetik label secara manual,  
   **When** Data disimpan,  
   **Then** Sistem di latar belakang otomatis menyinkronkan nilai `label` sama dengan `name`.
3. **Given** Proses simpan berhasil,  
   **When** Modal tertutup,  
   **Then** Tampilan antarmuka kartu master paket sarpras otomatis memuat ulang (*refresh*) data terbaru dari backend.

---

### User Story 3 - Pengelolaan Sifat Dokumen (Wajib vs Opsional) pada Master Data (Priority: P1) 🎯 MVP

Sebagai Administrator Master Data Sarpras, ketika saya mengelola Dokumen Persyaratan di menu `/master-data/dokumen-persyaratan` maupun menghubungkannya ke Paket Sarpras di `/master-data/paket-sarpras`, saya ingin dapat **menentukan apakah suatu dokumen bersifat Wajib (Required) atau Opsional**, sehingga aturan kelengkapan berkas dapat dikonfigurasi secara dinamis sesuai regulasi BPDPKS.

**Why this priority**: Memberikan fleksibilitas bagi instansi untuk menetapkan dokumen mana yang wajib diunggah dan mana yang hanya berupa dokumen pendukung pelengkap.

**Independent Test**: Masuk ke menu Dokumen Persyaratan, buat atau edit salah satu dokumen, ubah statusnya menjadi "Opsional" atau "Wajib". Simpan dan pastikan pada kartu Paket Sarpras relasi dokumen tersebut menampilkan badge yang sesuai ("WAJIB" atau "OPSIONAL").

**Acceptance Scenarios**:

1. **Given** Admin membuka form Tambah atau Edit Dokumen Persyaratan di `/master-data/dokumen-persyaratan`,  
   **When** Form ditampilkan,  
   **Then** Terdapat pilihan kontrol status sifat dokumen: **Wajib (Required)** atau **Opsional**.
2. **Given** Admin menyimpan dokumen dengan sifat "Opsional",  
   **Then** Pada tabel katalog dokumen ditampilkan badge "Opsional" (abu-abu), dan saat dokumen ditautkan ke paket sarpras, atribut `is_wajib` tersimpan sebagai `false`.
3. **Given** Admin membuka form edit Paket Sarpras di `/master-data/paket-sarpras`,  
   **When** Daftar dokumen persyaratan ditampilkan,  
   **Then** Dokumen pada checklist menampilkan badge status Wajib atau Opsional sesuai sifat dari master katalog dokumen tersebut, dan saat paket disimpan, relasi dokumen otomatis mewarisi status `is_wajib` dari master katalog.

---

### User Story 4 - Konsistensi Penandaan & Validasi Dokumen Proposal di Seluruh Role (Priority: P1) 🎯 MVP

Sebagai Pemohon (Lembaga Pekebun) maupun Verifikator (Dinas Kabupaten, Dinas Provinsi, BPDPKS), ketika saya melihat daftar unggahan berkas proposal, saya ingin **tetap melihat label penanda yang jelas antara dokumen "Wajib" dan "Opsional"**, di mana sistem hanya memblokir pengajuan/persetujuan apabila dokumen **Wajib** belum terpenuhi, sedangkan dokumen **Opsional** tidak menghalangi kelanjutan proses.

**Why this priority**: Memberikan kepastian transparansi bagi pemohon agar tahu apa yang wajib diunggah, serta panduan hukum bagi verifikator agar tidak keliru menolak proposal karena dokumen pendukung opsional belum ada.

**Independent Test**: Login sebagai Pemohon, buka tahapan Upload Dokumen proposal. Pastikan berkas bertanda "Wajib" menampilkan badge merah/rose dan bertanda "Opsional" menampilkan badge abu-abu. Pastikan proposal bisa diajukan meskipun dokumen bertanda "Opsional" tidak diunggah.

**Acceptance Scenarios**:

1. **Given** Pemohon berada di tahapan Upload Dokumen Proposal,  
   **Then** Setiap slot dokumen menampilkan badge:
     - Badge merah `Wajib` untuk dokumen dengan `is_wajib: true`.
     - Badge abu-abu `Opsional` untuk dokumen dengan `is_wajib: false`.
2. **Given** Pemohon telah mengunggah seluruh dokumen bertanda "Wajib" namun mengosongkan dokumen "Opsional",  
   **When** Pemohon menekan tombol lanjutkan/submit,  
   **Then** Sistem mengizinkan proses berlanjut tanpa error validasi.
3. **Given** Verifikator Dinas Kabupaten / Provinsi / BPDPKS memeriksa kelengkapan proposal,  
   **Then** Pratinjau dokumen proposal menampilkan badge "Wajib" dan "Opsional" secara konsisten, dan tombol persetujuan hanya mensyaratkan kelengkapan dokumen "Wajib".

---

## Edge Cases

- **Bagaimana jika suatu dokumen pada paket sarpras eksisting belum memiliki nilai `is_wajib` di basis data?**  
  Sistem menerapkan nilai baku (*default*) `true` (Wajib) sehingga data lama tetap aman dan tidak kehilangan status validasinya.
- **Bagaimana jika seluruh dokumen pada suatu paket dijadikan opsional?**  
  Sistem tetap mengizinkan submit proposal, namun menampilkan konfirmasi peringatan kepada pemohon bahwa tidak ada berkas yang diunggah.
- **Bagaimana jika jaringan lambat saat mengambil detail paket dan persyaratan?**  
  Modal menampilkan indikator pemuatan (*loading indicator*) dan menonaktifkan tombol simpan sementara hingga seluruh data siap diedit.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Modal edit paket sarpras MUST memuat nilai awal yang lengkap untuk seluruh input: `kategori_code`, `code`, `name`, `icon`, `description`, `jumlah_tahap`, `kode_penomoran`, `minimal_pekebun`, `minimal_luas_ha`, `keterangan`, dan `dokumen_codes`.
- **FR-002**: Antarmuka modal edit paket sarpras HANYA menampilkan satu input nama ("Nama Paket") dan meniadakan input terpisah "Label Singkat". Sistem frontend secara otomatis menyelaraskan nilai atribut `label = name` saat submit data.
- **FR-003**: Menu Master Dokumen Persyaratan MUST menyediakan opsi konfigurasi apakah dokumen bersifat **Wajib (Required)** atau **Opsional**.
- **FR-004**: Relasi dokumen pada Paket Sarpras MUST mendukung penyimpanan dan pembaruan atribut `is_wajib` (boolean) untuk setiap dokumen yang dicentang.
- **FR-005**: Alur pengusulan dan verifikasi proposal di seluruh role (Pemohon, Dinas Kabupaten, Dinas Provinsi, BPDPKS) MUST menampilkan label badge `Wajib` dan `Opsional` secara konsisten pada setiap item dokumen.
- **FR-006**: Validasi kelengkapan dokumen pada alur pengajuan dan verifikasi proposal HANYA memblokir proses jika terdapat dokumen bertanda `is_wajib: true` yang belum diunggah atau belum disetujui. Dokumen dengan `is_wajib: false` tidak boleh memblokir proses.
- **FR-007**: Backend API `GET /master/paket-sarpras`, `GET /master/paket-sarpras/:code`, dan `GET /master/dokumen-persyaratan` MUST mengembalikan atribut `name` non-kosong dan status `is_wajib` yang akurat.
- **FR-008**: Backend API `PUT /master/paket-sarpras/:code` MUST memproses pembaruan paket serta relasi dokumen beserta status `is_wajib`-nya.

---

### Key Entities *(include if feature involves data)*

- **MasterPaketSarpras**: Entitas utama paket sarpras (`code`, `name`, `label`, `description`, `icon`, `is_pupuk`, `jumlah_tahap`, `kode_penomoran`, dll).
- **MasterDokumenPersyaratan**: Katalog dokumen persyaratan (`code`, `name`, `description`, `format_download_url`, `allowed_mime_types`, `max_size_bytes`, `is_active`, `is_wajib`).
- **MasterPaketDokumen**: Relasi dokumen ke paket sarpras dengan penanda `is_wajib` (boolean).
- **SyaratMinimum**: Aturan ambang batas pekebun dan luas lahan.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% modal edit paket sarpras menampilkan nilai Nama Paket yang terisi penuh tanpa ada field kosong palsu.
- **SC-002**: 100% submit pembaruan paket sarpras berhasil disimpan tanpa memicu error validasi nama paket.
- **SC-003**: Admin dapat mengatur dan mengubah status Wajib vs Opsional pada dokumen persyaratan dengan 100% akurasi tersimpan di basis data.
- **SC-004**: Seluruh tampilan pengusulan dan verifikasi proposal pada 4 role (Pemohon, Dinas Kabupaten, Dinas Provinsi, BPDPKS) menampilkan badge Wajib/Opsional secara seragam dan konsisten.
- **SC-005**: Proposal yang memiliki dokumen opsional kosong dapat diajukan dan diverifikasi hingga selesai tanpa terblokir validasi sistem.
