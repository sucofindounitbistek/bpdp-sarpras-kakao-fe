# Feature Specification: Dynamic Verification Action Button for Rejection & Revision (Revisi Button Verifikasi)

**Feature Branch**: `035-revisi-button-verifikasi`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "kalo misalnya ada validasi file yang ditolak, tombol next stepnya ganti revisi kembali jadi ketika ada approval setuju dan tidak dan ada salah satunya yang ditolak maka buttonnya bukan lanjut ke step selanjutnya tapi revisi saya nemu kasusnya di kabupaten dan provinsi karena itu merupakan tahap verifikasi, jika verifikasi ditolak maka stepnya belum lanjut"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic Action Button Toggle on Verification Rejections (Priority: P1)

As a Verification Officer (Dinas Kabupaten / Dinas Provinsi), when verifying proposal documents and land credentials during the multi-step verification process, I want the main action button at the bottom of the page to automatically switch from "Lanjut / Submit" to "Kembalikan Untuk Revisi" (Return for Revision) whenever one or more items/documents are rejected ("Tolak"), so that I cannot accidentally advance a proposal with rejected items to the next stage.

**Why this priority**: Core workflow integrity requirement — prevents proposals containing rejected verification items from advancing to subsequent approval stages.

**Independent Test**: Can be tested independently by navigating to a proposal verification detail page (e.g. `/dinas/verifikasi/kabupaten/:id` or `/dinas/verifikasi/provinsi/:id`), marking at least one document or item as "Tolak" (REJECTED), and observing that the primary bottom action button dynamically transforms to "Kembalikan Untuk Revisi" (with rose/amber styling).

**Acceptance Scenarios**:

1. **Given** a verification officer is reviewing a proposal in Dinas Kabupaten or Dinas Provinsi verification views, **When** all verified items/documents are approved ("Setuju" / `APPROVED`), **Then** the primary action button displays the forward navigation text (e.g. "Lanjut Ke Step Selanjutnya" or "Kirim Hasil Verifikasi").
2. **Given** a verification officer marks at least ONE document or item as rejected ("Tolak" / `REJECTED`), **When** the reactive state updates, **Then** the primary action button dynamically changes its text to "Kembalikan Untuk Revisi" (Return for Revision) with a warning/rejection visual style (rose/red or amber button variant).
3. **Given** the button is in "Kembalikan Untuk Revisi" state, **When** the officer clicks it, **Then** the system opens the `ApprovalConfirmationModal` in rejection/revision mode (`actionType: 'reject'`), requiring notes before sending the proposal back to Pemohon for revision.
4. **Given** the officer changes the rejected item back to "Setuju" or unverified, **When** zero items remain rejected, **Then** the button automatically reverts to the forward navigation state ("Lanjut / Submit").

---

### User Story 2 - Prevent Multi-Step Navigation Advance on Rejection (Priority: P2)

As a Verification Officer, if any verification item within a multi-step verification form is rejected, clicking the action button must not increment the active step counter or forward the proposal to the next stage until revisions are resolved.

**Why this priority**: Enforces business logic boundaries across multi-step verification workflows.

**Independent Test**: On a multi-step verification view with 1 rejected document item, click the action button, confirm rejection modal, and verify the proposal status updates to "Perlu Revisi" instead of moving to Step 2/3.

**Acceptance Scenarios**:

1. **Given** 1 or more items are marked `REJECTED`, **When** the officer completes the revision confirmation modal, **Then** the proposal status transitions to `REVISION_ADMIN` / `Perlu Revisi` and the verification process halts for that proposal.

---

### Edge Cases

- **Mixed Approval & Rejection**: What if 5 documents are approved and 1 document is rejected? The single rejection MUST take precedence, turning the main button to "Kembalikan Untuk Revisi".
- **Unverified Items**: What if items are still unverified (neither Setuju nor Tolak)? The button remains in forward/asistensi state, but submitting prompts validation to complete verification or auto-triggers revision if rejections exist.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute a reactive boolean flag `hasRejectedItems` in verification step components (e.g. `StepVerifikasiPekebunDanDokumenProposal.vue`, `DetailVerifikasiKabView.vue`, `DetailVerifikasiProvinsiView.vue`).
- **FR-002**: System MUST dynamically toggle the primary action button text, icon, and button variant based on `hasRejectedItems`:
  - When `hasRejectedItems === true`: Label = "Kembalikan Untuk Revisi", Variant = `destructive` / rose styling, Icon = `RotateCcw` / `XCircle`.
  - When `hasRejectedItems === false`: Label = "Lanjut Ke Step Selanjutnya" / "Kirim Verifikasi", Variant = `primary` (Forest Green `#066C2A`), Icon = `ArrowRight` / `CheckCircle`.
- **FR-003**: System MUST open `ApprovalConfirmationModal` with `actionType = 'reject'` when clicking "Kembalikan Untuk Revisi".
- **FR-004**: All button labels, modal descriptions, and toast notifications MUST be externalized into `src/config/localization.ts`.

### Key Entities *(include if feature involves data)*

- **VerificationItem**: Document or property verification state (`id`, `status: 'APPROVED' | 'REJECTED' | 'PENDING'`, `notes`).
- **Proposal Status**: State transitions to `REVISION_ADMIN` (`Perlu Perbaikan` / `Perlu Revisi`) upon submitting rejection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of verification views dynamically change the primary action button label to "Kembalikan Untuk Revisi" within 50ms of any document rejection.
- **SC-002**: 0 proposals with rejected verification items can be forwarded to subsequent stages.
- **SC-003**: Passing strict TypeScript type check (`npx vue-tsc -b`) with zero errors.

## Assumptions

- Affected views: `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`, `src/views/dinas/kabupaten/DetailVerifikasiKabView.vue`, `src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue`.
- Confirmation modal `ApprovalConfirmationModal.vue` supports `actionType: 'reject'` and `actionType: 'approve'` / `'submit'`.
