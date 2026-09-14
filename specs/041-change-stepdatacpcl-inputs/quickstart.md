# Quickstart Validation Guide: Change StepDataCPCL Inputs

This guide describes how to verify the new document uploads.

## Prerequisites

- Dev server running (`npm run dev`)
- Logged in as `DINAS_KABUPATEN`

## Verification Scenarios

### Scenario 1: Uploading Three Documents
1. Go to Verifikator Kabupaten Detail view.
2. Select Step 3 ("SK CPCL").
3. Verify that three file upload inputs exist:
   - "Berita Acara Verifikasi Dokumen"
   - "Berita Acara Verifikasi Lapangan"
   - "Dokumen SK CPCL Ditandatangani"
4. Upload a sample PDF to each input.
5. Click **Simpan & Lanjut ke Summary & Submit**.
6. Verify you are redirected to the summary page and all three files show in the list with a preview button.
