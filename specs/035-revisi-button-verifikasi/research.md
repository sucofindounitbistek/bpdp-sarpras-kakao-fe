# Research: Dynamic Verification Action Button for Rejection & Revision (035-revisi-button-verifikasi)

## Problem Statement & Context
During proposal verification in Dinas Kabupaten/Kota and Dinas Provinsi views, officers review documents and land credentials item by item, marking them as "Setuju" (`APPROVED`) or "Tolak" (`REJECTED`). Currently, when an item is marked as rejected, a secondary "Revisi Kembali" button appears alongside the primary "Lanjut / Submit" button. This allows officers to accidentally click "Lanjut ke Step Selanjutnya" even when rejected items exist.

The requirement is that **if any single file/item is marked as rejected (`REJECTED`)**, the primary action button at the bottom of the page MUST dynamically transform into **"Kembalikan Untuk Revisi"** (Return for Revision) with a warning/rejection style (`bg-rose-600` / `destructive`), preventing accidental step advancement and directly invoking the revision confirmation modal.

## Technical Decisions & Rationale

### 1. Reactive Rejection Detection (`hasRejectedItems`)
- **Decision**: Define computed property `hasRejectedItems` in verification components (`StepVerifikasiPekebunDanDokumenProposal.vue`, `StepDataCPCL.vue`, `DetailVerifikasiProvinsiView.vue`, etc.) checking if any verification key holds `status === 'REJECTED'`.
- **Rationale**: Vue's fine-grained reactivity ensures instant UI updates (<50ms) whenever an officer clicks "Tolak" on any document or credential.

### 2. Single Dynamic Primary Button Transformation
- **Decision**: Replace separate dual buttons with a single dynamic primary action button at the bottom right of the page:
  - **When `hasRejectedItems === true`**:
    - Text: `LOCALIZATION.verification.returnForRevision` ("Kembalikan Untuk Revisi")
    - Class: `bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20`
    - Icon: `RotateCcw` / `XCircle`
    - Click Handler: `submitRejection()`
  - **When `hasRejectedItems === false`**:
    - Text: Forward step text ("Simpan & Lanjut ke SK CPCL" / "Kirim Verifikasi")
    - Class: `bg-[#066C2A] hover:bg-emerald-800 text-white`
    - Icon: `ArrowRight`
    - Click Handler: `validateAndProceed()`
- **Rationale**: Prevents human error by guaranteeing that a proposal with rejected items CANNOT be advanced to the next step.

### 3. Confirmation Modal Integration
- **Decision**: When `submitRejection()` is invoked, open `ApprovalConfirmationModal` in `actionType: 'reject'` mode to collect notes and transition proposal status to `REVISION_ADMIN` ("Perlu Revisi").
- **Rationale**: Reuses established modal workflow while strictly enforcing rejection notes validation.

### 4. Mandatory Wording Externalization
- **Decision**: Add `returnForRevision` and related keys to `LOCALIZATION.verification` in `src/config/localization.ts`.
- **Rationale**: Complies with Constitution Principle XV.

## Alternatives Considered
- **Disabling the Next Step button without changing its label**: Rejected because disabling a button without indicating the alternative action leaves users confused about how to return the proposal for revision.
