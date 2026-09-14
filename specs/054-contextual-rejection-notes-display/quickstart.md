# Quickstart & Verification Guide: Contextual Rejection Notes Display

## Verification Steps

1. Start dev server:
   ```bash
   cd bpdp-sarpras-kelapa-fe
   npm run dev
   ```
2. Navigate to proposal in `REVISION_ADMIN` status.
3. Open **Pekebun / CPCL page**:
   - Confirm rejected Pekebun documents show rose rejection alert badges with verifier notes directly under the farmer record.
4. Open **Proposal Document page**:
   - Confirm rejected Proposal documents (e.g., Surat Permohonan, Gudang, RAB) show rose rejection alert banners directly next to the document row.
5. Run build verification:
   ```bash
   npm run build
   ```
