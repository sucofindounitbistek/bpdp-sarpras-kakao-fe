# Implementation Plan: Export Data Proposal Dinas Kabupaten Sesuai Wilayah Terkait

**Branch**: `085-export-proposal-wilayah-kabupaten` | **Date**: 2026-09-14 | **Spec**: [`specs/085-export-proposal-wilayah-kabupaten/spec.md`](spec.md)

**Input**: Feature specification from [`specs/085-export-proposal-wilayah-kabupaten/spec.md`](spec.md)

---

## Summary

Mengimplementasikan pembatasan cakupan data (*regional scoping*) pada fitur ekspor proposal (CSV dan PDF) khusus untuk peran **Dinas Kabupaten/Kota** (`DINAS_KAB`) di antarmuka `QueueVerifikasiKabView.vue` dan `ExportProposalModal.vue`:
1. **Penegasan Cakupan Wilayah Tanpa Ketergantungan API Wilayah**: Karena master API Wilayah berjenjang (Kecamatan/Desa) belum selesai di backend, filter wilayah manual ditiadakan/ditunda dan digantikan dengan **indikator cakupan wilayah terkunci otomatis** (*auto-scoped badge*) berbasis profil wilayah dinas pengguna aktif.
2. **Aturan Pencocokan Wilayah Berlapis (*Hybrid Matching Rule*)**: Memastikan data proposal yang diekspor disaring secara presisi berdasarkan kecocokan ID wilayah (`regency_id` atau `kode_kabupaten`) dengan fallback pencocokan nama kabupaten dinas melalui helper teruji `getKabupatenNama()`.
3. **Pencegahan Kebocoran Data (Zero Leakage)**: Meneruskan parameter `regency_id` pada query API dan melakukan sanitasi data di sisi klien sebelum berkas CSV (`exportProposalsToCsv`) atau PDF (`exportProposalsToPdf`) diunduh, sehingga total proposal pada ringkasan pratinjau (*match count*) 100% konsisten dengan isi dokumen.

---

## Technical Context

**Language/Version**: TypeScript 5.3+, Vue 3.4+ (`<script setup>`)  
**Primary Dependencies**: Vite, Pinia, Lucide Vue Next, Tailwind CSS, jsPDF / jspdf-autotable (PDF generation)  
**Storage**: Pinia reactive auth store (`authStore.user`), proposal store (`usePengusulanStore`), Browser Blob URL download  
**Testing**: Manual scenario verification, TypeScript strict typecheck (`npx vue-tsc -b`), Vitest unit tests for export utils  
**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: Single-Page Application (SPA) Frontend  
**Performance Goals**: Eksekusi filter wilayah dan penyiapan berkas ekspor selesai dalam < 1.5 detik untuk hingga 500 proposal  
**Constraints**: Zero data leakage antar-kabupaten, kompatibilitas mundur dengan pemanggilan `ExportProposalModal` dari peran lain (Provinsi, Ditjenbun, BPDP) tanpa regresi  
**Scale/Scope**:
- `src/components/pengusulan/ExportProposalModal.vue` (UI indicator banner, scoped count, and export execution)
- `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue` (Wiring regional scope props)
- `src/utils/regionHelper.ts` (Hybrid matching helper `matchesProposalRegion`)
- `src/utils/exportProposal.ts` / `src/utils/exportProposal.test.ts` (Client CSV generation integration & unit test)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Vue 3 & Component-Driven)**: ✅ PASS. Menggunakan `<script setup>` SFCs, props bertipe ketat, dan modul yang dapat digunakan ulang.
- **Principle II (Strict TypeScript & Schema Validation)**: ✅ PASS. Menambahkan definisi tipe `ProposalExportQueryParams` dan interface props modal baru secara eksplisit.
- **Principle III (Pinia State Management)**: ✅ PASS. Mengambil data identitas pengguna secara terpusat dari `authStore` tanpa mutasi lokal di luar store.
- **Principle IV (Modern UI/UX)**: ✅ PASS. Desain info badge wilayah rapi, menggunakan palet hijau emerald khas SARPRAS dan dark mode harmony.
- **Principle V (Zero Redundancy & DRY)**: ✅ PASS. Menggunakan kembali helper wilayah `regionHelper.ts` dan fungsi ekspor `exportProposal.ts` yang sudah ada, tanpa menduplikasi logika pembuatan CSV/PDF.
- **Principle IX (Backend API Error Response Fidelity)**: ✅ PASS. Error penarikan data ditangkap dan ditampilkan via Toast notification yang informatif.
- **Principle X (UI/UX Pro Max Standard)**: ✅ PASS. Menggunakan warna brand `#066C2A`, font weight `font-medium`/`font-semibold`, dan transisi halus.
- **Principle XIV (Compact Information Density)**: ✅ PASS. Banner cakupan wilayah dirancang padat, proporsional, dan tidak memenuhi dialog.
- **Principle XVI (No Nested Modals)**: ✅ PASS. Filter dan ekspor berjalan dalam satu modal dialog tunggal tanpa tumpukan popup.

---

## Project Structure

### Documentation (this feature)

```text
specs/085-export-proposal-wilayah-kabupaten/
├── spec.md              # Feature specification & clarifications
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 research & architectural decisions
├── data-model.md        # Data model, interfaces & matching logic
├── quickstart.md        # Verification runbook & test checklist
├── contracts/
│   └── export-proposal-wilayah.contract.md # Modal props & export payload contracts
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── utils/
│   ├── regionHelper.ts           # [MODIFY] Tambahkan helper `matchesProposalRegion` & resolusi nama wilayah dinas
│   └── exportProposal.ts         # [MODIFY] Pastikan ekspor CSV klien terintegrasi dengan dataset tersaring
├── components/
│   └── pengusulan/
│       └── ExportProposalModal.vue # [MODIFY] Tambahkan prop wilayah, info badge wilayah, dan logika penyaringan klien
└── views/
    └── dinas/
        └── kabupaten/
            └── QueueVerifikasiKabView.vue # [MODIFY] Kirimkan prop wilayah aktif ke ExportProposalModal
```

**Structure Decision**: Perubahan difokuskan pada `ExportProposalModal.vue` dan `regionHelper.ts`, dengan integrasi terarah di `QueueVerifikasiKabView.vue`. Peran lain yang memanggil `ExportProposalModal` (Provinsi, Ditjenbun, BPDP) tetap beroperasi seperti biasa tanpa interupsi karena prop wilayah bersifat opsional.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| *None* | Zero-violation architecture | Fitur mengadopsi struktur komponen dan utilitas yang sudah mapan |
