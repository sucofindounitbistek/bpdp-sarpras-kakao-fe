# Quickstart & Verification Guide: Verifikasi Pekebun Submit All at End

## Prerequisites
- Node.js environment
- Frontend server running (`npm run dev`)
- Logged in as **Dinas Kabupaten** role

## Verification Procedure

### Scenario 1: Step Transition Deferral (Step 1 -> Step 3)
1. Go to proposal verification list.
2. Select any proposal, click **Verifikasi**.
3. Under **Daftar CPCL**, click **Verifikasi Pekebun** for a farmer.
4. Mark fields (Nama Lengkap, NIK) as **Sesuai**.
5. Click Back.
6. Click **Simpan & Lanjut ke SK CPCL** at the bottom.
7. **Verification**: Check Developer Tools Network Tab. No requests must be triggered to:
   - `/api/v1/farmer-document-validations/bulk`
   - `/api/v1/land-document-validations/bulk`

### Scenario 2: Final Bulk Submission (Step 4)
1. Proceed to Step 4 (**Summary & Submit**).
2. Click **Ajukan Ke Provinsi**.
3. **Verification**: Check Network Tab. The following requests must be executed sequentially:
   1. `POST /api/v1/farmer-document-validations/bulk` (if farmers exist)
   2. `POST /api/v1/land-document-validations/bulk` (if land documents exist)
   3. `POST /api/v1/proposals/:id/documents/bulk` (if SK CPCL/BA documents uploaded)
   4. `PATCH /api/v1/proposals/:id` (with status `KAB_SUBMITTED`)
