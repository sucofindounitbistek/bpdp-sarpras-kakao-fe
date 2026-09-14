# Research: Queue Kabupaten Backend Integration

## 1. Technical Decisions

### Decision: API Integration via Pinia Store
- **Chosen**: Call `store.fetchProposals({ status: 'SUBMITTED' })` during component `onMounted`.
- **Rationale**: Reuses the established service layer pattern (`proposalService.getList` called via `fetchProposals` inside `usePengusulanStore`), minimizing redundant axios logic in the view and preserving state centralization.
- **Alternatives considered**: Direct `proposalService.getList` invocation within the view. Rejected because it bypasses Pinia store hydration, violating Principle III.

### Decision: Skeleton Loader during Async Fetching
- **Chosen**: Set `pageLoading = true` before the API call, and `pageLoading = false` in `finally` block of the mount handler.
- **Rationale**: Guarantees the skeleton loading animation (`Skeleton.vue`) matches the real duration of the network request, satisfying Principle XII.
- **Alternatives considered**: Static timeout. Rejected because it is a mockup construct, not representing real loading states.

### Decision: Localization Externalization Alignment
- **Chosen**: Replace hardcoded UI text in `QueueVerifikasiKabView.vue` with `LOCALIZATION.dinasKabAntrean` fields.
- **Rationale**: Strict compliance with Principle XV (Mandatory Wording Externalization Standard) to keep templates purely presentation-driven.
- **Alternatives considered**: Leave as is. Rejected as it violates codebase principles.
