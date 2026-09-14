# Implementation Plan: Align Proposal Status List with Detail Steps

**Branch**: `022-align-proposal-status` | **Spec**: [specs/022-align-proposal-status/spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/022-align-proposal-status/spec.md)

## Summary
Align the status badge text displayed in the Pekebun proposal list (and the detail view header badge) with the primary active stage labels shown in the workflow stepper. This prevents user confusion where list status says one thing (e.g. "Diajukan") but detail stepper highlights another step (e.g. "Verifikasi Dinas Kab/Kota").

## Proposed Changes

### Views

#### [MODIFY] [TrackingPengusulanView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/pengusulan/TrackingPengusulanView.vue)
- Implement `getAlignedStatusLabel(status: string): string` inside `<script setup>` mapping status strings to stepper step labels.
- Replace instances of `getStatusLabel(item.currentStatus)` with `getAlignedStatusLabel(item.currentStatus)` inside the proposal list status badge and the detail header status badge.

## Verification Plan

### Manual Verification
1. Open proposal tracking view as Pemohon/Lembaga Pekebun.
2. Confirm status column shows aligned stage labels matching stepper (e.g. "Verifikasi Dinas Kab/Kota" instead of "Diajukan").
3. Click "Lihat Detail" and check detail header badge displays identical text.
