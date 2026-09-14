# Implementation Plan: Global Proposal Status Alignment

**Branch**: `023-global-status-alignment` | **Spec**: [specs/023-global-status-alignment/spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/023-global-status-alignment/spec.md)

## Summary
Centralize proposal status label mappings inside `LOCALIZATION.proposalStatus` in `src/config/localization.ts`. This aligns raw workflow status values to simplified stepper steps globally. Revert the local helper function workarounds in `TrackingPengusulanView.vue` and clean up overrides inside `QueueVerifikasiKabView.vue` to ensure perfect system-wide consistency.

## Constitution Check
- **Principle XV (Localization & Wording Externalization)**: Followed. Moving all labels into `LOCALIZATION`.

## Proposed Changes

### Configurations

#### [MODIFY] [localization.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/config/localization.ts)
- Update `proposalStatus` object mapping draft, submitted, verified, issued, validated, signed, and rejected statuses.

### Views & Queues

#### [MODIFY] [TrackingPengusulanView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/pengusulan/TrackingPengusulanView.vue)
- Remove local `getAlignedStatusLabel` helper function.
- Import global `getStatusLabel` and `PengajuanStatus` from `@/types/pengusulan`.
- Restore template references from `getAlignedStatusLabel` to the standard `getStatusLabel`.

#### [MODIFY] [QueueVerifikasiKabView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/kabupaten/QueueVerifikasiKabView.vue)
- Remove local `getStatusLabel` custom override function.
- Revert template references to use the imported global `getStatusLabel`.

## Verification Plan

### Manual Verification
1. Log in as Pemohon and verify the status column and detail header badge show aligned names.
2. Log in as Dinas Kabupaten and Dinas Provinsi and confirm table queues show aligned statuses.
3. Verify that resetting filters works correctly.
