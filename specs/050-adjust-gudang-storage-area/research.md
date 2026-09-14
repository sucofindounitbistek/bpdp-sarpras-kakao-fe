# Research: Storage Area API Response Alignment

## Decision

Introduce a shared mapping helper `mapStorageArea` inside `src/stores/pengusulan.ts` to convert backend `storage_area` API payloads into the frontend representation for both `storage_area` and `gudangSerahTerima` fields.

## Rationale

- Avoids modifying multiple UI views (Dinas Kabupaten detail, Dinas Provinsi detail, proposal preview modal, summary screens) by aligning the data model directly at the store ingestion level.
- Keeps frontend properties (`alamat`, `koordinat`, `fotoTampakDepan`, `fotoTampakDalam`) consistent with backend fields (`address`, `coordinate`, `exterior_photo_file_url`/`exterior_photo_file_id`, `interior_photo_file_url`/`interior_photo_file_id`).
- Creates valid `DokumenUpload` objects on-the-fly from photo URLs so that existing file previewers (`openPreview`) function correctly.

## Alternatives Considered

- **Alternative 1: Update each Vue component template to reference `storage_area` properties directly.**
  - *Rejected because*: Violates DRY (Don't Repeat Yourself) principle. Requires changing 5+ files and handling complicated fallbacks in layout markup instead of keeping UI views presentation-driven.
