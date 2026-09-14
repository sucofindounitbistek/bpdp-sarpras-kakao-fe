# Implementation Plan: Show Proposals with REV_FROM_PROV Status in QueueVerifikasiKabView

**Branch**: `057-show-rev-from-prov-in-kab-queue` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/057-show-rev-from-prov-in-kab-queue/spec.md`

## Summary

Update `QueueVerifikasiKabView.vue` to fetch and render proposals with status `REV_FROM_PROV` (and `REV_FROM_KAB`/`REVISION_ADMIN`/`KAB_SUBMITTED`). Update `getBadgeVariant()` to map `REV_FROM_PROV` to warning badge style.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~6.0.x)

**Primary Dependencies**: Vue Router, Pinia (`usePengusulanStore`), Tailwind CSS

**Storage**: PostgreSQL DB via Backend REST API (`GET /api/proposals`)

**Testing**: Type checking (`vue-tsc -b`), build validation (`vite build`)

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Fast queue rendering (<100ms)

**Constraints**: Strict TypeScript mode, DTO compatibility

**Scale/Scope**: 1 queue view (`QueueVerifikasiKabView.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Pinia store handles API calls, SFC view handles filtering and presentation).
- **Pinia State Management**: PASS (`fetchProposals()` updates Pinia state).
- **TypeScript Strictness**: PASS (Strict enum and status type handling).

## Project Structure

### Documentation (this feature)

```text
specs/057-show-rev-from-prov-in-kab-queue/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & mapping
├── quickstart.md        # Validation guide
├── contracts/           # Interface definitions
│   └── queue-kab-status.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/src/
└── views/dinas/kabupaten/
    └── QueueVerifikasiKabView.vue # Kabupaten verification queue view
```

## Complexity Tracking

> No violations found. Fixes status filter in Kabupaten queue.
