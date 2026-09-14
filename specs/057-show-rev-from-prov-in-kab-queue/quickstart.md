# Quickstart & Verification Guide: Show REV_FROM_PROV Status in QueueVerifikasiKabView

## Verification Steps

1. Start dev server:
   ```bash
   cd bpdp-sarpras-kelapa-fe
   npm run dev
   ```
2. Open Dinas Kabupaten verification queue page (`/dinas/verifikasi`).
3. Verify that proposals in status `REV_FROM_PROV` appear in the verification table with warning badge style.
4. Run build verification:
   ```bash
   npm run build
   ```
