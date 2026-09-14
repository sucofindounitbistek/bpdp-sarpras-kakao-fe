# UI & Integration Contract: Surat Keterangan Kades in Proposal

## Component Layout Constraints

### `StepPaketSarpras.vue` (Step 2 - Proposal Creation)
- Displays "Surat Keterangan Kepala Desa" as an upload slot under package document requirements.
- Uses `FileUpload` component with PDF capability.

### `StepVerifikasiPekebunDanDokumenProposal.vue` (Step 1 - Verifier)
- Lists "Surat Keterangan Kepala Desa" under "Dokumen Persyaratan" table.
- A action button opens `openDokVerifModal` displaying the document preview and allowing Setuju/Tolak status updates.
