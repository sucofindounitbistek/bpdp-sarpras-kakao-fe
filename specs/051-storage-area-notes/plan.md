# Implementation Plan: Integrate Storage Area Notes into StepVerifikasiPekebunDanDokumenProposal

**Branch**: `051-storage-area-notes` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/051-storage-area-notes/spec.md`

## Summary

Integrate storage area (Gudang Serah Terima) verification notes and rejection reason mapping into `StepVerifikasiPekebunDanDokumenProposal.vue` and `useVerifikasiKabDraftStore`. This ensures verifier feedback on storage address, coordinates, exterior photo, interior photo, or general storage area notes are cleanly captured, stored reactively, and formatted in the rejection summary payload.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~6.0.x)

**Primary Dependencies**: Vue Router, Pinia (`pinia-plugin-persistedstate`), Tailwind CSS, Lucide Icons

**Storage**: Pinia state store (`useVerifikasiKabDraftStore`), persisted to `localStorage`

**Testing**: `vue-tsc -b` type checking, manual component verification

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Instant UI reactivity (<16ms), smooth store hydration without CLS

**Constraints**: Mobile-first responsive design, zero native browser dialogs, strict TypeScript mode

**Scale/Scope**: 1 component view (`StepVerifikasiPekebunDanDokumenProposal.vue`), 1 Pinia store (`verifikasiKabDraft.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Vue 3 `<script setup>` SFC in `src/views/dinas/kabupaten/`).
- **Pinia State Management**: PASS (Pinia store `useVerifikasiKabDraftStore` handles reactive state).
- **TypeScript Strictness**: PASS (Strict interfaces and type-safe verification state keys).
- **UI/UX & Accessibility**: PASS (Tailwind CSS, mobile-first, no `alert()` popups).
- **Localization Standard**: PASS (Uses externalized text and labels).

## Project Structure

### Documentation (this feature)

```text
specs/051-storage-area-notes/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & state structure
├── quickstart.md        # Validation guide
├── contracts/           # Interface and payload definitions
│   └── verification-notes.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/src/
├── stores/
│   └── verifikasiKabDraft.ts                       # Pinia store handling verification draft
└── views/dinas/kabupaten/
    └── StepVerifikasiPekebunDanDokumenProposal.vue # Verification step view component
```

## Complexity Tracking

> No violations found. All changes strictly follow existing Pinia and Vue 3 architectural patterns.
