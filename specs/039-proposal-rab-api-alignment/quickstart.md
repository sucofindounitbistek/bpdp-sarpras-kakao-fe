# Quickstart Guide: Proposal & RAB Store API Validation

**Feature**: `039-proposal-rab-api-alignment`  
**Date**: 2026-08-24  

---

## 1. Prerequisites

- Node.js 20+ and npm installed.
- Sibling backend service running at `http://localhost:8080` (or `VITE_API_BASE_URL` configured in `.env`).

---

## 2. End-to-End Validation Workflow

### Scenario 1: Submit New Proposal with Storage, Documents, and RAB
1. Open the application and navigate to `/pengusulan/baru` (Wizard Step 1).
2. Select a Sarpras package (e.g. `EKSTENSIFIKASI`).
3. Fill Storage Area information (`address`, `coordinate`) and upload interior/exterior photos.
4. Upload required proposal documents (`SURAT_PERMOHONAN`, `DOKUMEN_LEGALITAS_KELEMBAGAAN`, `SPTJM`).
5. Proceed to Wizard Step 2 (RAB):
   - Add line items with quantity breakdown (`jumlahTahap1`, `jumlahTahap2`), unit, and unit price.
   - Verify real-time subtotal and total calculations.
6. Proceed to Wizard Step 3 (Pekebun & Lahan Selection):
   - Select farmer profiles and assigned land plots (`lahan_ids`).
   - Click "Kirim Pengajuan".
7. Verify sequential API calls in Network tab:
   - `POST /api/v1/proposals` $\rightarrow$ `201 Created`
   - `POST /api/v1/proposals/:id/documents/bulk` $\rightarrow$ `201 Created`
   - `POST /api/v1/rabs` $\rightarrow$ `201 Created`
8. Verify success toast displays the generated `nomor_proposal` (e.g. `SPKA108260001`).

---

### Scenario 2: Proposal Tracking & Verification Queue
1. Navigate to `/pengusulan/tracking` or `/dinas/kabupaten/verifikasi`.
2. Verify proposal items display `nomor_proposal`, `paket_sarpras`, `total_anggaran`, and `status`.
3. Search by `nomor_proposal` and verify reactive filter matches.
4. Open Proposal Detail Modal / Verification Page:
   - Check `storage_area` address and photo previews.
   - Check attached `documents` list with downloadable/previewable file links.
   - Check itemized `RAB` budget breakdown with stage columns.

---

## 3. Type Checking & Build Verification

```bash
# Type check all TypeScript files
npm run build
```
Ensure 0 TypeScript errors and 0 build errors.
