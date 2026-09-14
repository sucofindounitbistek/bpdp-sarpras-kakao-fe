# Research: Pekebun Proposal Confirmation Modal

## Decisions

### 1. Extending ApprovalConfirmationModal to support 'submit' actionType
- **Decision**: Extend `actionType` from `'approve' | 'reject'` to `'approve' | 'reject' | 'submit'` and add the corresponding button styles, variants, and colors.
- **Rationale**: Reuses the existing robust modal framework rather than duplicating modal markup or creating a separate component. The `'submit'` action will map to a primary forest green button variant (`'primary'`).
- **Alternatives Considered**: 
  - Creating a separate `SubmitConfirmationModal.vue` component. Rejected because it duplicates 95% of layout, states, error handling, and backdrop overlays, violating Core Principle V (YAGNI/Simplicity).

### 2. Localization Externalization
- **Decision**: Define three new localization properties under `LOCALIZATION.confirmationModal`:
  - `submitTitle`: `'Konfirmasi Pengajuan'`
  - `submitDescription`: `'Anda akan mengirimkan proposal ini ke:'`
  - `confirmSubmit`: `'Ya, Kirim'`
- **Rationale**: Adheres strictly to Principle XV (Wording Externalization) and prevents hardcoded strings inside templates.
- **Alternatives Considered**: 
  - Reusing `approveTitle`, `approveDescription`, and `confirmApprove` for the proposal submit. Rejected because "Ya, Setujui" (Yes, Approve) does not align with the context of a farmer submitting a new proposal to a verifier.

### 3. Submission Interception inside StepPilihPekebunLahan.vue
- **Decision**: Modify the `handleSubmit` click handler in `StepPilihPekebunLahan.vue` to set confirmation state variables:
  - `confirmActionType.value = 'submit'`
  - `confirmDestination.value = 'Dinas Kabupaten/Kota'`
  - `showConfirmModal.value = true`
  Once the user confirms in the modal, it runs `executePendingAction` which triggers the store action `store.submitProposal()`, displays toaster messages, and navigates back to the proposal list.
- **Rationale**: Keeps the view reactive, prevents double-submits, and handles network or verification errors gracefully via toast notifications.

## References

- [ApprovalConfirmationModal.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/components/approval/ApprovalConfirmationModal.vue)
- [StepPilihPekebunLahan.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/pengusulan/StepPilihPekebunLahan.vue)
- [localization.ts](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/config/localization.ts)
