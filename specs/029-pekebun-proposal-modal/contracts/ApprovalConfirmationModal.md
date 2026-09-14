# Component Contract: ApprovalConfirmationModal (Updated)

**Feature**: 029-pekebun-proposal-modal
**Date**: 2026-08-10

## Interface

```typescript
// Props
interface ApprovalConfirmationModalProps {
  isOpen: boolean;
  actionType: 'approve' | 'reject' | 'submit';
  destinationStage: string;
  notes?: string;
}

// Emits
interface ApprovalConfirmationModalEmits {
  (e: 'close'): void;
  (e: 'confirm'): void;
}
```

## Usage Contract

```vue
<!-- Parent View (StepPilihPekebunLahan.vue) -->
<ApprovalConfirmationModal
  ref="confirmModalRef"
  :is-open="showConfirmModal"
  :action-type="confirmActionType"
  :destination-stage="confirmDestination"
  :notes="confirmNotes"
  @close="showConfirmModal = false"
  @confirm="executePendingAction"
/>
```

## Behavior Contract

| Scenario | Expected Behavior |
|----------|-------------------|
| Modal opens with `actionType='submit'` | `isOpen=true` → modal shows overlay, title resolves to `LOCALIZATION.confirmationModal.submitTitle`, description displays `LOCALIZATION.confirmationModal.submitDescription` followed by the destination box (`destinationStage`). |
| User clicks "Batal" | Emit `close`, modal closes, no side effects. |
| User clicks "Konfirmasi" (or "Ya, Kirim") | Emit `confirm`, confirm button becomes disabled and shows a loading spinner. |
| Double-click confirmation | Confirm button is disabled after first click to prevent duplicate submission emits. |
| Confirmation success | Parent closes modal (`isOpen=false`), resets state, displays toast success, and redirects. |
| Confirmation error | Parent keeps modal open (`isOpen=true`), calls component `.setError(message)` to show the alert message box inside the modal, and resets loading spinner. |

## Styling Contract

- Confirm button for `submit`: variant `primary` (matches forest green `#066C2A`).
- Confirm button for `approve`: variant `primary` (matches forest green `#066C2A`).
- Confirm button for `reject`: variant `danger` (matches rose-600).
- Cancel button: variant `outline`.
- Typography and alignment follow compact design standards.
