# Quickstart Validation Guide: Remove Generate SK Step

This guide describes how to verify the simplified SK finalization flow.

## Prerequisites

- Dev server running (`npm run dev`)
- Logged in as `BPDP_VERIFIKATOR`

## Verification Scenarios

### Scenario 1: Direct Form Visibility
1. Open the BPDP Antrean queue and select an usulan in the **Finalisasi SK Dirut** stage.
2. Verify that:
   - The "Generate Rancangan SK Dirut" step/button is not rendered.
   - The form is fully visible: "2. Unduh Draf & Tanda Tangan", "3. Nomor Keputusan", and "4. Unggah SK Dirut Signed" are immediately rendered.
   - The download link `Download Draf SK Dirut.pdf` points to the mock URL (`/files/draft-sk-{id}.pdf`).
3. Click the download link and verify that it starts a mock download.
4. Input a Nomor SK, upload a sample PDF, and click **Selesaikan Penerbitan SK Dirut**.
5. Verify the usulan status updates to **SELESAI** and redirected to queue.
