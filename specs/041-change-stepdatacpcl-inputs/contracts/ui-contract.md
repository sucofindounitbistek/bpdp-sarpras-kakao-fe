# UI & Integration Contract: Change StepDataCPCL Inputs

## Component Contract

### `StepDataCPCL.vue`
Renders three FileUpload instances corresponding to:
- `baDokumenUpload`: Uploads to `verifikasiStore.beritaAcaraDokumen`
- `baLapanganUpload`: Uploads to `verifikasiStore.beritaAcaraLapangan`
- `skCpclUpload`: Uploads to `verifikasiStore.skCpcl`

### `StepSummaryDanSubmit.vue`
Shows a summary block for all three uploaded files:
- `skCpcl`: "Dokumen SK CPCL"
- `beritaAcaraDokumen`: "Berita Acara Verifikasi Dokumen"
- `beritaAcaraLapangan`: "Berita Acara Verifikasi Lapangan"
Each must offer preview actions.
