# Feature Specification: Modul Penyaluran Barang (Ekstensifikasi & Intensifikasi)

**Feature Branch**: `045-penyaluran-barang-ekstensifikasi-intensifikasi`

**Created**: 2026-08-27

**Status**: Ready for Planning / Clarified

**Input**: User description: "nah ini kan mau buat modul baru terkait penyaluran barang khusus EKSTENSIFIKASI & INTENSIFIKASI, saya mau anda buatkan mockupnya dahulu dan dilihat dari yang existing sekarang. tolong jangan sampe menggangu file2 yang lain dan yang sudah ada"

---

## 1. Latar Belakang & Konteks Bisnis

Modul **Penyaluran Barang Khusus Ekstensifikasi & Intensifikasi** dirancang untuk mengelola alur permohonan pengadaan barang dari Lembaga Pekebun hingga pelaksanaan kontrak dan penugasan surveyor. 

Alur ini mengadopsi struktur peran (*roles*) berikut:
- **Kelembagaan Pekebun**: Pengajuan permohonan, pemilihan preferensi item RAB barang, download & upload surat permohonan.
- **BPDP Verifikator** *(BPDP Teknis)*: Verifikasi kelayakan permohonan, penerbitan nota dinas ke PPK, dan pengelolaan kontrak & surat tugas monitoring.
- **BPDP PPK** *(Role Baru)*: Penerimaan nota dinas/permohonan dan disposisi ke BPDP ULP (atau Pejabat Pengadaan untuk nilai < 200 juta).
- **BPDP ULP** *(Role Baru)*: Pelaksanaan proses tender / e-catalog, pembaruan status pemilihan penyedia, dan penetapan pemenang tender.
- **Penyedia Barang/Jasa (Vendor)** & **Surveyor**: Pihak eksternal terkait pelaksanaan pemenuhan barang dan sampling/monitoring.

Sesuai prinsip arsitektur dan instruksi pengguna, implementasi modul ini akan diawali dengan **Mockup Komprehensif & Terisolasi** yang mengadopsi standar visual antarmuka existing tanpa mengubah atau merusak logika modul yang telah berjalan (*non-destructive addition*).

---

## Clarifications

### Session 2026-08-27
- Q: Bagaimana data alur permohonan dalam mockup ini disimulasikan antar role? → A: Simpan di Pinia Store + LocalStorage sehingga permohonan yang diisi Pekebun langsung mengalir dan muncul di antrean Verifikator, PPK, dan ULP saat berpindah role.
- Q: Bagaimana menu navigasi dan entry point mockup Penyaluran Barang ini diletakkan di aplikasi? → A: Tambahkan grup menu baru 'Penyaluran Barang' di sidebar untuk masing-masing role (Pekebun, Verifikator, PPK, ULP) dengan badge penanda 'Mockup'.
- Q: Bagaimana mekanisme fitur 'Download Format Surat Permohonan' pada mockup Pekebun? → A: Generate PDF interaktif di browser (berisi data nama lembaga, rincian preferensi item RAB, tanggal & kolom tanda tangan) yang langsung ter-download saat diklik.

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - Pengajuan Permohonan Penyaluran Barang oleh Kelembagaan Pekebun (Priority: P1)

Sebagai Pengurus Lembaga Pekebun, saya ingin mengajukan permohonan penyaluran barang paket Ekstensifikasi/Intensifikasi, memilih preferensi item barang berdasarkan RAB, mengunduh surat permohonan resmi, dan mengunggah kembali surat yang telah ditandatangani sehingga permohonan masuk ke antrean verifikasi BPDP.

**Why this priority**: Merupakan gerbang utama (*entry point*) seluruh proses bisnis pengadaan barang.

**Independent Test**: Masuk sebagai role Kelembagaan Pekebun, buka menu *Penyaluran Barang*, lengkapi form preferensi RAB barang, unduh template surat, unggah berkas surat permohonan, dan submit permohonan.

**Acceptance Scenarios**:
1. **Given** Pengurus Pekebun membuka menu *Penyaluran Barang*, **When** menginput preferensi barang (Jenis Barang, Nama Barang/Varietas, Jumlah per item, Satuan), **Then** daftar item RAB tersimpan dengan valid ke Pinia State.
2. **Given** Data permohonan telah diinput, **When** menekan tombol *Download Surat Permohonan*, **Then** browser men-generate dan mengunduh berkas PDF resmi surat permohonan yang terisi nama lembaga, tanggal, dan rincian tabel barang.
3. **Given** Dokumen telah ditandatangani, **When** mengunggah berkas PDF surat permohonan dan menekan *Kirim Permohonan*, **Then** status permohonan berubah menjadi `Menunggu Verifikasi BPDP` dan permohonan otomatis tersinkronisasi ke antrean BPDP Verifikator melalui local persistent store.

---

### User Story 2 - Verifikasi Permohonan & Nota Dinas oleh BPDP Verifikator (Priority: P1)

Sebagai BPDP Verifikator (Teknis), saya ingin memeriksa berkas surat permohonan dan rincian barang dari Kelembagaan Pekebun, serta memutuskan apakah permohonan disetujui (diteruskan ke PPK via Nota Dinas) atau dikembalikan ke pekebun untuk perbaikan.

**Why this priority**: Memastikan validitas administrasi dan kelayakan teknis sebelum proses pengadaan anggaran berlanjut.

**Independent Test**: Masuk sebagai BPDP Verifikator, buka daftar antrean verifikasi penyaluran barang, periksa dokumen dan data permohonan, lalu pilih opsi *Setuju (Kirim Nota Dinas)* atau *Perlu Revisi (Kembalikan ke Pekebun)*.

**Acceptance Scenarios**:
1. **Given** Terdapat permohonan baru dari pekebun, **When** Verifikator menemukan ketidaksesuaian dan memilih *Tolak / Revisi* beserta catatan alasan, **Then** status permohonan berubah menjadi `Perlu Revisi` dan kembali ke form pekebun untuk diperbaiki.
2. **Given** Data dan berkas permohonan lengkap dan valid, **When** Verifikator memilih *Setujui*, **Then** sistem mencatat pengiriman Nota Dinas Teknis ke BPDP PPK dan mengubah status menjadi `Disposisi ke PPK`.

---

### User Story 3 - Disposisi Pengadaan oleh BPDP PPK (Priority: P1)

Sebagai BPDP PPK (Pejabat Pembuat Komitmen), saya ingin menerima nota dinas permohonan pengadaan barang dan mendisposisikannya ke BPDP ULP (atau Pejabat Pengadaan jika total nilai di bawah 200 juta rupiah).

**Why this priority**: Merupakan tahap penentuan jalur tata kelola pengadaan barang pemerintah (ULP vs Pejabat Pengadaan Langsung).

**Independent Test**: Masuk sebagai BPDP PPK, buka daftar permohonan pengadaan masuk, lihat estimasi nilai permohonan, dan lakukan aksi disposisi ke ULP atau Pejabat Pengadaan.

**Acceptance Scenarios**:
1. **Given** Permohonan dengan nilai >= Rp 200 Juta, **When** PPK menekan *Disposisi ke ULP*, **Then** permohonan masuk ke antrean BPDP ULP dan status berubah menjadi `Disposisi ke ULP`.
2. **Given** Permohonan dengan nilai < Rp 200 Juta, **When** PPK memilih jalur *Pengadaan Langsung*, **Then** sistem menandai permohonan diproses oleh Pejabat Pengadaan.

---

### User Story 4 - Pemilihan Vendor / Tender oleh BPDP ULP (Priority: P1)

Sebagai BPDP ULP (Unit Layanan Pengadaan), saya ingin mencatat pelaksanaan tender/pemilihan vendor di *e-catalog*, mengubah status menjadi proses pemilihan penyedia, serta menetapkan pemenang tender.

**Why this priority**: Menghubungkan proses internal sistem dengan status tender *e-catalog* hingga diperoleh pemenang penyedia barang.

**Independent Test**: Masuk sebagai BPDP ULP, pilih permohonan dari antrean tender, klik *Mulai Pemilihan Penyedia*, kemudian setelah tender selesai klik *Selesai & Tetapkan Pemenang*.

**Acceptance Scenarios**:
1. **Given** Permohonan berstatus `Disposisi ke ULP`, **When** BPDP ULP memulai proses tender, **Then** status permohonan berubah menjadi `Proses Pemilihan Penyedia`.
2. **Given** Proses tender/e-catalog di luar aplikasi telah selesai, **When** BPDP ULP memasukkan data pemenang dan menekan *Klik Selesai*, **Then** permohonan berlanjut ke tahap pembuatan kontrak di BPDP Verifikator.

---

### User Story 5 - Pengelolaan Kontrak "Dokumen A" & Penugasan Surveyor oleh BPDP Verifikator (Priority: P1)

Sebagai BPDP Verifikator (Teknis), saya ingin menginput dan mengunggah rincian data kontrak Dokumen "A" bersama vendor pemenang, mengubah status ke pelaksanaan kontrak, serta menerbitkan surat penugasan sampling & monitoring kepada Surveyor.

**Why this priority**: Memastikan kepatuhan legalitas kontrak dan kesiapan pengawasan mutu fisik barang oleh surveyor independen.

**Independent Test**: Masuk sebagai BPDP Verifikator, buka permohonan berstatus penetapan pemenang, isi form data kontrak Dokumen "A", unggah berkas kontrak, submit perubahan status ke pelaksanaan kontrak, dan buat surat tugas monitoring surveyor.

**Acceptance Scenarios**:
1. **Given** Verifikator membuka form Kontrak Pengadaan, **When** mengisi atribut Dokumen "A" (Nomor Kontrak, Dokumen PDF, Nama Vendor, Harga Satuan, Total Nilai Kontrak, Termin Pembayaran, Termin Penyaluran, Jangka Waktu Pemenuhan), **Then** data kontrak tersimpan dan status menjadi `Proses Pelaksanaan Kontrak`.
2. **Given** Data kontrak telah tersimpan, **When** Verifikator membuat surat penugasan, **Then** sistem mencatat penerbitan surat tugas sampling & monitoring ke Surveyor serta pengumuman ke Vendor.

---

### User Story 6 - Navigasi Mockup & Multi-Role Switching (Priority: P2)

Sebagai Pengguna / Reviewer, saya ingin melihat menu navigasi 'Penyaluran Barang' berlabel badge 'Mockup' di sidebar setiap role dan dapat beralih peran untuk menguji kelanjutan siklus permohonan secara real-time tanpa mengganggu modul proposal Sarpras yang sudah berjalan.

**Why this priority**: Memfasilitasi demonstrasi interaktif dan user testing yang seamless.

**Independent Test**: Navigasi ke menu sidebar Penyaluran Barang pada tiap role, lakukan aksi tahapan, ganti role via topbar Role Switcher, dan periksa data yang otomatis ter-update.

**Acceptance Scenarios**:
1. **Given** Pengguna berada pada role Pekebun/Verifikator/PPK/ULP, **When** melihat navigasi sidebar, **Then** terdapat menu *Penyaluran Barang (Mockup)* yang mengarah ke view masing-masing role.
2. **Given** Perubahan data permohonan di salah satu role, **When** berganti role di topbar, **Then** data langsung tersinkronisasi di antrean role tujuan berkat reactive Pinia + LocalStorage store.

---

### Edge Cases

- **Pengembalian Berulang**: Jika verifikator mengembalikan permohonan ke pekebun, seluruh riwayat catatan revisi sebelumnya tetap tersimpan dan dapat dibaca oleh pekebun.
- **File Upload Format & Size**: Unggah dokumen permohonan dan kontrak hanya menerima format PDF dengan batas maksimum 5 MB.
- **Nilai Kontrak Melebihi Pagu RAB**: Validasi peringatan jika total nilai kontrak yang diinput verifikator melampaui estimasi total RAB permohonan.
- **Tender Batal / Gagal**: ULP dapat memberikan catatan kendala tender jika terjadi pembatalan sebelum klik selesai.

---

## 3. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menyediakan menu dan form **Permohonan Penyaluran Barang (Ekstensifikasi & Intensifikasi)** untuk role Kelembagaan Pekebun dengan badge label `Mockup`.
- **FR-002**: Sistem HARUS mendukung penginputan preferensi item barang RAB meliputi: *Jenis Barang, Nama Barang (Varietas), Jumlah per item, Satuan*.
- **FR-003**: Sistem HARUS menyediakan fitur unduh template dokumen surat permohonan pengadaan barang interaktif (PDF client-side generator).
- **FR-004**: Sistem HARUS menyediakan fitur unggah berkas surat permohonan bertandatangan (PDF) oleh Kelembagaan Pekebun.
- **FR-005**: Sistem HARUS menyediakan antrean verifikasi untuk role **BPDP Verifikator (Teknis)** dengan opsi: *Setujui (Lanjut Nota Dinas ke PPK)* atau *Kembalikan ke Pekebun (Revisi)*.
- **FR-006**: Sistem HARUS menyediakan antrean permohonan untuk role **BPDP PPK** dengan opsi disposisi ke BPDP ULP atau Pengadaan Langsung (< 200 juta).
- **FR-007**: Sistem HARUS menyediakan antrean tender untuk role **BPDP ULP** dengan kemampuan mengubah status permohonan menjadi `"Proses Pemilihan Penyedia"` dan menetapkan pemenang tender.
- **FR-008**: Sistem HARUS menyediakan form penginputan dan pengunggahan **Dokumen Kontrak "A"** oleh BPDP Verifikator dengan atribut:
  1. Nomor Kontrak
  2. Upload Dokumen Kontrak (PDF)
  3. Nama Penyedia / Vendor
  4. Jenis Barang (prefilled dari permohonan)
  5. Jumlah Barang (prefilled dari permohonan)
  6. Harga Satuan
  7. Total Nilai Kontrak
  8. Termin Pembayaran
  9. Termin Penyaluran
  10. Jangka Waktu Pelaksanaan / Pemenuhan Barang
- **FR-009**: Sistem HARUS memperbarui status permohonan menjadi `"Proses Pelaksanaan Kontrak"` setelah data Dokumen Kontrak "A" lengkap tersimpan.
- **FR-010**: Sistem HARUS menyediakan pencatatan pembuatan surat pelaksanaan sampling & monitoring ke Surveyor serta pengumuman ke Vendor.
- **FR-011**: Data permohonan HARUS dipersistensikan secara reaktif menggunakan Pinia Store + LocalStorage sehingga perubahan status mengalir instan saat pengguna berganti role.
- **FR-012**: Seluruh komponen tampilan, store, dan routing mockup HARUS terisolasi (*self-contained*) dan TIDAK BOLEH merusak atau menghapus file kode dan modul yang sudah ada di repositori.

---

### Key Entities

- **PermohonanPenyaluranBarang**:
  - `id`: Unique identifier permohonan
  - `nomorPermohonan`: Nomor register permohonan
  - `lembagaPekebunId` / `namaLembaga`: Identitas lembaga pemohon
  - `kategoriPaket`: `"Ekstensifikasi"` | `"Intensifikasi"`
  - `status`: `"DRAFT"` | `"MENUNGGU_VERIFIKASI_TEKNIS"` | `"PERLU_REVISI"` | `"DISPOSISI_PPK"` | `"DISPOSISI_ULP"` | `"PROSES_PEMILIHAN_PENYEDIA"` | `"PENETAPAN_PEMENANG"` | `"PROSES_PELAKSANAAN_KONTRAK"`
  - `suratPermohonanUrl`: URL/Path berkas surat permohonan
  - `catatanRevisi`: Catatan pengembalian dari Verifikator
  - `createdAt`, `updatedAt`

- **ItemPreferensiRAB**:
  - `id`: Identifier item barang
  - `permohonanId`: Relasi ke permohonan
  - `jenisBarang`: Kategori/jenis sarana (e.g. Benih Kelapa, Pupuk NPK, Pestisida)
  - `namaBarangVarietas`: Spesifikasi/varietas barang
  - `jumlah`: Volume/kuantitas
  - `satuan`: Satuan ukuran (e.g. Batang, Kg, Liter, Paket)

- **DokumenKontrakPengadaan (Dokumen "A")**:
  - `id`: Identifier kontrak
  - `permohonanId`: Relasi ke permohonan
  - `nomorKontrak`: String nomor perjanjian kontrak
  - `dokumenKontrakUrl`: URL berkas kontrak PDF
  - `namaPenyedia`: Nama badan usaha / vendor rekanan
  - `hargaSatuan`: Nilai rupiah per unit
  - `totalNilaiKontrak`: Total nominal kontrak (Rupiah)
  - `terminPembayaran`: Rincian termin / tahapan pembayaran
  - `terminPenyaluran`: Rincian termin drop barang / pengiriman
  - `jangkaWaktuHari`: Durasi hari kalender pelaksanaan

---

## 4. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pengguna Kelembagaan Pekebun dapat menyelesaikan proses input preferensi RAB hingga submit upload surat permohonan dalam waktu kurang dari 3 menit.
- **SC-002**: 100% transisi status workflow (Pekebun -> Verifikator -> PPK -> ULP -> Verifikator Kontrak) terpetakan dengan visual indikator status badge dan timeline tracker yang jelas.
- **SC-003**: Semua interaksi input form, modal upload dokumen, dan tabel ringkasan berjalan responsif pada perangkat mobile (375px) hingga desktop tanpa horizontal window overflow.
- **SC-004**: Tidak ada konflik atau regresi kode terhadap komponen, router, atau store existing (`0% broken existing features`).
- **SC-005**: Alur data lintas role berjalan konsisten 100% saat pengguna berpindah role di topbar Role Switcher.

---

## 5. Assumptions

- **A-001**: Proses pemilihan tender di e-catalog, pembuatan fisik kontrak, dan penerbitan fisik surat tugas surveyor dilakukan di luar aplikasi (*off-system process*), sedangkan sistem berfungsi sebagai pencatat status, pengunggah berkas legalitas, dan orkestrator data pengadaan.
- **A-002**: Integrasi backend sebenarnya akan mengikuti kontrak data model ini; saat ini frontend akan menyiapkan mockup interaktif dengan Pinia simulated state + LocalStorage yang dapat langsung dialihkan ke real API ketika endpoint backend telah tersedia.
- **A-003**: Standar desain mengikuti Forest Green `#066C2A` dengan font inter dan token UI/UX yang telah dibakukan pada Konstitusi Proyek.
