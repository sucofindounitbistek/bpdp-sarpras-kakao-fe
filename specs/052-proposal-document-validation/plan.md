# Implementation Plan: Proposal Document Validation in StepVerifikasiPekebunDanDokumenProposal

**Branch**: `052-proposal-document-validation` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/052-proposal-document-validation/spec.md`

## Summary

Integrate validation logic into `validateAndProceed()` in `StepVerifikasiPekebunDanDokumenProposal.vue` to check that all mandatory proposal documents (`wajib = true`) are uploaded and approved (`APPROVED`) before allowing step navigation. Ensure unverified or missing mandatory documents trigger toast errors and block navigation, while maintaining non-empty rejection notes enforcement.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~6.0.x)

**Primary Dependencies**: Vue Router, Pinia, Lucide Icons, Toast composable (`useToast`)

**Storage**: Pinia state store (`useVerifikasiKabDraftStore`), persisted to `localStorage`

**Testing**: Type checking (`vue-tsc -b`), build validation (`vite build`)

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Instant client-side validation (<5ms)

**Constraints**: Mobile-first responsive design, zero native browser dialogs, strict TypeScript mode

**Scale/Scope**: 1 component view (`StepVerifikasiPekebunDanDokumenProposal.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Vue 3 `<script setup>` SFC).
- **Pinia State Management**: PASS (Reads verification status via `useVerifikasiKabDraftStore`).
- **TypeScript Strictness**: PASS (Strict boolean checks and interface compliance).
- **UI/UX & Toast Notifications**: PASS (Uses `useToast()` for user error feedback).

## Project Structure

### Documentation (this feature)

```text
specs/052-proposal-document-validation/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 validation rules & data model
├── quickstart.md        # Validation guide
├── contracts/           # Interface and payload definitions
│   └── document-validation.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/src/
└── views/dinas/kabupaten/
    └── StepVerifikasiPekebunDanDokumenProposal.vue # Proposal verification step view
```

## Complexity Tracking

> No violations found. All changes strictly follow existing Vue 3 and Pinia patterns.
