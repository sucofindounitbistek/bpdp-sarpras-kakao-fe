# Implementation Plan: Verification Queue Filters

**Branch**: `021-queue-filters` | **Date**: 2026-08-06 | **Spec**: [specs/021-queue-filters/spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/021-queue-filters/spec.md)

## Summary
Add a consistent, reusable queue filter panel to all 4 verification antrean views (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, BPDPKS). The panel lets users filter by Search query (proposal number or cooperative name), Status (global list of all proposal statuses), and Jenis Sarpras (all 17 categories). Filter execution is handled entirely client-side using Vue 3 reactivity.

## Technical Context

**Language/Version**: Vue 3, TypeScript, Tailwind CSS
**Primary Dependencies**: lucide-vue-next, pinia, vue-router
**Testing**: Manual routing & filter behavior verification. Production compile check.
**Target Platform**: Responsive Web (Mobile-First)

## Constitution Check

*GATE: Must pass before implementation.*

- **Principle I (Vue 3 Component Architecture)**: Followed. We will create a reusable `QueueFilter.vue` component.
- **Principle X (Typography & Design System)**: Followed. High-contrast colors conforming to WCAG AA, strict medium/semibold weights.
- **Principle VII (Mobile-First)**: Followed. Desktop layout is horizontal flex; mobile stacks vertically without layout shift.
- **Principle XV (Localization)**: Followed. All filter labels, status list titles, and sarpras categories are dynamically retrieved from `LOCALIZATION`.

## Proposed Changes

### UI Components

#### [NEW] [QueueFilter.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/components/ui/QueueFilter.vue)
Create a reusable filter component.
- Accepts props/v-model bindings:
  - `search`: string
  - `status`: string
  - `jenisSarpras`: string
- Features:
  - Search input with Lucide Search icon.
  - Status select dropdown (mapping of global localized status keys).
  - Jenis Sarpras select dropdown (mapping of localized categories).
  - Reset button shown only when any filter is active.

### Views & Queues

#### [MODIFY] [QueueVerifikasiKabView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/kabupaten/QueueVerifikasiKabView.vue)
- Import `QueueFilter.vue` and declare reactive filter state.
- Implement computed `filteredItems` to filter list based on search, status, and jenis sarpras.
- Render `<QueueFilter />` at the top of the table.

#### [MODIFY] [QueueVerifikasiProvinsiView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue)
- Import `QueueFilter.vue` and declare filter state.
- Modify computed `queueItems` to also apply search, status, and jenis sarpras filters.
- Render `<QueueFilter />` at the top of the table.

#### [MODIFY] [AntreanRekomtekView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/ditjenbun/AntreanRekomtekView.vue)
- Import `QueueFilter.vue` and replace current search query input element.
- Update `filteredUsulans` computed logic to apply search, status, and jenis sarpras filters.

#### [MODIFY] [AntreanBpdpView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/bpdp/AntreanBpdpView.vue)
- Import `QueueFilter.vue` and replace current search query input element.
- Update `filteredUsulans` computed logic to apply search, status, and jenis sarpras filters.

## Verification Plan

### Manual Verification
1. Open the local web app and switch to various verifier roles.
2. Verify search inputs refine listed proposal numbers or names.
3. Test combinations of status and jenis sarpras filters.
4. Verify resetting filters displays the complete list instantly.
5. Check mobile responsive layout collapse on 375px viewport.
