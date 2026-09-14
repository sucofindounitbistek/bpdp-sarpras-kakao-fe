# Implementation Plan: fix-back-button-and-filters

**Branch**: `026-fix-back-button-and-filters` | **Date**: 2026-08-07 | **Spec**: [spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/026-fix-back-button-and-filters/spec.md)

## Summary

Fix the "Kembali" button on Dinas Kabupaten's Step 2 (SK CPCL step) which causes the page to render blank because it sets `currentStep` to an invalid value (2). Also, deduplicate status options in the status filter dropdown by mapping options dynamically, supporting custom options in `QueueFilter.vue` (for Rekomtek and BPDP queues which have different statuses), and updating comparison logic to map status codes to labels.

## Technical Context

**Language/Version**: TypeScript 5, Vue 3 (`<script setup>`)

**Primary Dependencies**: Vue 3, Pinia, Tailwind CSS, Lucide icons

**Storage**: Pinia stores (`verifikasiKabDraft`, `verifikasiProvinsiDraft`) with persistence

**Testing**: Standard TypeScript compilation and manual verification

**Target Platform**: Responsive Web Browsers

**Project Type**: Frontend Web Application

**Performance Goals**: Instant client-side state transitions (< 50ms) and table filtering response (< 100ms)

**Constraints**: WCAG AA accessible contrast, responsive layout, YAGNI simplicity, Wording Externalization Standard

**Scale/Scope**: 5 views (Dinas Kab/Prov queues, Pemohon tracking, Ditjenbun/BPDP Rekomtek antrean)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Vue 3 SFCs**: Yes, all components modified are standard Vue 3 `<script setup>` SFCs.
- **Pinia State**: Yes, current step state is managed strictly through Pinia store `useVerifikasiKabDraftStore`.
- **YAGNI**: Yes, the implementation is the simplest fix for navigation and filters without extra library dependencies.
- **Tailwind & UI/UX**: Yes, layout and styling maintain original Tailwind and compact visual design.
- **Wording Externalization**: Yes, all new status filters and labels will be defined through central configuration files.

## Project Structure

### Documentation (this feature)

```text
specs/026-fix-back-button-and-filters/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ui/
│       └── QueueFilter.vue        # Filter component
├── views/
│   ├── dinas/
│   │   ├── kabupaten/
│   │   │   ├── StepDataCPCL.vue           # Back button fix
│   │   │   └── QueueVerifikasiKabView.vue # Queue list and filter
│   │   └── provinsi/
│   │       └── QueueVerifikasiProvinsiView.vue # Queue list and filter
│   ├── pengusulan/
│   │   └── TrackingPengusulanView.vue     # Tracking filters
│   ├── ditjenbun/
│   │   └── AntreanRekomtekView.vue        # Ditjenbun Rekomtek filters
│   └── bpdp/
│       └── AntreanBpdpView.vue            # BPDP Rekomtek filters
```

**Structure Decision**: Monolith Frontend Web app. Modifying existing SFC views and shared filter component.
Complexity tracking is not needed as there are no constitution violations.
