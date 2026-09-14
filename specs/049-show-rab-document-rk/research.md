# Research & Decisions: Show RAB Document using RAB_RK

## Retrieving RAB Document

### Decision
Change the source of the displayed proposal RAB document from the custom `pengajuan.rabDitandatangani` field to the standard `RAB_RK` document within the `dokumen` array of the proposal.

### Rationale
- **Format Standardization**: Keeps all proposal files under the uniform `DokumenPersyaratan` array structure.
- **Redundancy Clean-up**: Prevents double references to different properties for the same logical document.

### Alternatives Considered
- Keep both properties and fall back to `rabDitandatangani` if `RAB_RK` is missing: rejected since `RAB_RK` is the canonical identifier for the Rencana Kerja upload.
