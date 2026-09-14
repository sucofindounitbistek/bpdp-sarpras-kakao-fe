# Quickstart: Sync Existing RAB and Storage Area Validation Statuses

## Manual Verification

1. Open `http://localhost:5173/dinas/verifikasi/kabupaten/22`.
2. Observe Step 1 **Pemeriksaan RAB**:
   - Confirm that the uploaded file `BPDP _ Sarpras Kelapa.pdf` or `sample-local-pdf.pdf` displays cleanly.
   - Confirm that the `Setuju` (Approved) status is highlighted in green.
3. Observe Step 1 **Pemeriksaan Gudang Serah Terima**:
   - Confirm that storage area address and coordinate validation states match backend values.
4. Run `npx vue-tsc -b` and `npm run build` to verify type safety and compilation.
