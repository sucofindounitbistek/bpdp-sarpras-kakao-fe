# Quickstart Validation Guide: Revamp Pengusulan Baru — Multi-Step Wizard

**Feature**: `006-pengusulan-baru-revamp`
**Phase**: 1 — Design & Contracts
**Date**: 2026-07-31

---

## Prerequisites

- Node.js 18+ installed
- Dependencies installed: `npm install`
- Dev server running: `npm run dev`
- Application accessible at `http://localhost:5173` (or configured Vite port)

---

## How to Navigate to the Feature

1. Open the app in the browser
2. Navigate to the Sidebar → Pengusulan Sarpras → Buat Usulan Baru
   - OR directly: `http://localhost:5173/pengusulan/baru`
3. The 3-step wizard should render with Step 1 active

---

## Validation Scenarios

### Scenario 1 — Step 1: Pemilihan Paket & Dokumen (Happy Path)

**Goal**: Verify 9 paket options render, persyaratan update per selection, upload works, preview works, and Gudang section appears for pupuk pakets.

1. Observe Step 1 header: "Pemilihan Jenis Paket Sarpras"
2. Verify 9 paket cards are displayed
3. Click "Ekstensifikasi (Benih, Pupuk, Pestisida)"
   - **Expected**: Persyaratan list updates; "Gudang Serah Terima" section appears below
4. Click "Download Format Dokumen" for "Proposal Usulan"
   - **Expected**: A file download is triggered
5. Click "Upload" on "Proposal Usulan" slot → select any PDF file
   - **Expected**: File appears in slot with status "Terunggah" and "Pratinjau" button
6. Click "Pratinjau" on uploaded document
   - **Expected**: Modal opens with PDF preview (iframe or image)
7. Fill Gudang Serah Terima: Alamat, Koordinat, upload Foto Tampak Depan, upload Foto Tampak Dalam
8. Click "Lanjut ke Step 2"
   - **Expected**: If all wajib docs uploaded → proceeds to Step 2
   - **Expected**: If missing wajib docs → validation toast shown, cannot advance

---

### Scenario 2 — Step 1: Non-Pupuk Paket (No Gudang)

1. Click "Alat Pascapanen"
   - **Expected**: Persyaratan list updates; "Gudang Serah Terima" section NOT visible
2. Click "Mesin Pertanian"
   - **Expected**: Persyaratan list updates accordingly; no Gudang section

---

### Scenario 3 — Step 1: Switch from Pupuk to Non-Pupuk Paket

1. Select "Intensifikasi" and fill Gudang data
2. Click a different paket (e.g. "Alat Transportasi")
   - **Expected**: Confirmation dialog appears: "Data Gudang Serah Terima akan dihapus. Lanjutkan?"
3. Confirm → paket switches, Gudang data cleared

---

### Scenario 4 — Step 2: RAB Table (Happy Path)

1. On Step 2, observe empty RAB table with columns: Tahap | Uraian | Volume | Satuan | Harga Satuan | Sub-total | (Delete)
2. Click "Tambah Baris"
   - **Expected**: New empty row appears
3. Fill: Tahap = "I", Uraian = "Pengadaan Benih", Volume = 100, Satuan = "batang", Harga Satuan = 15000
   - **Expected**: Sub-total auto-updates to "Rp 1.500.000"
4. Add another row; fill values; verify both sub-totals and a grand total row
5. Click delete icon on a row → **Expected**: Row removed
6. Click "Unduh RAB" → **Expected**: File download triggered (CSV or PDF)
7. Upload signed RAB (any PDF) → **Expected**: File appears with confirmation + "Pratinjau" button
8. Click "Pratinjau" on signed RAB → **Expected**: Modal opens with preview
9. Click "Lanjut ke Step 3" → **Expected**: Proceeds if RAB has rows + signed RAB uploaded

---

### Scenario 5 — Step 3: Pilih Pekebun & Lahan (Happy Path)

1. On Step 3, observe list of available pekebun from master data
2. Select a pekebun by checkbox/click
   - **Expected**: Lahan list for that pekebun appears
3. Select one or more lahan
4. Click "Pratinjau Proposal"
   - **Expected**: Modal opens showing full proposal summary (paket, persyaratan uploaded, RAB total, pekebun list, lahan list)
5. Inside modal, click "Pratinjau" on an uploaded document → **Expected**: Document preview renders inline
6. Close modal → click "Submit Proposal"
   - **Expected**: Success toast: "Pengajuan proposal berhasil dikirimkan!" with nomor resi
   - **Expected**: Redirect to `/pengusulan/tracking`
   - **Expected**: New entry appears in tracking list

---

### Scenario 6 — Validation: Cannot Advance Without Required Fields

1. On Step 1, click "Lanjut ke Step 2" without uploading any documents
   - **Expected**: Toast error or inline validation message listing missing docs
2. On Step 2, click "Lanjut ke Step 3" without adding RAB rows
   - **Expected**: Toast/validation: "Minimal 1 baris RAB harus diisi"
3. On Step 3, click "Submit Proposal" without selecting pekebun
   - **Expected**: Toast/validation: "Pilih minimal 1 pekebun dan 1 lahan"

---

### Scenario 7 — Step Navigation (Back Button)

1. Advance to Step 3
2. Click "Kembali" → **Expected**: Returns to Step 2 with RAB data preserved
3. Click "Kembali" again → **Expected**: Returns to Step 1 with paket selection and uploads preserved

---

## TypeScript Verification

```bash
# Must pass with 0 errors
npx vue-tsc -b
```

## Build Verification

```bash
# Must build successfully
npm run build
```

---

## References

- Data Model: [data-model.md](./data-model.md)
- UI Contract: [contracts/pengusulan-baru-ui-contract.md](./contracts/pengusulan-baru-ui-contract.md)
- Spec: [spec.md](./spec.md)
