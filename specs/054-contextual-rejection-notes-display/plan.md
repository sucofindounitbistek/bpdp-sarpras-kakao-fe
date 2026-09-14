# Implementation Plan: Contextual Rejection Notes Display across Pekebun and Proposal Pages

**Branch**: `054-contextual-rejection-notes-display` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/054-contextual-rejection-notes-display/spec.md`

## Summary

Enhance Pekebun views (`PekebunListView.vue`, `VerifikasiPekebunDetailView.vue`, `StepDataCPCL.vue`, `PratinjauPekebunDanDokumenTab.vue`) and Proposal Document views (`StepUploadDokumen.vue`, `TrackingPengusulanDetailView.vue`, `PratinjauPekebunDanDokumenProposal.vue`) to parse and display contextual rejection banners next to rejected farmer items and proposal documents.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~6.0.x)

**Primary Dependencies**: Vue Router, Pinia (`verifikasiKabDraft.ts`), Tailwind CSS, Lucide Icons

**Storage**: Pinia state store & proposal `catatanDinas` status metadata

**Testing**: Type checking (`vue-tsc -b`), build validation (`vite build`)

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Instant client-side rejection filtering (<5ms)

**Constraints**: Mobile-first responsive design, WCAG AA contrast, strict TypeScript mode

**Scale/Scope**: 4 Pekebun views/components, 3 Proposal views/components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Vue 3 `<script setup>` SFC presentation components).
- **Pinia State Management**: PASS (Reads rejection notes reactively from Pinia store).
- **TypeScript Strictness**: PASS (Strict interfaces for rejection note mapping).
- **UI/UX & Design System**: PASS (Tailwind CSS, warning alert banners, WCAG AA contrast).

## Project Structure

### Documentation (this feature)

```text
specs/054-contextual-rejection-notes-display/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & interfaces
├── quickstart.md        # Validation guide
├── contracts/           # Interface and payload definitions
│   └── contextual-rejections.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/src/
├── views/
│   ├── dinas/kabupaten/
│   │   ├── VerifikasiPekebunDetailView.vue
│   │   └── StepVerifikasiPekebunDanDokumenProposal.vue
│   ├── pengusulan/
│   │   ├── StepDataCPCL.vue
│   │   ├── StepUploadDokumen.vue
│   │   └── TrackingPengusulanDetailView.vue
│   └── pemohon/
│       └── RevisiProposalView.vue
```

## Complexity Tracking

> No violations found. All changes strictly follow existing Vue 3 component patterns.
