# Implementation Plan: provinsi-approval-modal

**Branch**: `025-provinsi-approval-modal` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/025-provinsi-approval-modal/spec.md`

## Summary
The goal is to integrate `ApprovalConfirmationModal` into both Dinas Provinsi and Dinas Kabupaten views to protect critical submit and reject transitions with confirmation overlays, adhering to UI patterns already implemented in BPDP and Ditjenbun views.

---

## Technical Context

**Language/Version**: Vue 3 (Composition API, `<script setup>`), TypeScript
**Primary Dependencies**: Tailwind CSS, Lucide Icons, Pinia
**Storage**: Transient draft states managed in Pinia stores (`verifikasiProvinsiDraft` & `verifikasiKabDraft`)
**Testing**: Checked manually using local server run (`npm run dev`) and production compilation check (`npm run build`)
**Target Platform**: Web browsers
**Project Type**: Web Frontend Application
**Performance Goals**: Instant modal opening/render (under 50ms)
**Constraints**: None

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Vue 3 SFCs)**: ✅ Passes. Modal integration uses Vue 3 Composition API SFCs.
- **Principle IV (Modern UI/UX)**: ✅ Passes. Modal uses tailwind transition overlays.
- **Principle XI (No Native browser dialogs)**: ✅ Passes. The modal completely replaces any potential native prompt usage.
- **Principle XIV (Compact Information Density)**: ✅ Passes. Modal dimensions are constrained to normal sizing.
- **Principle XV (Mandatory Wording Externalization)**: ✅ Passes. Confirmation labels, title, and buttons are loaded directly from `LOCALIZATION.confirmationModal`.

---

## Project Structure

### Documentation (this feature)

```text
specs/025-provinsi-approval-modal/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Decisions and Rationale
├── data-model.md        # Data model documentation
└── quickstart.md        # End-to-end validation scenarios
```

### Proposed Source Code Changes

```text
src/
└── views/
    └── dinas/
        ├── kabupaten/
        │   └── StepSummaryDanSubmit.vue        # [MODIFY] Add submission confirmation modal
        └── provinsi/
            ├── StepDataCPCL.vue                # [MODIFY] Add CPCL rejection confirmation modal
            └── StepSummaryDanSubmit.vue        # [MODIFY] Add submission confirmation modal
```

---

## Proposed Changes

### Dinas Kabupaten (Step 4)

#### [MODIFY] [StepSummaryDanSubmit.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kakao-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue)
- Import `ApprovalConfirmationModal` from `@/components/approval/ApprovalConfirmationModal.vue`.
- Define ref states:
  - `showConfirmModal = ref(false)`
  - `confirmActionType = ref<'approve' | 'reject'>('approve')`
  - `confirmDestination = ref('')`
  - `confirmNotes = ref('')`
  - `pendingConfirmAction = ref<(() => void) | null>(null)`
- Update `handleAjukanKeProvinsi()`:
  - Change to open `ApprovalConfirmationModal` first.
  - Set `confirmActionType = 'approve'`, `confirmDestination = 'Dinas Provinsi'`, `confirmNotes = ''`.
  - Wrap the actual state updates and routing inside a `pendingConfirmAction` callback.
- Add `<ApprovalConfirmationModal ... />` at the bottom of the template.

---

### Dinas Provinsi (Step 3)

#### [MODIFY] [StepDataCPCL.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kakao-fe/src/views/dinas/provinsi/StepDataCPCL.vue)
- Import `ApprovalConfirmationModal` from `@/components/approval/ApprovalConfirmationModal.vue`.
- Define ref states:
  - `showConfirmModal = ref(false)`
  - `confirmActionType = ref<'approve' | 'reject'>('reject')`
  - `confirmDestination = ref('')`
  - `confirmNotes = ref('')`
  - `pendingConfirmAction = ref<(() => void) | null>(null)`
- Update `submitRejection()`:
  - Instead of immediately dispatching rejection, open the modal.
  - Set `confirmActionType = 'reject'`, `confirmDestination = 'Dinas Kabupaten/Kota (Revisi)'`, and `confirmNotes` to the entered notes.
  - Wrap the submission updates in the `pendingConfirmAction` callback.
- Add `<ApprovalConfirmationModal ... />` at the bottom of the template.

---

### Dinas Provinsi (Step 4)

#### [MODIFY] [StepSummaryDanSubmit.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kakao-fe/src/views/dinas/provinsi/StepSummaryDanSubmit.vue)
- Import `ApprovalConfirmationModal` from `@/components/approval/ApprovalConfirmationModal.vue`.
- Define ref states:
  - `showConfirmModal = ref(false)`
  - `confirmActionType = ref<'approve' | 'reject'>('approve')`
  - `confirmDestination = ref('')`
  - `confirmNotes = ref('')`
  - `pendingConfirmAction = ref<(() => void) | null>(null)`
- Update `handleAjukanKeDitjenbun()`:
  - Set `confirmActionType = 'approve'`, `confirmDestination = 'Ditjenbun'`, `confirmNotes = ''`.
  - Wrap submission updates inside `pendingConfirmAction` callback and open the confirmation modal.
- Add `<ApprovalConfirmationModal ... />` at the bottom of the template.

---

## Verification Plan

### Manual Verification
- Run the dev server (`npm run dev`) and follow the validation scenarios detailed in [quickstart.md](./quickstart.md) to test the confirm modal behavior on both Dinas Kabupaten and Dinas Provinsi flows.
