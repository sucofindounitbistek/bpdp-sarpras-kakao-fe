# Feature Specification: Format Nomor Surat Pengajuan / SPKA Bulanan (Monthly)

**Feature Branch**: `038-spka-numbering-format`

**Created**: 14 Agustus 2026

**Status**: Draft

**Input**: User description: "SPKA+Jenis paket+BULAN PEMBUATAN+TAHUN PEMBUATAN+URUTAN PERBULANNYA Contoh : SPKA+1+06+26+0001 (Ekstensifikasi) Pemilihan Jenis Paket Sarpras : 1 Ekstensifikasi (Benih, Pupuk, Pestisida) 2 Intensifikasi (Pupuk dan Pestisida) 3 Alat pascapanen 4 Unit Pengolahan Hasil 5 Jalan kebun dan jalan akses ke jalan umum dan/atau ke pelabuhan 6 Alat transportasi 7 Mesin pertanian 8 Infrastruktur pasar 9 Verifikasi atau penelusuran teknis buatkan nomornya bersifat monthly ya"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generasi Otomatis Nomor Proposal / SPKA Sesuai Kode Paket dan Bulan (Priority: P1)

Sebagai Pemohon / Sistem Pengusulan Sarpras, saya ingin nomor pengusulan/SPKA dibuat secara otomatis mengikuti format baku (`SPKA` + `Kode Paket` + `Bulan` + `Tahun` + `Urutan Monthly`) saat proposal baru dibuat, agar pengkodean pengajuan terstruktur, unik, dan mudah diidentifikasi.

**Why this priority**: Format nomor SPKA adalah fondasi identifikasi dokumen resmi usulan bantuan Sarpras Kelapa pada seluruh tahapan workflow (Dinas, Ditjenbun, BPDPKS).

**Independent Test**: Dapat diuji secara independen dengan membuat proposal pengajuan baru untuk jenis paket tertentu dan memverifikasi nomor usulan yang dihasilkan mengikuti pola kode paket, bulan, tahun, dan nomor urut.

**Acceptance Scenarios**:

1. **Given** Pemohon memilih jenis paket "Ekstensifikasi (Benih, Pupuk, Pestisida)" (Kode 1) pada bulan Juni 2026, **When** proposal dibuat sebagai usulan ke-1 pada bulan tersebut, **Then** sistem menghasilkan nomor usulan `SPKA106260001`.
2. **Given** Pemohon memilih jenis paket "Alat pascapanen" (Kode 3) pada bulan Agustus 2026, **When** proposal dibuat sebagai usulan ke-12 pada bulan tersebut, **Then** sistem menghasilkan nomor usulan `SPKA308260012`.
3. **Given** Pemohon memilih jenis paket "Jalan kebun dan jalan akses" (Kode 5) pada bulan Desember 2026, **When** proposal dibuat, **Then** sistem menggunakan digit bulan `12` dan digit tahun `26`.

---

### User Story 2 - Riset dan Reset Urutan Nomor Penomoran Setiap Bulan (Monthly Reset) (Priority: P2)

Sebagai Pengelola Sistem, saya ingin nomor urut di bagian akhir nomor SPKA otomatis direset kembali ke `0001` setiap berganti bulan kalender, agar urutan penomoran bersifat bulanan (*monthly sequence*).

**Why this priority**: Memastikan nomor urut tidak terus membesar tanpa batas dan memudahkan rekapitulasi volume pengajuan bulanan per periode.

**Independent Test**: Dapat diuji dengan mensimulasikan pembuat usulan pada akhir bulan (misal bulan 06) dan pembuat usulan pada awal bulan berikutnya (bulan 07), lalu memastikan nomor urut kembali dari `0001`.

**Acceptance Scenarios**:

1. **Given** usulan terakhir pada bulan Mei 2026 memiliki nomor urut `0045` (`SPKA105260045`), **When** proposal pertama dibuat pada tanggal 1 Juni 2026 untuk paket yang sama/berbeda, **Then** nomor urut direset kembali menjadi `0001` (`SPKA106260001`).
2. **Given** terdapat beberapa usulan dibuat pada bulan yang sama, **When** usulan baru dibuat, **Then** nomor urut bertambah secara inkremental (`0001`, `0002`, `0003`, dst.) terhitung khusus untuk bulan berjalan.

---

### User Story 3 - Pemetaan Lengkap 9 Kode Jenis Paket Sarpras (Priority: P3)

Sebagai Sistem Pengusulan, saya ingin 9 jenis paket Sarpras terpetakan secara presisi ke kode digit 1-9 dalam struktur nomor SPKA.

**Why this priority**: Memastikan seluruh 9 varian bantuan Sarpras Kelapa memiliki pengkodean resmi yang konsisten dan akurat.

**Independent Test**: Memverifikasi pemetaan kode 1 sampai 9 saat pemohon memilih masing-masing dari 9 jenis paket Sarpras.

**Acceptance Scenarios**:

1. **Given** daftar jenis paket Sarpras, **When** jenis paket dipilih, **Then** kode angka tunggal (1-9) berikut disisipkan pada posisi ke-2 dalam struktur nomor SPKA:
   - `1`: Ekstensifikasi (Benih, Pupuk, Pestisida)
   - `2`: Intensifikasi (Pupuk dan Pestisida)
   - `3`: Alat pascapanen
   - `4`: Unit Pengolahan Hasil
   - `5`: Jalan kebun dan jalan akses ke jalan umum dan/atau ke pelabuhan
   - `6`: Alat transportasi
   - `7`: Mesin pertanian
   - `8`: Infrastruktur pasar
   - `9`: Verifikasi atau penelusuran teknis

---

### Edge Cases

- **Bagaimana jika usulan dibuat tepat saat pergantian bulan (misal 23:59:59 tanggal 31 ke 00:00:01 tanggal 1)?**
  Sistem harus menggunakan timestamp server resmi saat usulan dibuat untuk menentukan bulan dan tahun pembuatan serta mengambil counter bulanan yang sesuai.
- **Bagaimana jika dua usulan dibuat secara bersamaan (*concurrent submission*) di bulan yang sama?**
  Sistem harus menjamin nomor urut bulanan bersifat atomik dan unik sehingga tidak ada dua proposal yang mendapatkan nomor SPKA yang persis sama.
- **Bagaimana jika format tampilan nomor memerlukan pemisah (*separator*) seperti `SPKA-1-06-26-0001` vs `SPKA106260001`?**
  Format standar yang tersimpan adalah gabungan string padat `SPKA` + `[Kode]` + `[MM]` + `[YY]` + `[0000]`, namun tampilan UI dapat mendukung format dengan atau tanpa separator secara konsisten.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menggenerasi nomor SPKA otomatis dengan struktur `SPKA` + `[Kode Jenis Paket 1-9]` + `[Bulan 2-digit MM]` + `[Tahun 2-digit YY]` + `[Nomor Urut Bulanan 4-digit 0001-9999]`.
- **FR-002**: Sistem MUST memetakan 9 Jenis Paket Sarpras ke kode digit tunggal berikut:
  - Code `1`: Ekstensifikasi (Benih, Pupuk, Pestisida)
  - Code `2`: Intensifikasi (Pupuk dan Pestisida)
  - Code `3`: Alat pascapanen
  - Code `4`: Unit Pengolahan Hasil
  - Code `5`: Jalan kebun dan jalan akses ke jalan umum dan/atau ke pelabuhan
  - Code `6`: Alat transportasi
  - Code `7`: Mesin pertanian
  - Code `8`: Infrastruktur pasar
  - Code `9`: Verifikasi atau penelusuran teknis
- **FR-003**: Sistem MUST mereset penomoran urut (4 digit terakhir) menjadi `0001` setiap awal bulan kalender baru (00:00 WIB tanggal 1 tiap bulan).
- **FR-004**: Sistem MUST menjamin keunikan nomor SPKA untuk setiap usulan proposal yang diterbitkan.
- **FR-005**: Sistem MUST menampilkan nomor SPKA yang telah digenerasi pada seluruh dokumen terkait (Formulir Pengusulan, Tabel Tracking Proposal, Ringkasan Usulan, Dokumen Rekomtek, dan SK).

### Key Entities

- **NomorSPKA**: Entitas pengkodean usulan resmi yang mengandung atribut:
  - `prefix`: Constant string "SPKA"
  - `kodePaket`: Single digit char/string ('1' s/d '9')
  - `bulan`: 2-digit string ('01' s/d '12')
  - `tahun`: 2-digit string ('26', '27', dst.)
  - `urutanBulanan`: 4-digit zero-padded string ('0001' s/d '9999')
  - `formattedNumber`: String lengkap hasil penggabungan (misal `SPKA106260001`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% proposal baru yang dibuat mendapatkan nomor SPKA otomatis sesuai rumus dan kode paket yang dipilih.
- **SC-002**: 100% nomor urut bulanan direset secara otomatis menjadi `0001` pada pergantian bulan kalender tanpa adanya nomor duplikat.
- **SC-003**: Waktu generasi nomor SPKA saat pembuatan proposal berlangsung di bawah 1 detik tanpa menghambat alur pengusulan pengguna.

## Assumptions

- Tahun pembuatan diwakili oleh 2 digit terakhir tahun kalender (misal 2026 -> `26`).
- Bulan pembuatan diwakili oleh 2 digit bulan kalender dengan pad zero (misal Juni -> `06`).
- Urutan penomoran bulanan diwakili oleh 4 digit dengan pad zero (misal `0001` hingga `9999`).
