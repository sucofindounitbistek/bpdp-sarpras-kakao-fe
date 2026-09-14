# Feature Specification: Integrasi Penyaluran Barang dari Proposal Selesai & Penghapusan Tombol Buat Permohonan Baru

**Feature Branch**: `feat/penyaluran-barang`

**Created**: 2026-08-28

**Status**: Ready for Planning

**Input**: User description: "Penyaluran Barang Pekebun Tombol 'Buat Permohonan Baru' dihapus karena seharusnya data listnya itu dari hasil proposal yang sudah selesai baru dia melanjutkan hasil dari itu dilanjutkan untuk proses penyaluran barang"

## Clarifications

### Session 2026-08-28

- Q: Status spesifik proposal apa yang menjadi pemicu (trigger) agar proposal otomatis muncul di daftar Penyaluran Barang? → A: Hanya proposal dengan status final `SELESAI`, dengan implementasi data terintegrasi berbasis Pinia store (persisted state / local storage).
- Q: Bagaimana status awal dan alur mulai penyaluran barang tersebut pada sisi Pekebun? → A: Proposal yang selesai akan masuk ke antrean Penyaluran Barang dengan status `DRAFT` (Siap Diajukan Salur). Pekebun kemudian meninjau rinciannya dan menekan tombol aksi "Ajukan Penyaluran" untuk memajukan status ke `MENUNGGU_VERIFIKASI_TEKNIS`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Penghapusan Tombol 'Buat Permohonan Baru' pada Antarmuka Pekebun (Priority: P1)

Sebagai Pekebun / Pengurus Lembaga Pekebun, saya ingin halaman daftar Penyaluran Barang menampilkan alur yang bersih tanpa tombol "Buat Permohonan Baru" mandiri, karena proses penyaluran barang bukan merupakan pengajuan terpisah melainkan kelanjutan langsung dari proposal sarpras yang telah disetujui/selesai.

**Why this priority**: Menghilangkan kebingungan pengguna, mencegah duplikasi input data, dan menyelaraskan logika bisnis bahwa penyaluran barang tidak dapat diajukan tanpa adanya proposal yang sah dan telah disetujui.

**Independent Test**: Buka halaman Penyaluran Barang Pekebun (`/penyaluran-barang/pemohon`). Verifikasi bahwa tombol "Buat Permohonan Baru" tidak lagi ditampilkan di header halaman maupun di area kosong (empty state).

**Acceptance Scenarios**:

1. **Given** Pengguna login sebagai Pekebun dan berada pada halaman Penyaluran Barang (`/penyaluran-barang/pemohon`), **When** Halaman dimuat, **Then** Header halaman hanya menampilkan breadcrumb, judul, deskripsi, dan filter pencarian tanpa tombol aksi "Buat Permohonan Baru".
2. **Given** Belum ada proposal berstatus selesai yang memenuhi syarat penyaluran, **When** Tabel penyaluran kosong, **Then** Tampilan empty state menjelaskan bahwa data penyaluran akan muncul secara otomatis ketika proposal pengusulan telah selesai diverifikasi/disetujui.

---

### User Story 2 - Menampilkan Daftar Penyaluran Otomatis dari Proposal Selesai (Priority: P1)

Sebagai Pekebun, saya ingin data penyaluran barang pada tabel bersumber langsung dari proposal-proposal pengajuan sarpras saya yang telah berstatus `SELESAI` (atau telah terbit persetujuan/SK), sehingga saya dapat langsung memantau dan melanjutkan proses penyaluran komoditas bantuan.

**Why this priority**: Menjamin kesinambungan data (single source of truth) antara modul Pengusulan Proposal dan modul Penyaluran Barang.

**Independent Test**: Siapkan proposal dengan status `SELESAI`. Buka halaman Penyaluran Barang Pekebun, verifikasi bahwa proposal tersebut otomatis muncul dalam daftar penyaluran dengan status awal `DRAFT` beserta data kelembagaan, kategori paket, dan rincian RAB yang sesuai.

**Acceptance Scenarios**:

1. **Given** Pengguna memiliki proposal pengusulan yang telah berstatus `SELESAI`, **When** Membuka halaman Penyaluran Barang, **Then** Sistem menampilkan daftar penyaluran yang diturunkan dari proposal selesai tersebut dengan status awal `DRAFT` (Siap Diajukan Salur).
2. **Given** Proposal masih berstatus dalam proses verifikasi dinas/provinsi/BPDP (belum `SELESAI`), **When** Membuka halaman Penyaluran Barang, **Then** Proposal tersebut tidak dimasukkan ke dalam daftar siap salur.

---

### User Story 3 - Inisiasi Aksi 'Ajukan Penyaluran' & Pemantauan Rincian (Priority: P2)

Sebagai Pekebun, saya ingin dapat meninjau proposal selesai yang ada di daftar Penyaluran Barang dan menekan tombol aksi "Ajukan Penyaluran" untuk meneruskan permohonan ke Tim Teknis BPDP (`MENUNGGU_VERIFIKASI_TEKNIS`), serta memantau progres distribusi logistik/tender/kontrak.

**Why this priority**: Memberikan kendali kepada pekebun untuk mengonfirmasi kesiapan penerimaan barang bantuan dan transparansi tahapan penyaluran.

**Independent Test**: Pada baris penyaluran yang berstatus `DRAFT`, klik tombol "Ajukan Penyaluran". Verifikasi status item berubah menjadi `MENUNGGU_VERIFIKASI_TEKNIS` dan notifikasi berhasil ditampilkan.

**Acceptance Scenarios**:

1. **Given** Item penyaluran berstatus `DRAFT`, **When** Pekebun menekan tombol "Ajukan Penyaluran", **Then** Status penyaluran beralih menjadi `MENUNGGU_VERIFIKASI_TEKNIS` dan masuk ke antrean verifikator teknis BPDP.
2. **Given** Item penyaluran telah diajukan, **When** Pekebun mengklik tombol "Detail", **Then** Modal detail terbuka menampilkan timeline status progres, rincian tabel RAB bertahap, dan dokumen penugasan/kontrak jika tersedia.
3. **Given** Item penyaluran berstatus "Perlu Revisi", **When** Detail dibuka, **Then** Terdapat kotak informasi catatan perbaikan dari Tim Teknis.

---

### Edge Cases

- **Bagaimana jika lembaga pekebun belum memiliki proposal yang selesai?**
  Tabel menampilkan pesan informatif bahwa belum ada proposal yang selesai dan mengarahkan pengguna ke menu Pengajuan Proposal jika ingin memeriksa progres verifikasi.
- **Bagaimana jika pengguna mengakses URL formulir penambahan manual langsung (`/penyaluran-barang/pemohon/tambah`)?**
  Sistem melakukan redirect otomatis kembali ke halaman daftar `/penyaluran-barang/pemohon` dengan notifikasi informasi bahwa penyaluran barang dibuat otomatis dari proposal selesai.
- **Bagaimana jika proposal memiliki format RAB lama atau data volume tanpa pembagian tahap?**
  Sistem secara aman menampilkan volume total dan menangani data nilai null/undefined tanpa menimbulkan error antarmuka.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem **HARUS** menghapus tombol "Buat Permohonan Baru" dari halaman Penyaluran Barang Pekebun (`PekebunPermohonanBarangView.vue`).
- **FR-002**: Sistem **HARUS** menurunkan data antrean/daftar penyaluran barang langsung dari data proposal yang telah berstatus selesai (`SELESAI`).
- **FR-003**: Sistem **HARUS** menetapkan status awal item penyaluran yang baru diturunkan dari proposal selesai sebagai `DRAFT` (Siap Diajukan Salur).
- **FR-004**: Sistem **HARUS** menyediakan tombol aksi "Ajukan Penyaluran" untuk item yang berstatus `DRAFT`, yang ketika dikonfirmasi akan memperbarui status menjadi `MENUNGGU_VERIFIKASI_TEKNIS`.
- **FR-005**: Sistem **HARUS** mewarisi seluruh atribut relevan dari proposal yang selesai, mencakup identitas kelembagaan (nama kelompok/koperasi, ketua, kontak, wilayah), kategori paket sarpras kelapa (Ekstensifikasi/Intensifikasi), serta rincian item RAB.
- **FR-006**: Sistem **HARUS** mengalihkan navigasi rute form tambah manual `/penyaluran-barang/pemohon/tambah` kembali ke halaman utama daftar penyaluran `/penyaluran-barang/pemohon`.
- **FR-007**: Tampilan empty state pada tabel penyaluran **HARUS** menyediakan pesan panduan bahwa data penyaluran berasal dari proposal sarpras yang telah selesai.
- **FR-008**: Seluruh data antrean penyaluran barang **HARUS** disimpan dan dipersistensi secara reaktif di Pinia store / local storage.

### Key Entities

- **Proposal Sarpras (`Proposal`)**: Entitas pengusulan awal sarpras kelapa oleh lembaga pekebun yang memuat data legalitas, CPCL lahan pekebun, dokumen pendukung, dan Rencana Anggaran Biaya (RAB).
- **Penyaluran Barang (`PermohonanPenyaluranBarang`)**: Entitas proses pelaksanaan penyaluran komoditas fisik pasca-persetujuan proposal, diawali dengan status `DRAFT` lalu berlanjut ke verifikasi kesiapan teknis (`MENUNGGU_VERIFIKASI_TEKNIS`), pemilihan penyedia/vendor tender ULP, kontrak pelaksanaan, dan monitoring surveyor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% pengguna Pekebun tidak lagi melihat tombol buat permohonan baru pada antarmuka daftar penyaluran barang.
- **SC-002**: 100% data item pada daftar penyaluran barang bersumber dari proposal yang telah menyelesaikan tahapan verifikasi proposal (`SELESAI`).
- **SC-003**: Pekebun dapat melakukan aksi "Ajukan Penyaluran" dari status `DRAFT` dengan 1 kali klik dan konfirmasi.
- **SC-004**: Waktu akses dan navigasi pekebun ke detail penyaluran barang selesai diakses dalam waktu kurang dari 1 detik.
- **SC-005**: Eliminasi 100% duplikasi pengisian formulir data lembaga dan RAB pada modul penyaluran barang.

## Assumptions

- Proposal yang siap disalurkan adalah proposal yang telah melewati seluruh tahapan verifikasi (Kabupaten, Provinsi, Ditjenbun/BPDP) dan memiliki status final `SELESAI`.
- Data penyaluran barang disimpan secara persisten di Pinia store (`penyaluranBarang.ts`) dengan mock integrasi terhadap proposal yang selesai.
- Hak akses untuk melihat daftar penyaluran tetap sesuai dengan lembaga pekebun yang sedang login.
