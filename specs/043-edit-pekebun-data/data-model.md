# Data Model & Interfaces: Edit Data Pekebun

## Data Mapping during Edit Mode

When a registered pekebun or draft is loaded via `route.params.id` or `route.query.draftId`, the retrieved objects are mapped to form ref states in `FormPekebunView.vue`:

### Identitas data mapping (`identitasData` ref)
- `nik` ← `pekebun.nik`
- `nama` ← `pekebun.nama`
- `nomorKK` ← `pekebun.nomorKK`
- `statusPernikahan` ← `pekebun.statusPernikahan`
- `tempatLahir` ← `pekebun.tempatLahir`
- `tanggalLahir` ← `pekebun.tanggalLahir`
- `alamat` ← `pekebun.alamat`
- `kodepos` ← `pekebun.kodepos`
- `nomorHP` ← `pekebun.nomorHP`

### Dokumen data mapping (`dokumenData` ref)
- `scanKTP` ← `dokumen` of type `SCAN_KTP`
- `scanKK` ← `dokumen` of type `SCAN_KK`
- `swafoto` ← `dokumen` of type `SWAFOTO`
- `suratKuasa` ← `dokumen` of type `SURAT_KUASA`

### Lahan data mapping (`lahanDataList` ref)
- Array of `LahanFormData` constructed from the fetched `lahanList`.
- Prepopulates fields like `jenisLegalitas`, `nomorLegalitas`, `luasLahan`, boundaries, and coordinates polygon.
