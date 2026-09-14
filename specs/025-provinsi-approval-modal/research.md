# Research: provinsi-approval-modal

## Decisions

### 1. Reusing the Existing ApprovalConfirmationModal Component
- **Decision**: Integrate `ApprovalConfirmationModal` from `@/components/approval/ApprovalConfirmationModal.vue` directly into the target verification steps:
  - Dinas Provinsi: `StepSummaryDanSubmit.vue` (for submitting to Ditjenbun)
  - Dinas Provinsi: `StepDataCPCL.vue` (for rejecting SK CPCL and returning to Dinas Kabupaten)
  - Dinas Kabupaten: `StepSummaryDanSubmit.vue` (for submitting to Dinas Provinsi)
- **Rationale**: The component is already used in 5 other pages, supports full localization from `LOCALIZATION.confirmationModal`, and provides uniform animations and status loaders.
- **Alternatives Considered**: 
  - Creating a separate modal wrapper inside the views (rejected because it duplicates UI/UX code and violates Core Principle V: YAGNI/Simplicity).

### 2. Localization Keys
- **Decision**: Reuse the existing keys inside `LOCALIZATION.confirmationModal` in `src/config/localization.ts` since they perfectly cover persetujuan (approve) and pengembalian (reject) flows.
- **Rationale**: Adheres strictly to Principle XV (Mandatory Localization & Wording Externalization Standard).
- **Alternatives Considered**: Hardcoding Indonesian alert messages (rejected because it directly violates the constitution).

## References

- [ApprovalConfirmationModal.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kakao-fe/src/components/approval/ApprovalConfirmationModal.vue)
- [localization.ts](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kakao-fe/src/config/localization.ts)
