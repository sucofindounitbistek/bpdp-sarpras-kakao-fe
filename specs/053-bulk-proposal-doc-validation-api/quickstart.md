# Quickstart & Verification Guide: Bulk Proposal Document Validation API

## Verification Steps

1. Launch dev server:
   ```bash
   cd bpdp-sarpras-kelapa-fe
   npm run dev
   ```
2. Open network tab in dev tools.
3. Open proposal verification page in Dinas Kabupaten view (`/dinas/verifikasi/kabupaten/:id`).
4. Verify document statuses.
5. Click **Simpan & Lanjut ke SK CPCL** or **Kembalikan ke Pemohon**.
6. Confirm `POST /api/proposal-document-validations/bulk` is sent with array of document validation items.
7. Run build check:
   ```bash
   npm run build
   ```
