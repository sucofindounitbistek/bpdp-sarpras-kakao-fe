# Quickstart Guide: Sync Pekebun Document Validation Status

## Overview
This guide provides instructions to verify that Pekebun document validation status is accurately synchronized from backend responses to the Dinas Kabupaten verification interface.

## Prerequisites
- Frontend development server running (`npm run dev` at `http://localhost:5173`)
- Backend API running or mock server returning valid document validation payload for `pengajuan_id: 22`

## Verification Steps

### Step 1: Open Target Verification Page
Navigate to `http://localhost:5173/dinas/verifikasi/kabupaten/22` in your browser.

### Step 2: Verify Status Indicators on Proposal Verification List
1. Inspect the "Data CPCL / Pekebun" list under Step 1 ("Verifikasi Pekebun & Dokumen").
2. Check the status badge for each Pekebun with existing validation records (e.g. `dokumen_pekebun_id: 37, 38, 39, 40`).
3. **Expected Outcome**: Status badges for these pekebun items MUST display "Sesuai" (Green Check) instead of "Belum Diverifikasi".

### Step 3: Verify Detail Pekebun Page
1. Click "Verifikasi" on a farmer item (e.g. navigate to `/dinas/verifikasi/kabupaten/22/pekebun/:cpclId`).
2. Inspect document items (Scan KTP, Scan KK, Swafoto, Surat Kuasa).
3. **Expected Outcome**: Document verification indicators show green dots (`APPROVED`) for validated items and field checks (`namaLengkap`, `nik`, `nomorKK`) are selected as Sesuai.

### Step 4: Verification Failure Assertion
- Zero items with existing `is_valid: true` backend validation records should show "Belum Diverifikasi".
