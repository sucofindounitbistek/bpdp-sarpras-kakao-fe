# Implementation Plan: Fix Proposal Detail Documents Mapping in Stores & Verification Views

**Branch**: `055-fix-proposal-detail-documents-mapping` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/055-fix-proposal-detail-documents-mapping/spec.md`

## Summary

Fix `dokumen` array mapping in `getProposalDetail()` in `src/stores/pengusulan.ts` to ensure `dokumen` is attached to `mapped`, `activePengajuan`, and updated inside `listPengajuan`. Enhance `getDokumen(persyaratanId)` in `StepVerifikasiPekebunDanDokumenProposal.vue` to check both `dokumen` and `documents` arrays with alias fallback.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~6.0.x)

**Primary Dependencies**: Pinia (`usePengusulanStore`), Vue Router

**Storage**: PostgreSQL DB via Backend REST API (`GET /api/proposals/:id`)

**Testing**: Type checking (`vue-tsc -b`), build validation (`vite build`)

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Instant client-side document lookup (<1ms)

**Constraints**: Strict TypeScript mode, DTO compatibility

**Scale/Scope**: 1 Pinia store (`src/stores/pengusulan.ts`), 1 verification view (`StepVerifikasiPekebunDanDokumenProposal.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Centralized DTO mapping in Pinia store, template consumes mapped entities).
- **Pinia State Management**: PASS (`getProposalDetail()` updates Pinia state).
- **TypeScript Strictness**: PASS (Strict DTO payload types).

## Project Structure

### Documentation (this feature)

```text
specs/055-fix-proposal-detail-documents-mapping/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & mapping
├── quickstart.md        # Validation guide
├── contracts/           # Interface definitions
│   └── documents-mapping.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/src/
├── stores/
│   └── pengusulan.ts                               # Pinia store for proposal API calls
└── views/dinas/kabupaten/
    └── StepVerifikasiPekebunDanDokumenProposal.vue # Verification view component
```

## Complexity Tracking

> No violations found. Fixes data mapping gap in Pinia store.
