# Feature Specification: Revamp Pengusulan Baru — Multi-Step Wizard

**Feature Branch**: `006-pengusulan-baru-revamp`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "Update the pengusulan baru with a 3-step wizard: Step 1 — Pemilihan Jenis Paket Sarpras (9 options) + persyaratan dokumen per paket + upload dokumen + preview + gudang serah terima khusus paket pupuk; Step 2 — Pengisian RAB (tabel kolom Tahap/Uraian/Volume/Satuan/Harga Satuan/Sub-total) + download RAB + upload RAB yang telah ditandatangani; Step 3 — Pilih Pekebun & Lahan + Preview Proposal + Submit Proposal."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pemohon Memilih Jenis Paket Sarpras & Mengunggah Dokumen Persyaratan (Priority: P1)

Sebagai Pengurus Lembaga Pekebun (Pemohon), saya ingin memilih jenis paket sarpras dari 9 pilihan yang tersedia, melihat daftar persyaratan dokumen yang berlaku khusus untuk paket yang dipilih, mengunduh format dokumen persyaratan, mengunggah dokumen tersebut, dan mempratinjau dokumen yang sudah diunggah — sebelum melanjutkan ke langkah berikutnya.

**Why this priority**: Langkah pertama ini adalah fondasi seluruh usulan; tanpa pemilihan paket yang tepat dan kelengkapan dokumen persyaratan, proses tidak dapat dilanjutkan.

**Independent Test**: Dapat diuji secara mandiri dengan membuka halaman Pengusulan Baru → Step 1 dan memverifikasi bahwa: (a) 9 pilihan paket tampil, (b) memilih paket mengubah daftar persyaratan, (c) tombol unduh format dokumen berfungsi, (d) pengunggahan dokumen berhasil, (e) preview dokumen yang diunggah tersedia.

**Acceptance Scenarios**:

1. **Given** Pemohon berada di Step 1, **When** membuka halaman, **Then** sistem menampilkan pilihan "Pemilihan Jenis Paket Sarpras" dengan 9 opsi paket.
2. **Given** Pemohon memilih salah satu paket, **When** paket terpilih, **Then** sistem menampilkan daftar persyaratan dokumen yang spesifik untuk paket tersebut beserta tombol unduh format dokumen.
3. **Given** Pemohon mengklik tombol unduh format dokumen, **When** tombol diklik, **Then** file template dokumen persyaratan berhasil diunduh.
4. **Given** Pemohon mengunggah dokumen persyaratan, **When** file berhasil diunggah, **Then** dokumen tampil dalam daftar dengan status "Terunggah" dan tersedia tombol pratinjau.
5. **Given** Pemohon mengklik tombol pratinjau dokumen, **When** tombol diklik, **Then** dokumen ditampilkan secara in-line (modal viewer atau iframe) tanpa meninggalkan halaman.
6. **Given** Pemohon memilih paket yang mengandung pupuk (Intensifikasi atau Ekstensifikasi), **When** paket terpilih, **Then** sistem menampilkan seksi tambahan "Gudang Serah Terima" dengan field Alamat, Koordinat, dan upload foto gudang (Tampak Depan & Tampak Dalam).
7. **Given** Pemohon belum melengkapi semua dokumen persyaratan wajib, **When** mencoba klik tombol "Lanjut ke Step 2", **Then** sistem menampilkan pesan validasi dan tombol tidak dapat dilanjutkan.

---

### User Story 2 — Pemohon Mengisi Rencana Anggaran Biaya (RAB) (Priority: P1)

Sebagai Pemohon, saya ingin mengisi tabel RAB secara detail (Tahap, Uraian, Volume, Satuan, Harga Satuan, Sub-total), mengunduh RAB dalam format dokumen untuk ditandatangani, lalu mengunggah kembali RAB yang telah ditandatangani — sebagai bukti persetujuan anggaran.

**Why this priority**: RAB adalah dokumen finansial kritis yang harus diverifikasi; tanpa RAB yang ditandatangani, usulan tidak dapat diproses.

**Independent Test**: Dapat diuji secara mandiri dengan membuka Step 2, mengisi minimal satu baris RAB, mengunduh dokumen RAB, dan mengunggah dokumen RAB bertandatangan.

**Acceptance Scenarios**:

1. **Given** Pemohon berada di Step 2, **When** halaman dibuka, **Then** sistem menampilkan tabel RAB dengan kolom: Tahap, Uraian, Volume, Satuan, Harga Satuan, Sub-total, dan kolom aksi.
2. **Given** Pemohon mengisi baris RAB, **When** nilai Volume dan Harga Satuan diinput, **Then** kolom Sub-total terhitung otomatis (Volume x Harga Satuan).
3. **Given** Pemohon ingin menambah baris, **When** mengklik tombol tambah baris, **Then** baris baru muncul di bawah baris terakhir.
4. **Given** Pemohon ingin menghapus baris, **When** mengklik ikon hapus pada baris, **Then** baris tersebut dihapus dari tabel.
5. **Given** Tabel RAB terisi, **When** Pemohon mengklik "Unduh RAB", **Then** file RAB dalam format dokumen berhasil diunduh.
6. **Given** Pemohon telah menandatangani RAB, **When** mengunggah file RAB bertandatangan, **Then** file terunggah dan tampil konfirmasi beserta tombol pratinjau.
7. **Given** Pemohon belum mengunggah RAB bertandatangan, **When** mencoba melanjutkan ke Step 3, **Then** sistem menampilkan pesan validasi bahwa RAB bertandatangan wajib diunggah.

---

### User Story 3 — Pemohon Memilih Pekebun & Lahan, Pratinjau, dan Submit Proposal (Priority: P1)

Sebagai Pemohon, saya ingin memilih pekebun dan lahan yang akan diajukan dalam proposal, mempratinjau keseluruhan dokumen proposal yang sudah terbentuk, dan menyerahkan (submit) proposal secara resmi.

**Why this priority**: Langkah terakhir ini menyelesaikan dan mengunci seluruh isi proposal; submit adalah aksi terminal yang mengawali alur verifikasi administrasi.

**Independent Test**: Dapat diuji secara mandiri dengan memilih minimal satu pekebun dan satu lahan, membuka pratinjau proposal, dan mengklik Submit untuk mendapatkan konfirmasi berhasil.

**Acceptance Scenarios**:

1. **Given** Pemohon berada di Step 3, **When** halaman dibuka, **Then** sistem menampilkan daftar pekebun yang tersedia dan dapat dipilih.
2. **Given** Pemohon memilih pekebun, **When** pekebun terpilih, **Then** lahan yang terdaftar atas nama pekebun tersebut tampil untuk dipilih.
3. **Given** Pemohon memilih pekebun dan lahan, **When** mengklik "Pratinjau Proposal", **Then** sistem menampilkan ringkasan lengkap proposal (paket dipilih, dokumen, RAB, data pekebun & lahan) dalam format pratinjau yang dapat di-scroll.
4. **Given** Pratinjau proposal terbuka, **When** Pemohon memeriksa dokumen yang diunggah, **Then** Pemohon dapat mengklik pratinjau untuk setiap dokumen lampiran tanpa meninggalkan modal pratinjau.
5. **Given** Pemohon puas dengan isi proposal, **When** mengklik tombol "Submit Proposal", **Then** sistem mengirimkan data dan menampilkan notifikasi sukses beserta nomor registrasi usulan.
6. **Given** Pemohon belum memilih pekebun atau lahan, **When** mencoba mengklik "Submit Proposal", **Then** sistem menampilkan validasi bahwa pemilihan pekebun dan lahan wajib dilakukan.

---

### Edge Cases

- Apa yang terjadi ketika Pemohon berpindah dari paket pupuk ke paket non-pupuk setelah mengisi data Gudang Serah Terima? (Sistem harus memberi konfirmasi penghapusan data gudang sebelum mengganti paket.)
- Bagaimana jika file yang diunggah melebihi batas ukuran maksimum yang diizinkan? (Sistem menampilkan pesan error ukuran file dan mencegah pengunggahan.)
- Bagaimana jika format file tidak sesuai (contoh: mengunggah .exe sebagai dokumen persyaratan)? (Sistem menolak file dan menampilkan pesan format yang diterima.)
- Apa yang terjadi jika koneksi terputus saat proses pengunggahan dokumen? (Sistem menampilkan status error pengunggahan dan Pemohon dapat mencoba ulang.)
- Bagaimana jika Pemohon kembali ke Step sebelumnya — apakah data yang sudah diisi di step berikutnya tetap tersimpan? (Data setiap step tetap tersimpan dalam Pinia store selama sesi berlangsung.)
- Bagaimana jika tidak ada pekebun yang terdaftar di Step 3? (Sistem menampilkan state kosong dengan panduan untuk mendaftarkan pekebun terlebih dahulu.)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menampilkan multi-step wizard Pengusulan Baru dengan 3 langkah berurutan: (1) Paket & Dokumen, (2) RAB, (3) Pekebun, Lahan & Submit.
- **FR-002**: Sistem MUST menyediakan pilihan "Pemilihan Jenis Paket Sarpras" dengan 9 opsi berikut:
  1. Ekstensifikasi (Benih, Pupuk, Pestisida)
  2. Intensifikasi (Pupuk dan Pestisida)
  3. Alat pascapanen
  4. Unit Pengolahan Hasil
  5. Jalan kebun dan jalan akses ke jalan umum dan/atau ke pelabuhan
  6. Alat transportasi
  7. Mesin pertanian
  8. Infrastruktur pasar
  9. Verifikasi atau penelusuran teknis
- **FR-003**: Sistem MUST menampilkan persyaratan dokumen yang spesifik per paket sarpras yang dipilih.
- **FR-004**: Sistem MUST menyediakan tombol unduh format/template dokumen persyaratan untuk setiap jenis dokumen.
- **FR-005**: Pemohon MUST dapat mengunggah dokumen persyaratan sesuai paket yang dipilih.
- **FR-006**: Sistem MUST menyediakan fitur pratinjau (preview) untuk setiap dokumen yang telah diunggah.
- **FR-007**: Sistem MUST menampilkan seksi "Gudang Serah Terima" HANYA ketika paket yang dipilih adalah Ekstensifikasi atau Intensifikasi (paket yang mengandung pupuk). Seksi ini mencakup: Alamat, Koordinat, Upload Foto Gudang Tampak Depan, dan Upload Foto Gudang Tampak Dalam.
- **FR-008**: Sistem MUST menampilkan tabel RAB pada Step 2 dengan kolom: Tahap, Uraian, Volume, Satuan, Harga Satuan, Sub-total, dan kolom aksi hapus baris.
- **FR-009**: Sistem MUST menghitung Sub-total RAB secara otomatis (Volume x Harga Satuan) setiap kali Volume atau Harga Satuan diubah.
- **FR-010**: Pemohon MUST dapat menambah dan menghapus baris pada tabel RAB.
- **FR-011**: Sistem MUST menyediakan fungsi unduh dokumen RAB yang sudah diisi.
- **FR-012**: Pemohon MUST dapat mengunggah RAB yang telah ditandatangani, dan sistem MUST menampilkan status konfirmasi beserta tombol pratinjau.
- **FR-013**: Sistem MUST memungkinkan Pemohon memilih pekebun dari daftar pekebun yang terdaftar pada Step 3.
- **FR-014**: Sistem MUST menampilkan lahan yang terkait dengan pekebun yang dipilih untuk dimasukkan dalam proposal.
- **FR-015**: Sistem MUST menyediakan fungsi pratinjau keseluruhan proposal (termasuk lampiran dokumen yang dapat dipratinjau dari dalam modal) sebelum submit.
- **FR-016**: Sistem MUST mengirimkan data proposal dan menampilkan notifikasi sukses beserta nomor registrasi usulan setelah submit berhasil.
- **FR-017**: Sistem MUST memvalidasi kelengkapan setiap step sebelum mengizinkan navigasi ke step berikutnya, dengan pesan validasi yang jelas.
- **FR-018**: Sistem MUST menyimpan data setiap step dalam Pinia store agar tidak hilang saat Pemohon berpindah antar step dalam satu sesi.

### Key Entities *(include if feature involves data)*

- **Usulan / Proposal**: Entitas utama yang menampung seluruh data pengusulan — paket sarpras, dokumen persyaratan, RAB, gudang serah terima (jika berlaku), daftar pekebun, dan daftar lahan.
- **Paket Sarpras**: 9 jenis paket yang dapat dipilih, masing-masing memiliki daftar persyaratan dokumen tersendiri.
- **Dokumen Persyaratan**: Dokumen yang wajib diunggah berdasarkan paket dipilih; memiliki template unduhan dan status upload.
- **RAB (Rencana Anggaran Biaya)**: Tabel anggaran yang terdiri dari baris-baris item biaya (Tahap, Uraian, Volume, Satuan, Harga Satuan, Sub-total) beserta RAB bertandatangan.
- **Gudang Serah Terima**: Entitas tambahan yang hanya berlaku untuk paket Ekstensifikasi dan Intensifikasi; memuat Alamat, Koordinat, dan foto gudang.
- **Pekebun**: Individu petani pekebun yang diajukan dalam proposal; terdaftar dalam sistem.
- **Lahan**: Lahan pertanian milik pekebun yang diajukan; terkait dengan pekebun yang dipilih.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pemohon dapat menyelesaikan seluruh 3 langkah pengusulan dan melakukan submit proposal dalam satu sesi tanpa kehilangan data antar langkah.
- **SC-002**: Pemilihan paket sarpras seketika memperbarui daftar persyaratan dokumen dan menampilkan/menyembunyikan seksi Gudang Serah Terima tanpa reload halaman.
- **SC-003**: Sub-total RAB terhitung secara otomatis setiap perubahan input Volume atau Harga Satuan, tanpa interaksi tambahan dari Pemohon.
- **SC-004**: Seluruh dokumen yang diunggah (persyaratan maupun RAB bertandatangan) dapat dipratinjau tanpa meninggalkan halaman aktif.
- **SC-005**: Validasi step memastikan 100% field wajib terisi sebelum Pemohon dapat melanjutkan ke step berikutnya.
- **SC-006**: Setelah submit berhasil, Pemohon menerima notifikasi sukses dan nomor registrasi usulan dalam waktu tidak lebih dari 5 detik.
- **SC-007**: Seluruh halaman wizard responsif dan dapat digunakan penuh pada perangkat mobile (lebar minimum 360px).

---

## Assumptions

- Daftar persyaratan dokumen per paket sarpras sudah didefinisikan di backend atau di konfigurasi statis; jika endpoint belum tersedia, data persyaratan akan menggunakan konfigurasi statis (sesuai Prinsip XIII Konstitusi).
- Template/format dokumen persyaratan yang dapat diunduh sudah tersedia sebagai file statis yang dapat direferensikan.
- Daftar pekebun dan lahan di Step 3 diambil dari data yang sudah ada di sistem (dari modul Master Data Pekebun yang sudah atau sedang dibangun).
- Upload foto gudang menerima format gambar standar (JPG, PNG, WebP) dengan batas ukuran yang wajar (maksimum 5MB per foto).
- Upload dokumen menerima format PDF dan gambar umum (JPG, PNG) dengan batas ukuran yang wajar.
- Data setiap step disimpan sementara di Pinia store selama sesi; data tidak otomatis disimpan ke backend sampai submit dilakukan.
- Fungsi unduh RAB menghasilkan dokumen dalam format PDF atau Excel sesuai format yang ditetapkan.
- Nomor registrasi usulan diterbitkan oleh backend setelah submit berhasil.
- Fitur ini khusus untuk role PEMOHON (Pengurus Lembaga Pekebun); role lain tidak memiliki akses untuk membuat usulan baru.
