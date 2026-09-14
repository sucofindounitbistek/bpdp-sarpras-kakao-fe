# Feature Specification: RAB PDF Generation

**Feature Branch**: `030-generate-rab-pdf`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "i need to change the generate rab to generate to pdf instead of excel. get the pekebun name and alamat to also be shown like the image above"

## Clarifications

### Session 2026-08-10

- Q: Jika profil kelembagaan kosong/belum terisi di draf, apakah harus menggunakan fallback 'Kelompok Tani Bukan Karyawan Baru' dan 'Sleman Semabda'? → A: Ya, jika profil kelembagaan kosong atau menggunakan nilai default, sistem harus menggunakan fallback 'Kelompok Tani Bukan Karyawan Baru' sebagai nama lembaga dan 'Sleman Semabda' sebagai alamat.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unduh RAB dalam Format PDF (Priority: P1) 🎯 MVP

Sebagai Pengurus Lembaga Pekebun, saya ingin mengunduh rancangan anggaran biaya (RAB) dalam format PDF yang rapi, sehingga saya dapat mencetaknya dan menandatanganinya dengan mudah.

**Why this priority**: Format PDF adalah standar dokumen resmi yang akan ditandatangani secara basah lalu diunggah kembali ke sistem. Menggantikan unduhan CSV/Excel dengan PDF meningkatkan validitas dokumen usulan.

**Independent Test**:
1. Login sebagai role "Lembaga Pekebun (Pemohon)".
2. Masuk ke halaman Form Usulan Baru (`/pengusulan/baru`).
3. Selesaikan Langkah 1 (Paket & Dokumen) dan lanjut ke Langkah 2 (RAB).
4. Tambahkan minimal satu baris RAB.
5. Klik tombol "Unduh RAB".
6. Verifikasi bahwa dokumen yang dihasilkan adalah PDF (atau memicu antarmuka print browser untuk disimpan sebagai PDF) dengan format tabel yang lengkap dan rapi, bukan CSV atau Excel.

**Acceptance Scenarios**:

1. **Given** Pemohon berada di Step 2 dan memiliki baris RAB, **When** mengklik "Unduh RAB", **Then** sistem memicu proses cetak/unduh PDF menggunakan tata letak cetak (print layout) yang sesuai.
2. **Given** Dokumen RAB PDF sedang dicetak/diunduh, **When** proses selesai, **Then** dokumen menampilkan judul, sub-judul kelompok tani, alamat, nama paket sarpras, tabel detail biaya, dan baris pembulatan di bagian bawah.

---

### User Story 2 - Menampilkan Informasi Lembaga Pekebun dan Alamat (Priority: P1)

Sebagai Pengurus Lembaga Pekebun, saya ingin dokumen PDF RAB menampilkan nama Kelompok Tani dan Alamat Lengkap sesuai dengan profil kelembagaan yang terdaftar agar dokumen bersifat resmi dan absah.

**Why this priority**: Informasi identitas pengusul penting untuk keabsahan berkas usulan sarpras yang akan diverifikasi oleh dinas terkait.

**Independent Test**:
1. Pastikan draf usulan memiliki data nama lembaga dan alamat.
2. Klik tombol "Unduh RAB".
3. Periksa bagian header dokumen PDF yang dihasilkan.
4. Verifikasi bahwa nama Kelompok Tani/Koperasi dan Alamat tercetak jelas di bawah judul "Rancangan Anggaran Biaya".

**Acceptance Scenarios**:

1. **Given** Pemohon memiliki profil lembaga terdaftar, **When** mengunduh RAB PDF, **Then** header dokumen menampilkan nama kelompok tani dan alamat secara presisi.

---

### Edge Cases

- **Tabel Kosong**: Tombol "Unduh RAB" harus memicu toast warning jika pengguna belum menambahkan baris RAB sama sekali.
- **Nilai Desimal pada Pembulatan**: Jika biaya total memiliki nilai desimal, baris Pembulatan Kebawah pertama menampilkan bagian bulat, dan baris kedua menampilkan bagian desimal/selisih pembulatan (misalnya `0` jika bulat).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST mengganti fitur unduhan template CSV/Excel dengan fitur cetak/simpan PDF pada tombol "Unduh RAB" di `StepRAB.vue`.
- **FR-002**: Dokumen PDF yang dihasilkan MUST menggunakan tata letak cetak yang bersih dan rapi (latar belakang putih, teks hitam/slate, border tipis, font modern).
- **FR-003**: Header dokumen MUST menampilkan judul `"Rancangan Anggaran Biaya"`, nama Kelompok Tani/Koperasi di bawahnya, dan alamat lengkap di bawahnya lagi.
- **FR-004**: Sistem MUST mengambil nama Kelompok Tani dan Alamat secara dinamis dari profil kelembagaan. Jika data tersebut kosong atau bernilai default, sistem MUST menggunakan fallback 'Kelompok Tani Bukan Karyawan Baru' sebagai nama lembaga dan 'Sleman Semabda' sebagai alamat.
- **FR-005**: Tabel di dalam PDF MUST menampilkan judul paket sarpras yang dipilih sebagai sub-header di baris pertama tabel (misal: `Ekstensifikasi (Bibit atau Benih, Pupuk dan Pestisida)`).
- **FR-006**: Kolom tabel MUST sesuai dengan paket sarpras yang aktif:
  - Untuk paket pertanian/UPH: `Jenis`, `Barang`, `Jumlah Tahap 1`, `Jumlah Tahap 2`, `Jumlah Total`, `Satuan`, `Harga`, `Biaya`.
  - Untuk paket lainnya: `Tahap`, `Uraian`, `Volume`, `Satuan`, `Harga Satuan`, `Sub-total`.
- **FR-007**: Bagian bawah tabel MUST menampilkan baris `Total Biaya`, `Pembulatan Kebawah` (nilai bulat), dan `Pembulatan Kebawah` (nilai selisih desimal, default `0`).

### Key Entities *(include if feature involves data)*

- **RAB Record**: Kumpulan baris rencana anggaran biaya yang diinput oleh pemohon.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% unduhan draf RAB dialihkan dari format file tabular (.csv) menjadi dokumen cetak PDF (.pdf).
- **SC-002**: Nama Kelompok Tani dan Alamat tertera dengan rasio kontras tinggi dan layout yang rapi (bebas dari pemotongan teks atau overflow).

## Assumptions

- **A-001**: Fitur cetak PDF diimplementasikan menggunakan metode pencetakan window/iframe asli browser (`window.print()` / hidden iframe print document) untuk menghindari penambahan pustaka eksternal yang berat.
- **A-002**: Data Kelompok Tani dan Alamat diambil dari profil kelembagaan yang aktif pada draf usulan, dengan fallback ke 'Kelompok Tani Bukan Karyawan Baru' dan 'Sleman Semabda' jika data tersebut kosong atau berupa nilai default.
