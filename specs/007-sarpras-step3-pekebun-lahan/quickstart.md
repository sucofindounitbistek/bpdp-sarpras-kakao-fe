# Quickstart Validation Guide: Step 3 Pengajuan Sarpras — Pekebun & Lahan, Dokumen Kepemilikan, Validasi Minimum Paket

**Feature**: `007-sarpras-step3-pekebun-lahan`
**Phase**: 1 — Design & Contracts
**Date**: 2026-07-31

---

## Prerequisites

- Node.js 18+ installed
- Dependencies installed: `npm install`
- Dev server running: `npm run dev`
- Application accessible at `http://localhost:5173`
- Must have pekebun data in the system (via Master Data Pekebun). Mock data exists in `usePekebunStore` with 3 pekebun.

---

## How to Navigate to the Feature

1. Open the app → navigate to `http://localhost:5173/pengusulan/baru`
2. Complete Step 1 (select paket, upload required documents)
3. Complete Step 2 (fill RAB, upload signed RAB)
4. Click "Lanjut ke Step 3" → Step 3: Pilih Pekebun & Lahan renders

---

## Validation Scenarios

### Scenario 1 — Combined Pekebun-Lahan Tree View (Happy Path)

**Goal**: Verify pekebun and their lahan are displayed in a single combined tree hierarchy.

1. Observe Step 3: "Pilih Pekebun & Lahan" header with total pekebun/luas summary bar
2. Verify each pekebun card shows:
   - Pekebun name, NIK, checkbox
   - Inline lahan info below the pekebun name (legalitas, luas, lokasi)
3. Click a pekebun card to select it
   - **Expected**: Pekebun checkbox turns green with checkmark; border turns emerald
   - **Expected**: Lahan under that pekebun is auto-selected; document ownership fields appear
4. Verify the summary bar updates: "Pekebun: 1 | Total Luas: X Ha"
5. Deselect the pekebun
   - **Expected**: Lahan also deselected; document ownership fields removed
   - **Expected**: Summary bar updates: "Pekebun: 0 | Total Luas: 0 Ha"

---

### Scenario 2 — Document Ownership Selection (SHM)

**Goal**: Verify SHM document type selection works per lahan.

1. Select a pekebun
2. Observe document ownership fields under the lahan
3. Verify dropdown shows "SHM" selected by default
4. Enter nomor SHM: "12345/2024"
5. Verify no "Jenis Dokumen Lainnya" field is visible (only shown for Dokumen Lainnya)
6. Select another pekebun → pick SHM → enter a different nomor
7. Verify both lahan have their own document data

---

### Scenario 3 — Document Ownership Selection (Dokumen Lainnya)

**Goal**: Verify "Dokumen Lainnya" option shows additional fields.

1. Select a pekebun
2. Change dropdown from "SHM" to "Dokumen Lainnya"
   - **Expected**: "Jenis Dokumen" text input appears (e.g. "Girik", "Akta Jual Beli", "SKT")
   - **Expected**: "Nomor Dokumen" input remains visible
3. Enter jenis: "Girik" and nomor: "G-001/2023"
4. Switch back to "SHM"
   - **Expected**: "Jenis Dokumen" input hides; "Nomor Dokumen" input clears

---

### Scenario 4 — Minimum Paket Validation (Pass)

**Goal**: Verify validation passes when pekebun count or luas meets minimum.

1. Go back to Step 1, select "Ekstensifikasi" (min: 20 pekebun atau 5 Ha)
2. Return to Step 3
3. Select pekebun until total pekebun >= 20 (or total luas >= 5 Ha)
   - **Expected**: Validation status bar turns green
   - **Expected**: Message: "Memenuhi Syarat"
   - **Expected**: Submit button is enabled
4. If mock data has < 20 pekebun, select all available pekebun
   - **Expected**: If total luas >= 5 Ha, validation still passes (OR logic)

---

### Scenario 5 — Minimum Paket Validation (Fail)

**Goal**: Verify validation fails when neither minimum is met.

1. Select "Ekstensifikasi" in Step 1 (min: 20 pekebun atau 5 Ha)
2. In Step 3, select only 3 pekebun with total luas < 5 Ha
   - **Expected**: Validation status bar turns red/amber
   - **Expected**: Warning message shows: "Belum memenuhi syarat minimum. Total pekebun: 3 (min. 20), total luas: 2.3 Ha (min. 5 Ha). Kurang 17 pekebun atau 2.7 Ha."
   - **Expected**: Submit button is disabled
3. Add more pekebun/lahan until one condition is met
   - **Expected**: Status turns green immediately

---

### Scenario 6 — No Minimum for Verifikasi Teknis

**Goal**: Verify no validation is applied for Verifikasi Teknis.

1. Go to Step 1, select "Verifikasi atau Penelusuran Teknis"
2. Return to Step 3
3. Select any number of pekebun (even 1)
   - **Expected**: Validation status bar shows "Tidak ada persyaratan minimum" (neutral/no warning)
   - **Expected**: Submit is enabled as long as pekebun + lahan docs are filled

---

### Scenario 7 — Jarak Antar Kebun Note

**Goal**: Verify distance requirement note appears for transport/machinery pakets.

1. Select "Alat Angkut Langsir" in Step 1 (min: 25 pekebun, 10 Ha, jarak maks 0.5 km)
2. Go to Step 3
   - **Expected**: Validation status bar includes note: "Catatan: Jarak antar kebun maksimal 0.5 km (diverifikasi petugas lapangan)"
3. Select "Gerobak Bermotor" (jarak maks 1 km)
   - **Expected**: Note updates to "Jarak antar kebun maksimal 1 km"
4. Select "Ekstensifikasi" (no jarak requirement)
   - **Expected**: No jarak note displayed

---

### Scenario 8 — Document Ownership Validation on Submit

**Goal**: Verify submit is blocked if lahan documents are incomplete.

1. Select a pekebun
2. Leave nomor dokumen empty
3. Click "Submit Proposal"
   - **Expected**: Toast error: "Lengkapi dokumen kepemilikan untuk semua lahan yang dipilih."
4. Select "Dokumen Lainnya", leave jenis dokumen empty
5. Click "Submit Proposal"
   - **Expected**: Toast error about missing jenis dokumen

---

### Scenario 9 — Pratinjau Proposal with Lahan Document Info

**Goal**: Verify preview modal shows lahan document ownership data.

1. Complete all steps, fill document ownership for all lahan
2. Click "Pratinjau Proposal"
   - **Expected**: Section "Pekebun & Lahan" shows:
     - Total pekebun count and total luas
     - Each pekebun with their lahan
     - Document type and number per lahan (e.g. "SHM: 12345/2024" or "Girik: G-001/2023")

---

### Scenario 10 — Empty State

**Goal**: Verify empty state when no pekebun are registered.

1. If pekebun store is empty:
   - **Expected**: "Belum ada pekebun terdaftar" message with guidance to Master Data Pekebun
2. If a pekebun has no lahan:
   - **Expected**: "Belum ada lahan" indicator next to pekebun; checkbox disabled

---

### Scenario 11 — Cross-Step Data Persistence

**Goal**: Verify Step 3 data survives step navigation.

1. Fill Step 3: select pekebun, fill document ownership
2. Click "Kembali" to Step 2 → **Expected**: Step 2 data preserved
3. Click "Lanjut ke Step 3" → **Expected**: All pekebun selections and document data preserved
4. Click "Kembali" to Step 1 → change paket to a different one
5. Return to Step 3 → **Expected**: All Step 3 selections reset (validation must be recalculated)

---

## TypeScript Verification

```bash
npx vue-tsc -b
```

Must pass with 0 errors.

## Build Verification

```bash
npm run build
```

Must build successfully.

---

## References

- Spec: [spec.md](./spec.md)
- Data Model: [data-model.md](./data-model.md)
- Research: [research.md](./research.md)
- Plan: [plan.md](./plan.md)