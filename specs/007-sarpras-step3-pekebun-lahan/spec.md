# Feature Specification: Step 3 Pengajuan Sarpras — Pekebun & Lahan, Dokumen Kepemilikan, Validasi Minimum Paket

**Feature Branch**: `007-sarpras-step3-pekebun-lahan`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "Step 3 pengajuan sarpras: combine pekebun with their lahan, give selection to select the document to use SHM or other document, and validation for the selected paket based on minimum pekebun and luas requirements."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pemohon Memilih Pekebun Beserta Lahannya dalam Tampilan Gabungan (Priority: P1)

Sebagai Pemohon, saya ingin melihat daftar pekebun yang sudah terdaftar beserta lahan-lahan yang dimilikinya dalam satu tampilan terpadu, sehingga saya dapat memilih pekebun dan lahan yang akan diajukan dalam proposal secara efisien tanpa harus memilih pekebun dan lahan secara terpisah.

**Why this priority**: Inti dari Step 3 adalah pemilihan pekebun dan lahan; tampilan gabungan mempercepat proses dan mengurangi kesalahan pemilihan lahan yang tidak sesuai dengan pekebunnya.

**Independent Test**: Buka Step 3, verifikasi daftar pekebun tampil beserta lahan-lahan terkait di bawah setiap pekebun, dan Pemohon dapat memilih/mencentang pekebun dan lahan yang akan diajukan.

**Acceptance Scenarios**:

1. **Given** Pemohon berada di Step 3, **When** halaman dibuka, **Then** sistem menampilkan daftar pekebun yang terdaftar, masing-masing dengan lahan yang dimilikinya ditampilkan di bawah nama pekebun.
2. **Given** Daftar pekebun dan lahan ditampilkan, **When** Pemohon mencentang seorang pekebun, **Then** lahan milik pekebun tersebut ikut terpilih.
3. **Given** Seorang pekebun tidak memiliki lahan terdaftar, **When** daftar ditampilkan, **Then** sistem menampilkan indikator "Belum ada lahan" di bawah nama pekebun tersebut dan pekebun tidak dapat dipilih.
4. **Given** Pemohon telah memilih beberapa pekebun dan lahan, **When** melihat ringkasan pilihan, **Then** sistem menampilkan total jumlah pekebun terpilih dan total luas lahan terpilih secara real-time.
5. **Given** Tidak ada pekebun terdaftar, **When** Step 3 dibuka, **Then** sistem menampilkan state kosong dengan pesan bahwa Pemohon perlu mendaftarkan pekebun dan lahan terlebih dahulu melalui modul Master Data Pekebun.

---

### User Story 2 — Pemohon Memilih Jenis Dokumen Kepemilikan untuk Setiap Lahan (Priority: P1)

Sebagai Pemohon, saya ingin memilih jenis dokumen kepemilikan yang digunakan untuk setiap lahan yang saya ajukan — apakah menggunakan Sertifikat Hak Milik (SHM) atau dokumen kepemilikan lainnya (seperti Girik, Akta Jual Beli, SKT, atau dokumen adat) — sehingga data lahan yang diajukan dilengkapi dengan informasi legalitas yang jelas.

**Why this priority**: Dokumen kepemilikan lahan adalah syarat legalitas wajib untuk verifikasi; tanpa pemilihan ini, data lahan tidak lengkap dan proposal tidak dapat diproses.

**Independent Test**: Pilih lahan di Step 3, verifikasi dropdown/pilihan jenis dokumen kepemilikan muncul untuk setiap lahan, pilih SHM atau dokumen lainnya, dan verifikasi pilihan tersimpan.

**Acceptance Scenarios**:

1. **Given** Pemohon telah memilih lahan di Step 3, **When** lahan terpilih, **Then** setiap lahan menampilkan pilihan jenis dokumen kepemilikan dengan opsi "SHM" dan "Dokumen Lainnya".
2. **Given** Pemohon memilih "Dokumen Lainnya" untuk suatu lahan, **When** opsi dipilih, **Then** sistem menampilkan field tambahan untuk mengisi jenis dokumen (misalnya: Girik, Akta Jual Beli, SKT, Surat Keterangan Adat) dan nomor dokumen.
3. **Given** Pemohon memilih "SHM" untuk suatu lahan, **When** opsi dipilih, **Then** sistem menampilkan field nomor SHM.
4. **Given** Pemohon belum memilih jenis dokumen kepemilikan untuk lahan yang sudah dipilih, **When** mencoba melanjutkan ke pratinjau atau submit, **Then** sistem menampilkan validasi bahwa jenis dokumen kepemilikan wajib diisi untuk setiap lahan yang dipilih.
5. **Given** Pemohon telah mengisi jenis dan nomor dokumen untuk seluruh lahan terpilih, **When** melihat pratinjau proposal, **Then** informasi jenis dokumen kepemilikan dan nomor dokumen setiap lahan tercantum dalam ringkasan proposal.

---

### User Story 3 — Validasi Otomatis Kesesuaian Pekebun dan Luas Lahan terhadap Paket yang Dipilih (Priority: P1)

Sebagai Pemohon, saya ingin sistem secara otomatis memvalidasi apakah jumlah pekebun dan total luas lahan yang saya pilih sudah memenuhi persyaratan minimum paket sarpras yang dipilih di Step 1, sehingga saya tidak perlu menghitung manual dan dapat memastikan proposal saya memenuhi syarat sebelum submit.

**Why this priority**: Validasi ini mencegah proposal ditolak di tahap verifikasi karena tidak memenuhi syarat minimum; ini adalah safeguard kritis yang menyelamatkan waktu Pemohon dan petugas verifikasi.

**Independent Test**: Pilih paket di Step 1, lanjut ke Step 3, pilih pekebun dan lahan dengan jumlah di bawah minimum, verifikasi sistem menampilkan peringatan; tambah pekebun/lahan hingga memenuhi minimum, verifikasi peringatan hilang dan status valid.

**Acceptance Scenarios**:

1. **Given** Pemohon telah memilih paket sarpras di Step 1 dan berada di Step 3, **When** memilih pekebun dan lahan, **Then** sistem secara real-time membandingkan jumlah pekebun terpilih dan total luas lahan terpilih dengan persyaratan minimum paket dan menampilkan status validasi (memenuhi/belum memenuhi).
2. **Given** Jumlah pekebun terpilih dan total luas lahan BELUM memenuhi salah satu syarat minimum paket, **When** validasi dijalankan, **Then** sistem menampilkan peringatan dengan informasi: syarat minimum yang berlaku, jumlah pekebun saat ini, total luas saat ini, dan selisih kekurangannya.
3. **Given** Jumlah pekebun terpilih ATAU total luas lahan SUDAH memenuhi syarat minimum (kondisi "dan/atau"), **When** validasi dijalankan, **Then** sistem menampilkan status validasi "Memenuhi Syarat" dengan indikator hijau.
4. **Given** Paket yang dipilih adalah "Verifikasi atau Penelusuran Teknis", **When** berada di Step 3, **Then** sistem tidak menerapkan validasi minimum pekebun dan luas (karena paket ini tidak memiliki persyaratan minimal).
5. **Given** Paket yang dipilih memiliki persyaratan jarak antar kebun (Alat Transportasi, Mesin Pertanian), **When** Pemohon memilih pekebun dan lahan, **Then** sistem menampilkan informasi persyaratan jarak antar kebun sebagai catatan tambahan (validasi jarak dilakukan saat verifikasi lapangan).
6. **Given** Pemohon mencoba submit proposal, **When** validasi minimum pekebun dan luas BELUM terpenuhi, **Then** sistem menolak submit dan menampilkan pesan kesalahan yang menjelaskan persyaratan yang belum terpenuhi.

---

### Edge Cases

- Apa yang terjadi ketika pekebun yang sudah dipilih dihapus dari sistem (oleh admin) setelah Pemohon memulai sesi pengusulan? (Sistem menampilkan status "Data tidak tersedia" dan menyarankan Pemohon untuk me-refresh daftar.)
- Bagaimana jika total luas lahan berubah karena Pemohon membatalkan pilihan lahan tertentu? (Validasi diperbarui secara real-time; status berubah dari "Memenuhi" ke "Belum Memenuhi" jika total luas turun di bawah minimum.)
- Bagaimana jika Pemohon memilih pekebun yang jumlahnya memenuhi syarat tetapi seluruh lahannya sangat kecil sehingga total luas di bawah minimum? (Validasi tetap "Memenuhi" karena syarat bersifat "dan/atau" — salah satu terpenuhi sudah cukup.)
- Bagaimana jika Pemohon mengganti paket di Step 1 setelah mengisi data di Step 3? (Sistem mengonfirmasi bahwa perubahan paket akan menghapus pilihan pekebun dan lahan di Step 3 karena validasi harus dihitung ulang.)
- Apa yang terjadi jika Pemohon kembali ke Step 1 dan mengganti paket, lalu kembali ke Step 3? (Data pekebun dan lahan yang sudah dipilih di-reset; Pemohon harus memilih ulang.)
- Bagaimana jika tidak ada lahan yang memenuhi syarat jarak antar kebun? (Sistem menampilkan catatan bahwa verifikasi jarak akan dilakukan petugas lapangan; Pemohon tetap dapat submit dengan peringatan.)
- Bagaimana jika Pemohon memilih "Dokumen Lainnya" tetapi tidak mengisi jenis dokumen? (Sistem memvalidasi bahwa field jenis dokumen wajib diisi jika "Dokumen Lainnya" dipilih.)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menampilkan daftar pekebun beserta lahan terkait dalam tampilan gabungan (inline list) di Step 3, di mana setiap pekebun ditampilkan dengan lahan miliknya di bawahnya.
- **FR-002**: Sistem MUST menyediakan checkbox untuk memilih pekebun; lahan milik pekebun tersebut otomatis ikut terpilih.
- **FR-003**: Sistem MUST menampilkan ringkasan real-time total pekebun terpilih dan total luas lahan (dalam Hektar) di bagian atas atau bawah daftar.
- **FR-004**: Sistem MUST menampilkan field pemilihan jenis dokumen kepemilikan untuk setiap lahan yang dipilih, dengan opsi: "SHM" dan "Dokumen Lainnya".
- **FR-005**: Sistem MUST menampilkan field input nomor dokumen (SHM atau dokumen lainnya) untuk setiap lahan yang dipilih.
- **FR-006**: Sistem MUST menampilkan field input jenis dokumen (text input) ketika opsi "Dokumen Lainnya" dipilih, untuk mencatat jenis dokumen seperti Girik, Akta Jual Beli, SKT, Surat Keterangan Adat, atau lainnya.
- **FR-007**: Sistem MUST memvalidasi bahwa setiap lahan yang dipilih telah diisi jenis dokumen kepemilikan dan nomor dokumen sebelum mengizinkan submit.
- **FR-008**: Sistem MUST menerapkan validasi minimum pekebun dan/atau luas lahan berdasarkan paket sarpras yang dipilih, dengan ketentuan sebagai berikut:

  | Paket Sarpras | Minimal Pekebun | Minimal Luas | Keterangan Tambahan |
  |---|---|---|---|
  | Ekstensifikasi | 20 | 5 Ha | — |
  | Intensifikasi | 20 | 5 Ha | — |
  | Alat Pascapanen | 20 | 5 Ha | — |
  | Pengolahan Hasil | 40 | 10 Ha | — |
  | Jalan Kebun dan Jalan Akses ke Jalan Umum dan/atau ke Pelabuhan | 20 | 10 Ha | — |
  | Alat Transportasi — Alat angkut langsir | 25 | 10 Ha | Jarak antar kebun maks 0.5 km |
  | Alat Transportasi — Gerobak bermotor | 25 | 20 Ha | Jarak antar kebun maks 1 km |
  | Alat Transportasi — Truk | 25 | 50 Ha | Jarak antar kebun maks 1 km |
  | Mesin Pertanian | 25 | 10 Ha | Jarak antar kebun maks 0.5 km |
  | Pembentukan Infrastruktur Pasar | 40 | 10 Ha | — |
  | Verifikasi atau Penelusuran Teknis | — | — | Tidak ada minimal |

- **FR-009**: Sistem MUST menerapkan logika "dan/atau" pada validasi minimum: syarat dianggap terpenuhi jika jumlah pekebun terpilih >= minimal pekebun ATAU total luas lahan terpilih >= minimal luas.
- **FR-010**: Sistem MUST menampilkan status validasi secara real-time setiap kali Pemohon menambah atau mengurangi pilihan pekebun/lahan, dengan indikator visual (hijau = memenuhi, merah/kuning = belum memenuhi).
- **FR-011**: Sistem MUST menampilkan pesan peringatan yang informatif ketika validasi belum terpenuhi, mencakup: syarat minimum yang berlaku, nilai saat ini, dan selisih kekurangan.
- **FR-012**: Sistem MUST menampilkan catatan persyaratan jarak antar kebun untuk paket Alat Transportasi dan Mesin Pertanian sebagai informasi tambahan, tanpa melakukan validasi otomatis (karena validasi jarak memerlukan data geospasial yang diverifikasi di lapangan).
- **FR-013**: Sistem MUST menolak submit proposal jika validasi minimum pekebun dan luas belum terpenuhi, dengan pesan kesalahan yang jelas.
- **FR-014**: Sistem MUST menampilkan state kosong yang informatif ketika tidak ada pekebun terdaftar, dengan tautan atau panduan untuk mendaftarkan pekebun melalui modul Master Data Pekebun.
- **FR-015**: Sistem MUST menampilkan indikator "Belum ada lahan" untuk pekebun yang tidak memiliki lahan terdaftar dan menonaktifkan checkbox pekebun tersebut.
- **FR-016**: Sistem MUST menyimpan data pilihan pekebun, lahan, jenis dokumen kepemilikan, dan nomor dokumen di Pinia store agar tidak hilang saat berpindah antar step.

### Key Entities

- **Pekebun**: Individu petani pekebun yang terdaftar dalam sistem; memiliki atribut: nama, NIK, alamat, dan daftar lahan yang dimiliki.
- **Lahan**: Lahan pertanian yang dimiliki oleh pekebun; memiliki atribut: luas (Ha), alamat, koordinat, dan jenis dokumen kepemilikan.
- **Dokumen Kepemilikan Lahan**: Pilihan jenis dokumen legalitas kepemilikan lahan; memiliki atribut: jenis (SHM / Dokumen Lainnya), nama jenis dokumen lainnya (jika berlaku), dan nomor dokumen.
- **Validasi Minimum Paket**: Aturan validasi yang membandingkan total pekebun terpilih dan total luas lahan terpilih terhadap persyaratan minimum paket sarpras; memiliki atribut: minimal pekebun, minimal luas, persyaratan jarak antar kebun (jika ada).
- **Usulan / Proposal** (entitas utama dari spesifikasi induk 006-pengusulan-baru-revamp): Diperluas dengan data pilihan pekebun-lahan dan dokumen kepemilikan di Step 3.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pemohon dapat melihat seluruh pekebun dan lahan terkait dalam satu tampilan tanpa harus berpindah halaman atau melakukan pencarian terpisah.
- **SC-002**: Pemohon dapat memilih jenis dokumen kepemilikan (SHM/Dokumen Lainnya) dan mengisi nomor dokumen untuk setiap lahan dalam waktu kurang dari 30 detik per lahan.
- **SC-003**: Status validasi minimum pekebun dan luas lahan diperbarui secara real-time (dalam waktu kurang dari 1 detik) setiap kali Pemohon mengubah pilihan.
- **SC-004**: Pemohon yang memilih pekebun dan lahan di bawah syarat minimum menerima peringatan yang jelas dan tidak dapat melakukan submit proposal.
- **SC-005**: 100% proposal yang berhasil disubmit telah memenuhi validasi jenis dokumen kepemilikan (semua lahan terpilih memiliki jenis dan nomor dokumen) dan validasi minimum paket (jumlah pekebun atau total luas memenuhi syarat).
- **SC-006**: Pemohon dapat menyelesaikan seluruh pemilihan pekebun, lahan, dan pengisian dokumen kepemilikan di Step 3 dalam waktu kurang dari 5 menit untuk jumlah pekebun hingga 50 orang.

---

## Assumptions

- Daftar pekebun dan lahan diambil dari modul Master Data Pekebun yang sudah tersedia di sistem (sesuai spesifikasi 004-master-data-pekebun).
- Data pekebun dan lahan disediakan oleh backend API; jika endpoint belum tersedia, data akan menggunakan konfigurasi statis untuk keperluan pengembangan frontend (sesuai Prinsip XIII Konstitusi).
- Persyaratan minimum paket yang digunakan dalam validasi mengacu pada tabel yang diberikan oleh user dan bersifat statis (hardcoded) di frontend hingga tersedia endpoint konfigurasi dari backend.
- "Dan/atau" pada persyaratan minimum berarti kondisi OR: salah satu syarat terpenuhi (jumlah pekebun >= minimal ATAU total luas >= minimal) sudah cukup untuk memenuhi validasi.
- Validasi jarak antar kebun untuk paket Alat Transportasi dan Mesin Pertanian hanya ditampilkan sebagai informasi; validasi aktual dilakukan oleh petugas verifikasi lapangan karena memerlukan data koordinat dan perhitungan geospasial.
- Pemilihan dokumen kepemilikan "SHM" atau "Dokumen Lainnya" tidak memerlukan upload dokumen di Step 3; dokumen fisik diperiksa saat verifikasi administrasi.
- Fitur pratinjau proposal dan submit proposal tetap mengikuti perilaku yang sudah didefinisikan di spesifikasi 006-pengusulan-baru-revamp (User Story 3).
- Fitur ini khusus untuk role PEMOHON; role lain tidak memiliki akses ke Step 3 pengusulan.
- Data yang disimpan di Pinia store bersifat sementara selama sesi; data dikirim ke backend hanya saat submit proposal.