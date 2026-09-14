# Feature Specification: Frontend Integration for Master Data Paket Sarpras API

**Feature Branch**: `072-master-paket-sarpras-integration`

**Created**: 2026-09-03

**Status**: Draft

**Input**: User description: "buatkan frontend untuk master data paket sarpras api ada di backend yang dibuat tadi"

## Clarifications

### Session 2026-09-03

- Q: Bagaimana penanganan frontend jika koneksi ke API master data mengalami timeout atau offline? → A: Gunakan strategi Cache + Static Fallback (cache di Pinia / static config default sebagai cadangan), memastikan UX tetap mulus dan form tidak terblokir saat terjadi gangguan jaringan.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dinamically Fetch & Render Paket Sarpras Cards and Categories (Priority: P1)

Sebagai Pemohon yang akan membuat pengajuan proposal Sarpras baru, saya ingin halaman pemilihan paket sarpras (Step 1) dan komponen dropdown kategori memuat data kategori, nama paket, ikon, label, deskripsi, dan status pupuk/non-pupuk secara dinamis dari API backend, sehingga pilihan paket selalu sinkron dengan database pusat.

**Why this priority**: Menghilangkan dependensi hardcode statis dan memastikan data paket yang ditampilkan ke pemohon selalu akurat sesuai master data backend.

**Independent Test**:
Dapat diuji dengan membuka formulir Pengajuan Baru (Step 1) dan komponen `CascadingPaketSelect.vue`, lalu memastikan kartu paket dan kelompok dropdown ter-render sesuai respons API `GET /api/v1/master/kategori-sarpras` dan `GET /api/v1/master/paket-sarpras`.

**Acceptance Scenarios**:
1. **Given** pengguna membuka halaman Step 1 Pengusulan Baru, **When** data master dimuat, **Then** seluruh 9 kategori dan 13 paket sarpras aktif muncul dalam grid kartu dan dropdown dengan ikon, label, dan deskripsi dari backend.
2. **Given** paket sarpras bertipe pupuk (`is_pupuk: true` seperti `EKSTENSIFIKASI` dan `INTENSIFIKASI`), **When** dipilih oleh pengguna, **Then** form mendeteksi flag `is_pupuk` secara dinamis dari master data dan mengaktifkan step/form terkait saprodi pupuk.

---

### User Story 2 - Dinamically Render Document Checklists per Package (Priority: P1)

Sebagai Pemohon dan Verifikator Dinas, saya ingin daftar dokumen persyaratan yang wajib diunggah pada Step Dokumen Proposal dan tampilan verifikasi berkas diambil secara dinamis dari API `GET /api/v1/master/paket-sarpras/:code/persyaratan`, lengkap dengan template unduhan (`format_download_url`) dan tipe mime berkas yang diizinkan.

**Why this priority**: Menjamin kelengkapan berkas yang diminta kepada pemohon dan diperiksa oleh verifikator selalu sesuai regulasi yang dikonfigurasi di backend.

**Independent Test**:
Dapat diuji dengan mengganti pilihan paket (misal dari `EKSTENSIFIKASI` ke `UPH_MULTI_JENIS` atau `JALAN_KEBUN`), lalu memverifikasi bahwa daftar item berkas yang wajib diunggah berubah secara instan sesuai data checklist backend.

**Acceptance Scenarios**:
1. **Given** pemohon memilih `UPH_MULTI_JENIS`, **When** beralih ke form dokumen proposal, **Then** muncul 18 item dokumen persyaratan (dokumen common + 10 dokumen khusus UPH) lengkap dengan tombol unduh template untuk dokumen yang menyediakannya.
2. **Given** pemohon memilih `JALAN_KEBUN`, **When** form dokumen dibuka, **Then** muncul dokumen konstruksi sipil (Dokumen SID, Foto Jalan, Kurva S, AHSP, RAB Detail).

---

### User Story 3 - Dynamic Validation of Farmer Quota & Land Area (Priority: P1)

Sebagai Pemohon pada Step 3 (Pekebun & Lahan), saya ingin sistem memvalidasi jumlah pekebun dan total luas lahan (Ha) secara reaktif terhadap aturan `syarat_minimum` yang didapat dari master data paket terkait (contoh: min 20 pekebun ATAU 3 Ha), dan menampilkan pesan kekurangan yang akurat jika belum terpenuhi.

**Why this priority**: Mencegah pengajuan proposal yang tidak memenuhi batas minimum aturan sarpras kelapa.

**Independent Test**:
Dapat diuji dengan memilih pekebun/lahan pada Step 3 untuk berbagai paket, dan memastikan banner validasi menghitung defisit pekebun dan luas lahan berdasarkan parameter dari API master.

**Acceptance Scenarios**:
1. **Given** pemohon memilih paket `PIKAP` (syarat minimum API: 25 pekebun atau 10 Ha), **When** pemohon baru memilih 15 pekebun dengan total luas 6 Ha, **Then** status validasi menampilkan belum memenuhi syarat dan menyebutkan kekurangan 10 pekebun dan 4 Ha.
2. **Given** pemohon memilih paket `VERIFIKASI_TEKNIS` (syarat minimum API: null), **When** pemohon memilih 1 pekebun dengan 0.5 Ha, **Then** status validasi langsung hijau / memenuhi syarat.

---

### Edge Cases

- **Koneksi Backend Gagal / Offline**: Pinia store master data harus menyediakan fallback ke cache lokal atau static defaults agar antarmuka tidak blank jika terjadi kendala jaringan sementara.
- **Transisi Pemilihan Paket Cepat**: Jika pengguna berganti paket berkali-kali pada Step 1, query persyaratan harus reaktif dan tidak menyebabkan race condition.
- **Backward Compatibility Wording**: Kode enum lama (e.g. `UPH_KAKAO`, `BENIH_PUPUK`) tetap memiliki fallback rendering yang aman pada halaman riwayat/tracking proposal lama.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Frontend MUST menyediakan service client API `masterSarprasService` di `src/services/masterSarpras.service.ts` yang terhubung ke endpoint `/api/v1/master/*`.
- **FR-002**: Frontend MUST menyediakan Pinia store `useMasterSarprasStore` di `src/stores/masterSarpras.ts` yang menangani fetch, caching, dan state management untuk kategori, paket, persyaratan dokumen, dan syarat lahan.
- **FR-003**: Frontend MUST mengintegrasikan store master sarpras ke dalam `src/views/pengusulan/StepPaketSarpras.vue` dan `src/components/ui/CascadingPaketSelect.vue` sehingga opsi paket sarpras di-render secara dinamis dari API.
- **FR-004**: Frontend MUST mengintegrasikan checklist dokumen persyaratan dinamis ke dalam proses penyusunan proposal (`src/stores/pengusulanDraft.ts`) dan tampilan verifikasi (`StepVerifikasiPekebunDanDokumenProposal.vue`, `StepSummaryDanSubmit.vue`).
- **FR-005**: Frontend MUST memvalidasi batas minimum pekebun dan luas lahan pada Step 3 menggunakan nilai `minimal_pekebun`, `minimal_luas_ha`, dan `kondisi_validasi` yang diperoleh dari data master paket.
- **FR-006**: Frontend MUST memperbarui types TypeScript di `src/types/masterSarpras.ts` atau `src/types/pengusulan.ts` agar selaras dengan kontrak API backend.

### Key Entities *(include if feature involves data)*

- **MasterKategori**: Objek kategori sarpras (`code`, `name`, `icon`, `description`).
- **MasterPaket**: Objek paket sarpras lengkap (`code`, `name`, `label`, `is_pupuk`, `syarat_minimum`).
- **DokumenPersyaratanItem**: Objek persyaratan dokumen (`dokumen_code`, `nama`, `format_download_url`, `is_wajib`, `max_size_bytes`).
- **SyaratLahan**: Ketentuan jenis hak lahan dan aturan surat keterangan kades.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% opsi kartu paket dan dropdown sarpras di frontend bersumber secara dinamis dari API master data backend.
- **SC-002**: Perubahan batas minimum pekebun/luas atau penambahan dokumen baru di backend langsung teraplikasi di frontend tanpa memerlukan rebuild/deploy kode frontend.
- **SC-003**: Seluruh alur pengusulan (Step 1 s/d Step 4) dan verifikasi dinas tetap berfungsi normal tanpa regresi.
