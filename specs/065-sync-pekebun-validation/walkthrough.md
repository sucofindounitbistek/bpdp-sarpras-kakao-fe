# Walkthrough: Pekebun Document Validation Synchronization Fix

## Issue Summary
When opening the Pekebun detail verification page (`/dinas/verifikasi/kabupaten/:id/pekebun/:cpclId`), document status dots remained gray (`PENDING`) and field validation buttons (`namaLengkap`, `nik`, `nomorKK`) remained unselected even though backend validation data existed.

## Root Causes Identified
1. `VerifikasiPekebunDetailView.vue` was not fetching `getFarmerDocumentValidations` or calling `syncFarmerDocumentValidations` in its `onMounted` hook when loaded directly or navigated to.
2. `allDocs` fallback in `VerifikasiPekebunDetailView.vue` only checked `pekebun.value?.dokumen` and missed `cpcl.value?.dokumen` / `cpcl.value?.documents`.
3. `syncFarmerDocumentValidations` in `verifikasiKabDraft.ts` previously only populated a single key format and did not alias across document IDs and field detail keys.

## Key Changes Made

### 1. `VerifikasiPekebunDetailView.vue`
- Updated `onMounted` to fetch `getFarmerDocumentValidations({ pengajuan_id })` in parallel with proposal details and `fetchPekebunList`.
- Automatically calls `verifikasiStore.syncFarmerDocumentValidations` upon receiving validation data.
- Enhanced `allDocs` computed property to fall back to `cpcl.value.dokumen` and `cpcl.value.documents`.
- Automatically selects the first document tab on page load if none is selected.

### 2. `verifikasiKabDraft.ts`
- Enhanced `syncFarmerDocumentValidations` to populate store state across document ID, document type, and field-level keys (`namaLengkap`, `nik`, `nomorKK`).
- Supports matching CPCL entries across `daftarCPCL`, `documents`, `dokumen_pekebun`, and NIK lookups in `pekebunStore.listPekebun`.

## Verification Results
- All status dots for verified documents (Scan KTP, Scan KK, Swafoto, Surat Kuasa) display green (`APPROVED`).
- Field check buttons (`namaLengkap`, `nik`, `nomorKK`) highlight green (`Sesuai`).
- Vue TypeScript type-check passed with 0 errors.
