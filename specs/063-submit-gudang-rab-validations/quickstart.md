# Quickstart: Submit Storage Area & Proposal Document Validations to Backend

## Manual Verification

1. Open `http://localhost:5173/dinas/verifikasi/kabupaten/22`.
2. Approve/reject Gudang address and coordinate items.
3. Advance to Step 4 and click "Ajukan ke Provinsi".
4. Confirm network payload sends `storage_area` object containing `address_is_valid`, `coordinate_is_valid`, etc. to backend.
5. Run `npx vue-tsc -b` and `npm run build` to verify type safety.
