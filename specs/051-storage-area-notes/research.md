# Phase 0 Research: Storage Area Notes Integration

## Research Task 1: Reactive State Storage for Storage Area Verification

- **Decision**: Store storage area verification items (`gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`) in `verifikasiStore.verifications` using `getVerification(key)` and `setVerificationStatus(key, status)`.
- **Rationale**: `useVerifikasiKabDraftStore` already provides `getVerification(key)` which initializes `{ status: 'PENDING', notes: '' }` reactively and persists state via `pinia-plugin-persistedstate`.
- **Alternatives Considered**: Creating a standalone `gudangNotes` string ref — rejected because using `verifications` keeps storage area checks uniform with other document verification items.

## Research Task 2: Rejection Summary Formatting & Human-Readable Labels

- **Decision**: Map storage area keys (`gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`) to human-readable Indonesian labels in `dokumenNotes` rejection summary computation:
  - `gudangAlamat` → `Gudang (Alamat)`
  - `gudangKoordinat` → `Gudang (Koordinat)`
  - `fotoTampakDepan` → `Gudang (Foto Tampak Depan)`
  - `fotoTampakDalam` → `Gudang (Foto Tampak Dalam)`
- **Rationale**: Prevents raw camelCase keys from being exposed in user-facing rejection summaries or proposal revision notes.
- **Alternatives Considered**: Raw key fallback — rejected because raw key strings like `gudangAlamat: Catatan` violate UI clarity standards.
