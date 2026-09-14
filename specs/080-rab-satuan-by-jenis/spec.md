# Feature Specification: Penyesuaian Satuan RAB Berdasarkan Jenis Barang (RAB Satuan by Jenis)

**Feature Branch**: `080-rab-satuan-by-jenis`

**Created**: 2026-09-13

**Status**: Draft

**Input**: User description: "Untuk benih langsung otomatis satuannya apa. ini tetep ada dropdwon tapi lebih ngerucut aja. Benih: 1. Batang. Pupuk: 1. Kg, 2. Liter. Pestisida: 1. Kg, 2. Liter, 3. Buah, 4. Sachet, 5. Unit. Please try to find where the RAB are and the selection here. Tell me what you understand"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pemilihan Otomatis Satuan untuk Benih (Priority: P1)

Sebagai Pemohon atau Verifikator yang sedang mengisi atau menyesuaikan rincian baris RAB, ketika saya memilih Jenis "Benih", sistem harus secara otomatis mengisi Satuan menjadi "Batang" dan mempersempit pilihan dropdown Satuan hanya pada "Batang", sehingga mempercepat proses pengisian dan menghindari kesalahan input satuan bibit/benih.

**Why this priority**: Menghilangkan friksi entri data dan mencegah ketidaksesuaian standar satuan pengadaan benih kelapa pada proposal.

**Independent Test**: Tambah baris baru di tabel RAB, pilih Jenis "Benih", amati bahwa kolom Satuan langsung otomatis bernilai "Batang", dan dropdown Satuan hanya menampilkan opsi "Batang".

**Acceptance Scenarios**:

1. **Given** pengguna berada di tabel pengisian RAB dan menambah baris baru, **When** pengguna memilih Jenis "Benih", **Then** kolom Satuan otomatis terisi "Batang" tanpa perlu memilih manual.
2. **Given** baris RAB berjenis "Benih", **When** pengguna membuka dropdown Satuan, **Then** dropdown hanya menampilkan opsi "Batang".

---

### User Story 2 - Dropdown Satuan Terfilter untuk Pupuk dan Pestisida (Priority: P2)

Sebagai Pemohon atau Verifikator, ketika saya memilih Jenis "Pupuk" atau "Pestisida", sistem harus mempersempit (ngerucutkan) pilihan dropdown Satuan sesuai kategori teknis barang yang bersangkutan, serta mereset atau menyesuaikan satuan lama jika tidak kompatibel dengan jenis baru.

**Why this priority**: Memastikan validitas satuan takaran pengadaan bahan kimia dan pupuk sesuai spesifikasi teknis lapangan perkebunan.

**Independent Test**: Ubah baris berjenis "Pupuk", buka dropdown Satuan, pastikan hanya "Kg" dan "Liter" yang muncul. Ubah ke "Pestisida", pastikan hanya "Kg", "Liter", "Buah", "Sachet", dan "Unit" yang muncul.

**Acceptance Scenarios**:

1. **Given** baris RAB memiliki Jenis "Pupuk", **When** pengguna membuka dropdown Satuan, **Then** opsi yang tersedia hanya "Kg" dan "Liter".
2. **Given** baris RAB memiliki Jenis "Pestisida", **When** pengguna membuka dropdown Satuan, **Then** opsi yang tersedia hanya "Kg", "Liter", "Buah", "Sachet", dan "Unit".
3. **Given** baris RAB sebelumnya bernilai Jenis "Benih" dengan satuan "Batang", **When** pengguna mengganti Jenis menjadi "Pupuk", **Then** nilai satuan lama ("Batang") direset/dikosongkan karena tidak valid untuk jenis Pupuk.

---

### User Story 3 - Penyesuaian Konsisten di Seluruh Tabel RAB (Priority: P3)

Sebagai pengguna sistem pengusulan sarpras maupun permohonan penyaluran barang, saya mengharapkan aturan pemfilteran satuan berdasarkan jenis ini berlaku konsisten baik di formulir pengusulan RAB (RabTable) maupun di tabel preferensi penyaluran barang (ItemRabFormTable).

**Why this priority**: Menjaga konsistensi data arsitektur workspace dan pengalaman pengguna (UX) lintas modul.

**Independent Test**: Periksa pengisian tabel RAB pada modul pengusulan dan modul penyaluran barang; pastikan keduanya tunduk pada daftar satuan per jenis yang sama.

**Acceptance Scenarios**:

1. **Given** pengguna membuka form penyaluran barang di `ItemRabFormTable`, **When** memilih jenis barang, **Then** dropdown satuan menyajikan opsi yang terfilter sama dengan tabel RAB pengusulan.

---

### Edge Cases

- **Perubahan Jenis Berulang Kali**: Jika pengguna bolak-balik mengubah jenis (misal Benih -> Pupuk -> Benih), satuan harus kembali otomatis ke "Batang" saat memilih Benih, dan opsi dropdown selalu sinkron secara reaktif.
- **Baris Baru Tanpa Jenis**: Jika jenis belum dipilih (kosong/placeholder), dropdown satuan dapat dinonaktifkan atau menampilkan fallback opsi umum hingga jenis ditentukan.
- **Data Historis / Mode Readonly**: Baris RAB yang dimuat dari database lama dengan satuan apa pun tetap harus ditampilkan secara utuh dalam mode pratinjau/readonly tanpa menyebabkan crash.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan pemetaan terpusat daftar satuan yang diperbolehkan untuk setiap jenis barang di konfigurasi dropdown RAB (`localization.ts`):
  - **Benih**: `Batang`
  - **Pupuk**: `Kg`, `Liter`
  - **Pestisida**: `Kg`, `Liter`, `Buah`, `Sachet`, `Unit`
- **FR-002**: Sistem MUST secara otomatis mengisi nilai `satuan` dan `unit` menjadi "Batang" segera setelah pengguna memilih Jenis "Benih" pada baris RAB.
- **FR-003**: Sistem MUST memfilter (ngerucutkan) opsi dropdown Satuan pada baris tabel RAB agar hanya menampilkan satuan yang valid untuk Jenis barang yang aktif pada baris tersebut.
- **FR-004**: Sistem MUST mengosongkan atau mereset nilai satuan jika pengguna mengubah Jenis barang dan satuan yang sebelumnya terpilih tidak valid untuk Jenis yang baru.
- **FR-005**: Nilai satuan yang dipilih/otomatis terisi MUST tersimpan ke dalam objek data baris RAB (`item.satuan` dan `item.unit`) dan dipancarkan (`emit`) ke store/komponen induk.

### Key Entities

- **RabItem**: Entitas baris RAB yang memiliki atribut `jenis`, `uraian`, `satuan`, `unit`, `hargaSatuan`, `jumlahTahap`, dan `subTotal`.
- **SatuanByJenisMapping**: Konfigurasi pemetaan daftar satuan terfilter berdasarkan kategori `jenis` barang (`Benih`, `Pupuk`, `Pestisida`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% baris baru yang dipilih dengan Jenis "Benih" langsung memiliki satuan "Batang" secara otomatis tanpa perlu klik tambahan pada dropdown Satuan.
- **SC-002**: Dropdown Satuan pada baris dengan jenis yang sudah dipilih hanya menampilkan opsi yang sesuai (Benih: 1 opsi; Pupuk: 2 opsi; Pestisida: 5 opsi), mereduksi opsi yang tidak relevan hingga 80%.
- **SC-003**: 0% inkonsistensi data satuan (seperti benih dengan satuan "Liter" atau pupuk dengan satuan "Batang") yang dapat dipilih melalui antarmuka pengguna.
- **SC-004**: Seluruh automated test suite di frontend tetap lulus 100% tanpa regresi.

## Assumptions

- Kategori Jenis pada RAB sarpras kelapa saat ini terdiri dari 3 kategori utama: "Benih", "Pupuk", dan "Pestisida".
- Jika Jenis belum dipilih, dropdown satuan menampilkan panduan untuk memilih jenis terlebih dahulu atau menampilkan daftar standar sebagai fallback.
