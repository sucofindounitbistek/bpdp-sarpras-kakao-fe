# Phase 0 Research: Show REV_FROM_PROV Status in QueueVerifikasiKabView

## Research Task 1: API Query Parameter Adjustment

- **Decision**: Update `onMounted()` in `QueueVerifikasiKabView.vue`:
  - Call `store.fetchProposals()` without restricting query status exclusively to `SUBMITTED`, OR call `store.fetchProposals()` to load all proposals for the active user role/tenant.
- **Rationale**: Fetching without rigid single-status filter allows Kabupaten verifiers to see all items assigned to Kabupaten tier (`SUBMITTED`, `KAB_SUBMITTED`, `REV_FROM_PROV`, `REV_FROM_KAB`, `REVISION_ADMIN`, `VERIFIED_ADMIN`, `REKOMTEK_KAB_ISSUED`).

## Research Task 2: Status Badge Mapping

- **Decision**: Update `getBadgeVariant(status)` in `QueueVerifikasiKabView.vue`:
  ```typescript
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'KAB_SUBMITTED':
        return 'info';
      case 'REV_FROM_PROV':
      case 'VERIFIED_ADMIN':
      case 'VERIFIED_FIELD':
        return 'warning';
      case 'REKOMTEK_KAB_ISSUED':
      case 'VALIDATED_PROV':
        return 'success';
      case 'REVISION_ADMIN':
      case 'REV_FROM_KAB':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  ```
