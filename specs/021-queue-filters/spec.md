# Feature Specification: Verification Queue Filters (Multi-Role)

**Feature Branch**: `021-queue-filters`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "tambahkan filter untuk queue semua verifikasi (kab/kota, provinsi, ditjenbun verifikator, ditjenbun approval, bpdp verifikator, bpdp approval)"

---

## Clarifications

### Session 2026-08-06

- Q: Opsi dropdown filter Status di antrean verifikasi apakah dinamis/terbatas per level verifikasi atau menampilkan seluruh status global? → A: Menampilkan opsi status global secara lengkap, berlaku untuk seluruh akun verifikator (non-PEMOHON).
- Q: Opsi dropdown filter Jenis Sarpras apakah dinamis berdasarkan data aktif atau global? → A: Menampilkan ke-17 kategori Jenis Sarpras secara lengkap (global) di semua halaman antrean.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cari Proposal Berdasarkan Keyword (Priority: P1)

Pengguna (Verifikator / Approver) dapat menyaring daftar proposal dalam antrean dengan memasukkan kata kunci berupa nomor proposal atau nama kelompok tani/koperasi pengusul pada kolom pencarian.

**Why this priority**: Kolom pencarian kata kunci adalah alat navigasi utama ketika verifikator mencari satu proposal spesifik di antara puluhan berkas antrean.

**Independent Test**: Dapat diuji dengan membuka salah satu halaman antrean verifikasi (misalnya Dinas Kabupaten/Kota), mengetik nomor proposal tertentu pada input pencarian, dan memverifikasi list terfilter hanya menyisakan proposal yang cocok.

**Acceptance Scenarios**:

1. **Given** antrean verifikasi Dinas Kabupaten/Kota memuat beberapa proposal, **When** pengguna memasukkan kata kunci nomor proposal (misal: "PRP-001"), **Then** daftar proposal disaring secara instan hanya menampilkan proposal berkode "PRP-001".
2. **Given** pengguna memasukkan kata kunci nama kelompok tani (misal: "Maju Bersama"), **When** input pencarian selesai diketik, **Then** daftar proposal menyaring secara case-insensitive proposal dari kelompok tani tersebut.
3. **Given** tidak ada proposal yang cocok dengan kata kunci, **When** penyaringan berjalan, **Then** sistem menampilkan baris kosong dengan pesan pemberitahuan "Proposal tidak ditemukan" atau "Data antrean kosong".

---

### User Story 2 - Saring Proposal Berdasarkan Status & Jenis Sarpras (Priority: P2)

Pengguna dapat membatasi proposal yang tampil di antrean verifikasi berdasarkan kategori bantuan sarana prasarana (Jenis Sarpras) atau status pemeriksaan yang sedang berjalan.

**Why this priority**: Memudahkan verifikasi berkas secara berkelompok berdasarkan jenis usulannya untuk efisiensi fokus kerja verifikator.

**Independent Test**: Dapat diuji dengan memilih salah satu Jenis Sarpras dari dropdown filter dan memastikan tabel data hanya memuat proposal dengan jenis sarpras tersebut.

**Acceptance Scenarios**:

1. **Given** antrean verifikasi Ditjenbun memuat usulan berjenis "Alsintan" dan "Benih dan Pupuk", **When** pengguna memilih filter Jenis Sarpras "Alat dan Mesin Pertanian (Alsintan)", **Then** daftar menyaring dan hanya menampilkan proposal Alsintan.
2. **Given** filter Status dipilih menjadi "Menunggu Approval Ketua", **When** antrean Ditjenbun dimuat, **Then** hanya proposal berstatus `APPROVAL_DITJENBUN` yang tampil.
3. **Given** pengguna memilih filter Status dan Jenis Sarpras bersamaan, **When** filter diterapkan, **Then** proposal disaring menggunakan logika "DAN" (memenuhi kedua kriteria).

---

### User Story 3 - Tombol Bersihkan Filter Instan (Priority: P3)

Pengguna dapat menghapus seluruh filter pencarian, status, dan jenis sarpras yang sedang aktif dengan satu klik tombol untuk mengembalikan tampilan antrean penuh.

**Why this priority**: Mempercepat alur kerja pengguna ketika ingin berpindah dari satu pencarian ke pencarian global tanpa perlu menghapus input teks satu per satu.

**Independent Test**: Diuji dengan mengaktifkan beberapa filter, mengklik tombol "Reset Filter", dan memverifikasi seluruh filter kembali kosong serta daftar menampilkan semua data secara utuh.

**Acceptance Scenarios**:

1. **Given** filter pencarian terisi kata kunci dan dropdown jenis sarpras terpilih, **When** pengguna mengklik tombol "Reset Filter", **Then** kolom input kosong kembali dan filter dropdown mereset ke pilihan default "Semua".

---

### Edge Cases

- **Pencarian dengan karakter khusus**: Pencarian tetap aman dan tidak memicu error client-side jika memasukkan karakter non-alfanumerik.
- **Transisi Role Dinamis**: Saat pengguna berpindah role menggunakan `RoleSwitcher`, filter yang diisi sebelumnya otomatis di-reset ke nilai default untuk menghindari filter salah konteks.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Halaman antrean verifikasi berikut HARUS memiliki panel filter:
  - Dinas Kabupaten/Kota (`QueueVerifikasiKabView.vue`)
  - Dinas Provinsi (`QueueVerifikasiProvinsiView.vue`)
  - Ditjenbun Verifikator & Approval (`AntreanRekomtekView.vue`)
  - BPDP Verifikator & Approval (`AntreanBpdpView.vue`)
- **FR-002**: Panel filter HARUS memuat 3 control utama:
  1. Input Teks: Pencarian (Nomor Proposal / Nama Lembaga).
  2. Select Dropdown: Status Pengajuan (menampilkan opsi status global secara lengkap di seluruh halaman verifikasi).
  3. Select Dropdown: Jenis Sarpras (Benih dan Pupuk, Alsintan, dsb).
- **FR-003**: Panel filter HARUS memiliki tombol "Reset Filter" atau "Clear" yang hanya muncul ketika minimal ada satu filter yang aktif.
- **FR-004**: Semua label, opsi pilihan status, opsi pilihan jenis sarpras, dan teks UI filter HARUS dieksternalisasi ke `src/config/localization.ts` (Konstitusi XV).
- **FR-005**: Pada layar desktop (>= 1024px), panel filter HARUS disusun sejajar secara horizontal di atas tabel untuk efisiensi ruang.
- **FR-006**: Pada layar mobile (< 1024px), panel filter HARUS tersusun secara vertikal atau dikemas dalam popover collapsible agar tidak merusak layout (Konstitusi VII).
- **FR-007**: Semua input dan control filter HARUS menggunakan styling focus-ring, transition hover, dan visual contrast yang memenuhi WCAG AA (Konstitusi X).
- **FR-008**: Logika pemfilteran HARUS dijalankan secara reaktif di sisi klien (client-side computed filter) karena data queue saat ini bersumber dari mock store lokal.

### Key Entities

- **FilterState**: Objek state reaktif penyaring. Atribut: `search` (string), `status` (string/null), `jenisSarpras` (string/null).
- **LocalizedFilterOptions**: Opsi dropdown filter yang bersumber dari localization config.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pengguna dapat menyaring antrean berdasarkan status atau sarpras dan mendapatkan hasil filter instan (<100ms) melalui client-side reactivity.
- **SC-002**: Tombol reset filter mengosongkan semua field input dalam satu kali klik.
- **SC-003**: Tidak ada teks filter yang hardcode di dalam template Vue; seluruh label menggunakan helper `$t` atau objek config `LOCALIZATION`.
- **SC-004**: Tampilan filter di layar mobile (375px) tidak memicu scroll horizontal dan memiliki target ketukan minimal 44x44px.

---

## Assumptions

- Filter antrean ini murni berbasis client-side filter atas state reaktif di Pinia store (`usePengusulanStore` dan `useRekomtekStore`), bukan filtering berbasis query parameters ke server API karena data backend belum diintegrasikan di level antrean.
- Jenis status yang dapat difilter disesuaikan dengan daftar status di setiap level (Dinas Kab memiliki opsi status kabupaten, Ditjenbun opsi rekomtek, dsb).
