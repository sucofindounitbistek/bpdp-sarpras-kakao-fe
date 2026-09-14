# Research: Revisi Data dan Dokumen Pekebun pada Proposal Usulan

**Feature**: `069-revisi-data-dokumen-pekebun`
**Date**: 2026-09-03

## 1. Technical Context & Gap Analysis

### Current Architecture in `bpdp-sarpras-kelapa-be`:
- Model `FarmerProfile` (table `pekebuns`) stores master farmer data (NIK, Name, NomorKK, Address, etc.).
- Model `FarmerDocument` (table `dokumen_pekebuns`) stores documents per farmer (SCAN_KTP, SCAN_KK, SWAFOTO, SURAT_KUASA).
- Model `LandPlot` (table `lahans`) stores land parcels per farmer (LuasLahan, JenisLegalitas, NomorLegalitas, Coordinates, NomorSuratBedaNama).
- Model `LandDocument` (table `dokumen_lahans`) stores documents per land parcel (SCAN_LEGALITAS, SURAT_KETERANGAN_KEPALA_DESA).
- Verification tables:
  - `validasi_dokumen_pekebuns` & `detail_validasi_dokumen_pekebuns` (stores field-level validity for KTP/KK/etc.).
  - `validasi_dokumen_lahans` & `detail_validasi_dokumen_lahans` (stores field-level validity for Legalitas/Beda Nama).
- **Backend Gap**:
  - `GetRevisionDetail` in `internal/proposal/service.go` currently only includes `PROPOSAL_DOC`, `RAB`, and `GUDANG`. Farmer and Land document rejections are NOT yet gathered into `categorized_rejections`.
  - `ResubmitProposalRevision` in `internal/proposal/service.go` only updates `dokumen_proposals` and `storage_areas`. It does NOT yet update `pekebuns`, `dokumen_pekebuns`, `lahans`, or `dokumen_lahans`.

### Current Architecture in `bpdp-sarpras-kelapa-fe`:
- View `RevisiProposalView.vue` Tab `PEKEBUN` currently renders static placeholder cards ("Dokumen Pekebun Sesuai" / "Tidak ada data pekebun khusus yang perlu diperbaiki").
- Store `proposalRevisionStore.ts` tracks `categorizedRejections` and counts unresolved items.
- **Frontend Gap**:
  - Need to parse and group farmer rejections by pekebun ID.
  - Need to render inline accordion cards displaying only the rejected fields and documents.
  - Need reactive state for farmer text edits and uploaded file IDs.
  - Need payload integration in `resubmitRevision`.

---

## 2. Key Decisions

### Decision 1: Filter Pekebun yang Ditolak (Strict Filtering)
- **Decision**: Hanya pekebun yang memiliki minimal 1 penolakan dokumen atau field (`is_valid = false`) yang dikembalikan dalam kelompok `PEKEBUN` di `categorized_rejections` dan ditampilkan di Tab Pekebun.
- **Rationale**: Dari 10-50 pekebun CPCL dalam satu usulan, umumnya hanya 1-3 orang yang ditolak. Menampilkan semua pekebun akan membingungkan pemohon.
- **Alternatives Considered**: Menampilkan semua pekebun dengan accordion tertutup. Ditolak karena menyulitkan scannability pemohon.

### Decision 2: Granularitas Tampilan (Ketat Sesuai Validasi)
- **Decision**: Field teks (Nama, NIK, No KK, Luas Lahan, dll) hanya dimunculkan jika field tersebut secara eksplisit memiliki detail validasi `is_valid = false`. Dokumen scan (KTP, KK, Legalitas) hanya memunculkan tombol upload jika dokumen/file tersebut memiliki validasi `is_valid = false`.
- **Rationale**: Memenuhi instruksi user: *"hanya merevisi yang ditolak saja yang ditampilkan"*. Menghindari perubahan data yang sudah diverifikasi dan disetujui.

### Decision 3: Sinkronisasi Master Data (Single Source of Truth)
- **Decision**: Saat `ResubmitProposalRevision` dijalankan:
  1. Update data teks langsung ke tabel `pekebuns` (`name`, `nik`, `nomor_kk`, `address`, dll).
  2. Update data teks langsung ke tabel `lahans` (`luas_lahan`, `nomor_legalitas`, `jenis_legalitas`, `nomor_surat_beda_nama`, dll).
  3. Update `file_id` pada tabel `dokumen_pekebuns` dan `dokumen_lahans`.
  4. Perbarui data snapshot pada proposal (bila ada).
  5. Ubah status proposal ke `SUBMITTED`.
- **Rationale**: Memenuhi instruksi user: *"data ini juga akan merubah data pekebun yang dari table pekebun"*. Menjaga integritas data tanpa perlu sinkronisasi manual terpisah.

### Decision 4: UI/UX Inline Card Accordion
- **Decision**: Menggunakan kartu expand/collapse per pekebun yang ditolak langsung di dalam Tab Pekebun pada `RevisiProposalView.vue`.
- **Rationale**: Selaras dengan Konstitusi Proyek Prinsip XVI (*Strict Prohibition of Nested Modals*). Sangat responsif dan mudah digunakan di mobile maupun desktop.
