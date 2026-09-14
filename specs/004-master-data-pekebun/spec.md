# Feature Specification: Master Data Pekebun

**Feature Branch**: `004-master-data-pekebun`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Form Usulan Baru diganti namanya menjadi Pekebun dan masuk ke Master Data. Wording 'Lembaga' diganti menjadi 'Pekebun'. Form memiliki 3 tahap: (1) Data Identitas Pekebun, (2) Upload Dokumen Pekebun, (3) Data Lahan Pekebun."

## Clarifications

### Session 2026-07-30

- Q: Hubungan Data Pekebun dan Lahan (Kuantitas Lahan) → A: Tepat satu lahan per Pekebun (Option A).
- Q: Validasi Keunikan Nomor KTP (NIK) Pekebun → A: Blokir Pendaftaran Duplikat & Tampilkan Pesan Validasi (Option A).
- Q: Data Sumber Wilayah (Cascading Dropdown Wilayah Lahan) → A: API Dinamis Bertingkat (Cascading), disimulasikan/mockup lokal di frontend untuk saat ini (Option A + Mockup).
- Q: Fitur Aksi di Halaman List Pekebun (Master Data > Pekebun) → A: List, Cari/Filter, "+ Tambah", & "Detail" Modal (Option A).
- Q: Format dan Sumber Unduhan File Template Dokumen → A: Word Document (.docx) Statis di /public/templates/ (Option B).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pendaftaran Data Identitas Pekebun (Priority: P1)

Sebagai pengguna (Ketua Kelompok Tani), saya ingin mendaftarkan data identitas pekebun baru ke dalam sistem Master Data agar pekebun terdaftar dan dapat dibuatkan CPCL untuk program sarpras kakao.

**Why this priority**: Ini adalah langkah paling fundamental — tanpa identitas pekebun yang valid, tahap lahan dan dokumen tidak memiliki arti. Identitas terverifikasi Dukcapil menjamin validitas data.

**Independent Test**: Dapat diuji secara mandiri dengan memasukkan Nomor KTP, memverifikasi bahwa field Dukcapil terisi otomatis, mengisi field manual (Alamat, Kodepos, No HP), lalu melihat data tersimpan di tahap 1.

**Acceptance Scenarios**:

1. **Given** pengguna membuka halaman Master Data > Pekebun dan klik "Tambah Pekebun", **When** pengguna memasukkan Nomor KTP yang valid (16 digit), **Then** sistem mengambil data Dukcapil dan otomatis mengisi Nama Pekebun, Nomor KK, Status Pernikahan, dan Tempat & Tanggal Lahir.
2. **Given** field Dukcapil telah terisi, **When** pengguna mengisi Alamat, Kodepos, dan Nomor Handphone, **Then** sistem memvalidasi seluruh field wajib dan mengizinkan pengguna melanjutkan ke tahap 2.
3. **Given** pengguna memasukkan Nomor KTP yang tidak valid (kurang/lebih dari 16 digit atau format salah), **When** validasi dijalankan, **Then** sistem menampilkan pesan error "Format Nomor KTP tidak valid" dan mencegah lanjut ke tahap berikutnya.

---

### User Story 2 - Upload Dokumen Pekebun (Priority: P1)

Sebagai pengguna, saya ingin mengunggah dokumen identitas pekebun (KTP, KK, swafoto, surat kuasa) agar kelengkapan administrasi terpenuhi untuk proses verifikasi.

**Why this priority**: Kelengkapan dokumen bersifat wajib untuk verifikasi — tanpa dokumen, data pekebun tidak dapat diproses lebih lanjut ke tahap lahan.

**Independent Test**: Dapat diuji dengan mengunggah file gambar untuk KTP, KK, swafoto, dan file PDF untuk surat kuasa, lalu memverifikasi bahwa semua file berhasil diunggah dan terlihat di preview.

**Acceptance Scenarios**:

1. **Given** pengguna berada di tahap 2 (Upload Data Pekebun), **When** pengguna mengunggah file gambar (JPG/PNG, maks 5MB) untuk Scan KTP, **Then** sistem menampilkan preview gambar dan menandai field sebagai terisi.
2. **Given** pengguna mengunggah file Surat Kuasa Pekebun ke Ketua, **When** file berformat PDF (maks 10MB), **Then** sistem menerima file dan menampilkan nama file yang terunggah.
3. **Given** pengguna mengunggah file dengan format yang tidak didukung atau melebihi batas ukuran, **When** validasi dijalankan, **Then** sistem menampilkan pesan error yang jelas dan menolak file tersebut.
4. **Given** semua 4 dokumen wajib telah terunggah, **When** pengguna klik tombol lanjut, **Then** sistem memvalidasi kelengkapan dan mengizinkan pengguna melanjutkan ke tahap 3.

---

### User Story 3 - Pendaftaran Data Lahan Pekebun (Priority: P1)

Sebagai pengguna, saya ingin mendaftarkan data lahan pekebun agar informasi lahan kakao tercatat lengkap untuk penilaian kelayakan program sarpras.

**Why this priority**: Data lahan merupakan komponen kritis yang menentukan kelayakan pekebun untuk menerima bantuan sarpras kakao — ini melengkapi keseluruhan alur pendaftaran.

**Independent Test**: Dapat diuji dengan memilih jenis legalitas lahan, mengisi informasi lahan, mengunggah scan legalitas, dan memverifikasi data tersimpan lengkap.

**Acceptance Scenarios**:

1. **Given** pengguna berada di tahap 3 (Data Lahan), **When** pengguna memilih Jenis Legalitas Lahan "SHM", **Then** field Nomor Legalitas, Tanggal Penerbitan, dan Upload Scan Legalitas tampil untuk diisi.
2. **Given** pengguna memilih Jenis Legalitas Lahan "Non SHM", **When** halaman dimuat, **Then** sistem menyediakan tombol "Download Format Sporadik" untuk pengguna yang tidak memiliki SHM.
3. **Given** pengguna mengisi seluruh field wajib lahan (legalitas, luas, lokasi wilayah, alamat kebun, tahun tanam, jenis bibit), **When** pengguna mengunggah Scan Legalitas Lahan, **Then** sistem memvalidasi kelengkapan seluruh data lahan.
4. **Given** pengguna perlu mengunduh format surat tambahan, **When** pengguna klik "Download Format Surat Keterangan Beda Nama Lahan" atau "Download Format Surat Pernyataan Penguasaan Fisik Bidang Tanah", **Then** sistem mengunduh template dokumen dalam format yang sesuai.
5. **Given** seluruh data lahan terisi dan valid, **When** pengguna submit form, **Then** data pekebun beserta lahan tersimpan sebagai record Master Data baru.

---

### User Story 4 - Navigasi Multi-Step dan Kembali ke Tahap Sebelumnya (Priority: P2)

Sebagai pengguna, saya ingin dapat berpindah antar tahap formulir secara bebas (maju/mundur) agar saya bisa memperbaiki data yang sudah diisi tanpa kehilangan input sebelumnya.

**Why this priority**: Pengalaman navigasi yang lancar meningkatkan efisiensi pengisian formulir dan mengurangi frustrasi pengguna.

**Independent Test**: Dapat diuji dengan mengisi data di tahap 1, berpindah ke tahap 2, lalu kembali ke tahap 1 untuk memverifikasi data masih tersimpan.

**Acceptance Scenarios**:

1. **Given** pengguna telah mengisi data di tahap 1 dan melanjutkan ke tahap 2, **When** pengguna klik tombol "Kembali", **Then** data tahap 1 tetap tersimpan dan tampil seperti sebelumnya.
2. **Given** pengguna berada di tahap 3, **When** pengguna mengklik indikator step tahap 1, **Then** pengguna berpindah ke tahap 1 dengan semua data tetap utuh.

---

### Edge Cases

- Apa yang terjadi jika Nomor KTP yang dimasukkan sudah terdaftar di sistem? Sistem menampilkan pesan error "Nomor KTP sudah terdaftar dalam Master Data" dan memblokir navigasi ke tahap selanjutnya.
- Apa yang terjadi ketika koneksi internet terputus saat proses lookup Dukcapil? Sistem menampilkan pesan error koneksi dan tombol retry.
- Bagaimana jika Nomor KTP tidak ditemukan di database Dukcapil? Sistem menampilkan pesan "Data Dukcapil tidak ditemukan" dan mencegah lanjut ke tahap berikutnya.
- Apa yang terjadi jika pengguna mengunggah file yang corrupt? Sistem menolak file dan menampilkan pesan error yang menjelaskan masalah.
- Bagaimana jika pengguna menutup browser di tengah pengisian form multi-step? Data yang belum di-submit akan hilang — pengguna perlu mengisi ulang dari awal (data hanya disimpan setelah submit final).
- Apa yang terjadi jika cascading dropdown wilayah gagal memuat data (Provinsi → Kabupaten → Kecamatan → Desa)? Sistem menampilkan error dan memungkinkan retry pada level dropdown yang gagal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Menu sidebar HARUS menampilkan "Master Data" sebagai parent menu dengan "Pekebun" sebagai sub-menu di bawahnya.
- **FR-002**: Halaman Pekebun HARUS menampilkan daftar pekebun yang sudah terdaftar dengan kemampuan pencarian (berdasarkan Nama/NIK), filter (berdasarkan Wilayah), serta tombol aksi "Detail" untuk membuka ringkasan data lengkap pekebun (identitas, dokumen, dan lahan) dalam modal read-only.
- **FR-003**: Sistem HARUS menyediakan tombol "Tambah Pekebun" yang membuka formulir multi-step 3 tahap.
- **FR-004**: Tahap 1 (Data Identitas) HARUS memiliki field input Nomor KTP (16 digit, wajib) yang memicu lookup data Dukcapil.
- **FR-015**: Sistem HARUS memvalidasi keunikan Nomor KTP (NIK). Jika NIK sudah terdaftar di database, sistem HARUS menampilkan pesan error "Nomor KTP sudah terdaftar dalam Master Data" dan memblokir navigasi ke tahap selanjutnya.
- **FR-005**: Field Dukcapil (Nama Pekebun, Nomor KK, Status Pernikahan, Tempat & Tanggal Lahir) HARUS terisi otomatis dan bersifat read-only setelah lookup berhasil.
- **FR-006**: Tahap 1 HARUS memiliki field input manual: Alamat (wajib), Kodepos (wajib), dan Nomor Handphone (wajib).
- **FR-007**: Tahap 2 (Upload Dokumen) HARUS memiliki 4 area upload: Scan KTP (gambar), Scan KK (gambar), Swafoto Pekebun (gambar), dan Surat Kuasa Pekebun ke Ketua (PDF).
- **FR-008**: Tahap 3 (Data Lahan) HARUS memiliki dropdown Jenis Legalitas Lahan dengan opsi SHM dan Non SHM.
- **FR-009**: Jika Non SHM dipilih, sistem HARUS menyediakan tombol download "Format Sporadik" dalam bentuk file Word Document (.docx).
- **FR-010**: Tahap 3 HARUS memiliki field input untuk tepat satu Lahan Pekebun: Nomor Legalitas Lahan, Tanggal Penerbitan Legalitas Lahan, Luas Lahan, cascading dropdown wilayah (Provinsi → Kabupaten → Kecamatan → Desa), Alamat/Blok Kebun, Tahun Tanam, Jenis Bibit, dan Upload Scan Legalitas Lahan. Seluruh dropdown wilayah HARUS disimulasikan (mockup) dengan relasi bertingkat yang dinamis di frontend.
- **FR-011**: Sistem HARUS menyediakan tombol download untuk "Format Surat Keterangan Beda Nama Lahan" dan "Format Surat Pernyataan Penguasaan Fisik Bidang Tanah" dalam bentuk file Word Document (.docx).
- **FR-012**: Validasi field wajib HARUS berjalan secara real-time pada setiap tahap sebelum pengguna diizinkan melanjutkan ke tahap berikutnya.
- **FR-013**: Semua wording yang sebelumnya menggunakan istilah "Lembaga" HARUS diganti menjadi "Pekebun" di seluruh form dan halaman terkait.
- **FR-014**: Step indicator HARUS menampilkan progress 3 tahap (Data Identitas → Upload Dokumen → Data Lahan) dengan navigasi klik pada tahap yang sudah diisi.

### Key Entities

- **Pekebun**: Individu petani kakao yang didaftarkan ke dalam sistem. Atribut kunci: NIK (KTP), nama, nomor KK, status pernikahan, tempat/tanggal lahir, alamat, kodepos, nomor HP. Terkait dengan tepat satu Lahan Pekebun pada pendaftaran awal.
- **Dokumen Pekebun**: Kumpulan dokumen identitas yang diunggah: Scan KTP, Scan KK, Swafoto, Surat Kuasa ke Ketua.
- **Lahan Pekebun**: Informasi satu lahan kakao milik pekebun. Atribut kunci: jenis legalitas (SHM/Non SHM), nomor & tanggal legalitas, luas lahan, lokasi wilayah (provinsi/kabupaten/kecamatan/desa), alamat kebun, tahun tanam, jenis bibit, scan legalitas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pengguna dapat menyelesaikan seluruh 3 tahap pendaftaran pekebun baru dalam waktu kurang dari 10 menit (tidak termasuk waktu mempersiapkan dokumen fisik).
- **SC-002**: 95% pengguna berhasil mengunggah semua dokumen wajib pada percobaan pertama tanpa error.
- **SC-003**: Lookup data Dukcapil berdasarkan Nomor KTP mengembalikan hasil dalam waktu kurang dari 3 detik.
- **SC-004**: Pengguna dapat kembali ke tahap sebelumnya tanpa kehilangan data yang sudah diisi, pada 100% kasus.
- **SC-005**: Semua pesan error pada form dapat dipahami oleh pengguna non-teknis — pengguna mampu memperbaiki input yang salah tanpa bantuan.

## Assumptions

- Integrasi Dukcapil (atau API serupa) tersedia melalui backend dan sudah menyediakan endpoint lookup berdasarkan Nomor KTP.
- Backend sudah menyediakan endpoint untuk cascading dropdown wilayah (Provinsi → Kabupaten → Kecamatan → Desa) atau data wilayah tersedia secara statis.
- Template dokumen "Format Sporadik", "Format Surat Keterangan Beda Nama Lahan", dan "Format Surat Pernyataan Penguasaan Fisik Bidang Tanah" tersedia sebagai file Word Document (.docx) statis di folder `/public/templates/` yang bisa diunduh oleh pengguna.
- Pengguna yang mengakses fitur ini memiliki peran "Ketua Kelompok Tani" atau peran yang berwenang menambah data pekebun.
- Aplikasi sudah menggunakan multi-step form pattern yang konsisten (seperti pada form Pengusulan yang sudah ada).
- Ukuran file maksimal upload mengikuti batas standar: 5MB untuk gambar (KTP, KK, Swafoto) dan 10MB untuk PDF (Surat Kuasa, Scan Legalitas).
- Jika backend endpoint belum tersedia, halaman tetap dibangun sebagai mockup dengan data simulasi (termasuk lookup Dukcapil dan cascading dropdown wilayah), sesuai konstitusi proyek (Prinsip XIII).
