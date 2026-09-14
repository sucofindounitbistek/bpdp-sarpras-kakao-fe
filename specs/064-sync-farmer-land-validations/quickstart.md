# Quickstart: Sync Farmer & Land Document Validations from Backend

## Manual Verification

1. Open `http://localhost:5173/dinas/verifikasi/kabupaten/22`.
2. Inspect farmer list documents (KTP, KK, Swafoto, Surat Kuasa).
3. Verify that statuses (`Sesuai` / `Tidak Sesuai`) and notes restore accurately from `GET /farmer-document-validations` and `GET /land-document-validations`.
4. Run `npx vue-tsc -b` and `npm run build` to verify type safety.
