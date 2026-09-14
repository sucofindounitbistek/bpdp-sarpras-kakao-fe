# Quickstart & Validation Guide: Dynamic Verification Action Button (035-revisi-button-verifikasi)

## Overview
This guide provides manual testing steps to verify that the primary action button dynamically toggles to "Kembalikan Untuk Revisi" when document rejections exist during Dinas verification.

## Manual Validation Steps

### Test Scenario 1: All Items Approved / Unverified (Default Flow)
1. Open browser at `http://localhost:5173`.
2. Log in / switch role to **Dinas Kabupaten** (`DINAS_KAB`).
3. Open a proposal detail for verification (e.g. `/dinas/verifikasi/kabupaten/1`).
4. Ensure all items are unverified or approved ("Setuju").
5. **Expected Outcome**:
   - Primary action button on the bottom right displays **"Simpan & Lanjut ke SK CPCL"** (or forward label) with Green (`#066C2A`) styling and right arrow icon.

---

### Test Scenario 2: Mark 1 Document as Rejected ("Tolak")
1. On the same verification page, click "Verifikasi Dokumen" on any document.
2. Select **"Tolak"** and type a rejection reason note (e.g. "Scan KTP buram dan tidak terbaca").
3. Click "Selesai".
4. **Expected Outcome**:
   - Primary action button on the bottom right **instantly transforms** to **"Kembalikan Untuk Revisi"** with Rose/Red (`bg-rose-600`) styling and `RotateCcw` / `XCircle` icon.
   - Forward step button is NO LONGER rendered.

---

### Test Scenario 3: Submit Rejection for Revision
1. Click **"Kembalikan Untuk Revisi"**.
2. **Expected Outcome**:
   - `ApprovalConfirmationModal` opens in rejection mode (`actionType: 'reject'`) with title "Konfirmasi Pengembalian" and destination "Pemohon (Revisi)".
   - Clicking "Ya, Kembalikan" updates proposal status to `REVISION_ADMIN` ("Perlu Revisi") and redirects to queue.
