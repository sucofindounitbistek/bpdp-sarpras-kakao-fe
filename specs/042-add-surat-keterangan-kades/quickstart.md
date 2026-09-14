# Quickstart Validation Guide: Surat Keterangan Kades in Proposal

This guide describes how to verify the new Surat Keterangan Kades proposal-level document.

## Prerequisites

- Dev server running (`npm run dev`)
- Logged in as `PEMOHON` (for proposal creation) and `DINAS_KABUPATEN` (for verification)

## Verification Scenarios

### Scenario 1: Uploading the Document (Proposal Creation Flow)
1. Log in as a Pemohon / Cooperative.
2. Click **Ajukan Usulan Baru**.
3. Select any Paket (e.g. Ekstensifikasi).
4. Verify "Surat Keterangan Kepala Desa" is listed under required documents.
5. Upload a PDF, proceed, and submit the proposal.

### Scenario 2: Verifying the Document (Verifier Flow)
1. Log in as Dinas Kabupaten.
2. Go to Verifikasi queue, click the submitted usulan.
3. In Step 1 (Verifikasi Pekebun & Dokumen), verify "Surat Keterangan Kepala Desa" is listed in the proposal documents table.
4. Click **Verifikasi**, preview the document in the modal, and toggle it as Sesuai / Tidak Sesuai.
