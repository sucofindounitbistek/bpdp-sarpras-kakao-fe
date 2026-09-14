# Quickstart & Verification Guide: Proposal Document Validation

## Verification Scenario

1. Launch dev server:
   ```bash
   cd bpdp-sarpras-kelapa-fe
   npm run dev
   ```
2. Navigate to proposal verification flow (`/dinas/verifikasi/kabupaten/:id`).
3. If a mandatory document is not uploaded or not approved:
   - Click "Simpan & Lanjut ke SK CPCL".
   - Confirm error toast appears listing mandatory document names, and step remains at Step 2.
4. Approve all mandatory documents.
5. Click "Simpan & Lanjut ke SK CPCL" -> successfully advances to Step 3 (`currentStep = 3`).
6. Run build verification:
   ```bash
   npm run build
   ```
