# Feature Specification: sarpras-package-rules

**Feature Branch**: `027-sarpras-package-rules`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "/speckit-specify tolong sesuaikan untuk perubahan di pilihan paket dari awal proses dari pekebun sampai akhir ke bpdp tolong disesuaikan ya bisa di cek kebutuhan berkas dan persayaratannya ada di ceklis_dokumen_persyaratan.md"

## Clarifications

### Session 2026-08-07

- Q: How should the UPH categories be presented in the package selection view? → A: Two Separate Cards: Renders "Unit Pengolahan Hasil - 1 Jenis Produk" and "Unit Pengolahan Hasil - Multi-Jenis" as individual cards in the grid.
- Q: Does the word "/Truk/" in the headings for Mesin Pertanian, Pembentukan Infrastruktur Pasar, and Verifikasi Teknis represent a typo? → A: Treat as Typos: Keep the package names as "Mesin Pertanian", "Pembentukan Infrastruktur Pasar", and "Verifikasi atau Penelusuran Teknis".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pemohon Package Selection & Document Checklist Revamp (Priority: P1)

As a Pemohon submitting a new Sarpras proposal, I want to select the appropriate package from the updated list of 12 packages (including new options like Pikap and differentiated UPH packages) and see the correct download templates and mandatory documents for each package.

**Why this priority**: Essential first step in the proposal creation process. Correct document checklist prevents invalid submissions.

**Independent Test**:
Can be tested by starting the new proposal wizard, selecting each package (e.g. Ekstensifikasi, UPH 1 Jenis, UPH Multi-Jenis, Pikap), and verifying that:
1. The cards on Step 1 display the correct description and icon.
2. The document list dynamically adjusts to show only the required documents with their matching template download links.

**Acceptance Scenarios**:
1. **Given** a Pemohon starts a new proposal, **When** they select "Ekstensifikasi (Benih, Pupuk, Pestisida)", **Then** they see 6 common documents (Keterangan Simluhtan, Gambar Lahan, etc.) and 3 package-specific documents (Referensi Harga, Pernyataan Tanpa Bakar, Detail Pekebun) with correct download links.
2. **Given** a Pemohon select UPH Multi-Jenis, **Then** they see 10 additional UPH-specific documents (Perjanjian Kemitraan, Kelayakan Usaha, HGU/HGB, Perizinan, Rencana Kerja, Pernyataan Produksi, Kesanggupan Mengelola, Swadaya Belum Ada UPH, RAT, Biaya Operasional) in the list.
3. **Given** a Pemohon selects the new "Pikap" package, **Then** they see the Pikap document list including "Referensi Harga dari Penyedia" and "Perjanjian Kerja Sama Kemitraan Usaha".

---

### User Story 2 - Automated Minimum Rules Validation at Step 3 (Priority: P1)

As a Pemohon, I want to see real-time verification of whether my selected farmers (pekebun) and land area satisfy the updated rules for the selected package (e.g. 20 pekebun and/or 3 Ha for Ekstensifikasi) before submitting.

**Why this priority**: Prevents submitting under-sized proposals that would be rejected by verifiers.

**Independent Test**:
Can be tested on Step 3 of the proposal wizard by selecting different combinations of farmers and land, then confirming that the validation banner updates its status, counts, and deficiency indicators based on the package's specific rules.

**Acceptance Scenarios**:
1. **Given** the Pemohon selected "Ekstensifikasi" (rule: 20 pekebun AND/OR 3 Ha), **When** the total selected farmers is 15 but total land is 3.5 Ha, **Then** the validation status shows "Memenuhi syarat minimum" because the acreage is >= 3 Ha.
2. **Given** the Pemohon selected "Ekstensifikasi", **When** they select 12 farmers with a total of 2.1 Ha, **Then** the validation status shows "Belum memenuhi syarat minimum" and displays "kurang 8 pekebun dan kurang 0.9 Ha".

---

### User Story 3 - Proposal Review and Verification at Dinas & BPDP (Priority: P1)

As a Dinas Kabupaten, Dinas Provinsi, Ditjenbun, or BPDP verifier, I want to see the correct document list and verification checklist matching the selected package when reviewing a proposal.

**Why this priority**: Essential to ensure the verifiers review all legally mandated documents before forwarding the proposal.

**Independent Test**:
Can be tested by logging in as Dinas Kabupaten, opening a proposal submitted under a specific package (e.g., Jalan Kebun), and verifying that the verification screen renders the exact documents required for that package (e.g., Dokumen SID, Foto Jalan, Rincian Pekerjaan, Jangka Waktu, Kurva S, Harga Satuan).

**Acceptance Scenarios**:
1. **Given** a verifier opens a "UPH Multi-Jenis" proposal, **When** they view the document verification section, **Then** they are presented with all UPH Multi-Jenis documents (including PKS Kemitraan, Kelayakan Usaha, SHM/HGU/HGB, Perizinan, Rencana Kerja) to verify.
2. **Given** a verifier opens a "Jalan Kebun" proposal, **When** they view the document verification section, **Then** they are presented with all Jalan Kebun documents (including SID, Foto Jalan, Rincian Pekerjaan, Kurva S, etc.) to verify.

---

### Edge Cases

- **Switching UPH Types mid-draft**: If a user switches from "UPH 1 Jenis" to "UPH Multi-Jenis" in Step 1, the additional required documents MUST appear instantly, and the system must validate their upload before allowing transition to Step 2.
- **Empty minimum rules**: If "Verifikasi atau Penelusuran Teknis" is selected (which has no minimum limit), Step 3 validation MUST immediately pass as valid even with 1 farmer and 0.1 Ha.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `JenisSarpras` enum in `src/types/pengusulan.ts` MUST be updated to include new options and split UPH:
  - `UPH_1_JENIS` (Unit Pengolahan Hasil - 1 Jenis Produk)
  - `UPH_MULTI_JENIS` (Unit Pengolahan Hasil - Multi-Jenis)
  - `PIKAP` (Alat Transportasi - Pikap)
- **FR-002**: The `LOCALIZATION.jenisSarpras` map in `src/config/localization.ts` MUST be updated to support the new enum labels:
  - `UPH_1_JENIS`: "Unit Pengolahan Hasil (1 Jenis Produk)"
  - `UPH_MULTI_JENIS`: "Unit Pengolahan Hasil (Multi-Jenis / Skala Besar)"
  - `PIKAP`: "Alat Transportasi Pikap"
  And update other labels to match `ceklis_dokumen_persyaratan.md`.
- **FR-003**: The document definitions in `src/lib/pengusulan-persyaratan.config.ts` MUST include all the new document types from the checklist:
  - `KEMITRAAN` (Perjanjian kerja sama kemitraan usaha)
  - `KELAYAKAN_UPH` (Surat pernyataan kelayakan usaha pendirian UPH)
  - `SHM_HGU_HGB` (SHM, HGU, atau HGB atas lahan UPH)
  - `PERIZINAN_RISIKO` (Perizinan berusaha berdasarkan tingkat risiko)
  - `RENCANA_KERJA_UPH` (Rencana Kerja aspek teknis, finansial, manaj, dll.)
  - `PERNYATAAN_PRODUKSI` (Pernyataan hasil produksi buah)
  - `KESANGGUPAN_KELOLA` (Pernyataan kesanggupan mengelola adm & manajerial)
  - `WILAYAH_SWADAYA` (Pernyataan berada di wilayah swadaya belum ada UPH)
  - `HASIL_RAT` (Hasil RAT)
  - `BIAYA_OPERASIONAL` (Surat pernyataan kesanggupan membayar biaya operasional)
- **FR-004**: The `PAKET_PERSYARATAN_CONFIG` in `src/lib/pengusulan-persyaratan.config.ts` MUST map the exact documents listed in `ceklis_dokumen_persyaratan.md` for all 12 packages (including common documents: Keterangan Simluhtan, Gambar Lahan, RAB dan RK, Pernyataan Luas Lahan).
- **FR-005**: The `PAKET_MINIMUM_REQUIREMENTS` in `src/lib/pengusulan-persyaratan.config.ts` MUST be updated with the correct rules:
  - `EKSTENSIFIKASI`: 20 pekebun dan/atau 3 Ha
  - `INTENSIFIKASI`: 20 pekebun dan/atau 3 Ha
  - `ALAT_PASCAPANEN`: 20 pekebun dan/atau 3 Ha
  - `UPH_1_JENIS`: 20 pekebun dan/atau 5 Ha
  - `UPH_MULTI_JENIS`: 40 pekebun dan/atau 10 Ha (Note: 100 Ha or 5000 kelapa is verified manually, standard minimum validation uses 40 pekebun and/or 10 Ha)
  - `JALAN_KEBUN`: 20 pekebun dan/atau 10 Ha
  - `ALAT_ANGKUT_LANGSIR`: 20 pekebun dan/atau 3 Ha
  - `GEROBAK_BERMOTOR`: 20 pekebun dan/atau 5 Ha
  - `PIKAP`: 25 pekebun dan/atau 10 Ha
  - `TRUK`: 25 pekebun dan/atau 10 Ha
  - `MESIN_PERTANIAN`: 20 pekebun dan/atau 10 Ha
  - `INFRASTRUKTUR_PASAR`: 40 pekebun dan/atau 10 Ha
  - `VERIFIKASI_TEKNIS`: Tidak ada minimal (null)
- **FR-006**: The `PAKET_OPTIONS` in `src/lib/pengusulan-persyaratan.config.ts` MUST render the 12 packages, adjusting descriptions and binding the correct persyaratan lists.
- **FR-007**: The validation logic `isPupukPaket` inside the draft store and components MUST cover both `JenisSarpras.EKSTENSIFIKASI` and `JenisSarpras.INTENSIFIKASI`.
- **FR-008**: The verifier summary step (`StepSummaryDanSubmit.vue` for Kabupaten and Provinsi) and verification detail pages MUST correctly fetch dynamically and list the documents assigned to the proposal's selected package.

### Key Entities *(include if feature involves data)*

- **JenisSarpras**: Enum representing the 12 distinct packages of support.
- **PAKET_PERSYARATAN_CONFIG**: Configuration map matching each package to its array of required documents.
- **PAKET_MINIMUM_REQUIREMENTS**: Configuration map matching each package to its minimum count of farmers and land size.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 12 packages defined in `ceklis_dokumen_persyaratan.md` are selectable in Step 1 with correct descriptions and icon representations.
- **SC-002**: Validation in Step 3 correctly flags a proposal as invalid when it falls below both the farmer count and land area limits, and marks it valid if either or both are met.
- **SC-003**: In verification views for Dinas Kab/Prov, Ditjenbun, and BPDP, the document review tables adapt dynamically to list exactly the required documents of the proposal's selected package.

## Assumptions

- Document template links (e.g. `/templates/sporadik.docx`) will point to static templates served from the public folder.
- "Verifikasi atau Penelusuran Teknis" has no minimum limits for farmers or land, making it always pass minimum validation checks.
