# Walkthrough: Storage Area Notes Integration

## Changes Made

- **`StepVerifikasiPekebunDanDokumenProposal.vue`**:
  - Added `storageAreaLabelMap` to resolve storage area verification keys (`gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`) into human-readable Indonesian labels:
    - `gudangAlamat` → `Gudang (Alamat)`
    - `gudangKoordinat` → `Gudang (Koordinat)`
    - `fotoTampakDepan` → `Gudang (Foto Tampak Depan)`
    - `fotoTampakDalam` → `Gudang (Foto Tampak Dalam)`
  - Formatted storage area notes cleanly inside `dokumenNotes` rejection summary payload.
  - Linked textareas to reactive store `useVerifikasiKabDraftStore`.

## Verification

- `tasks.md` updated with all 7 tasks marked `[X]`.
- Build verification via `vue-tsc -b && vite build`.
