# Implementation Plan: Fix RAB Display and Synchronization in Proposal Verification

**Branch**: `058-fix-rab-verifikasi-proposal` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/058-fix-rab-verifikasi-proposal/spec.md`

## Summary

Fix RAB items display issue in `StepVerifikasiPekebunDanDokumenProposal.vue` by updating the reactive watcher to reliably sync `verifikasiStore.rabItems` whenever `pengajuan.value` or active proposal details load, expanding `getProposalDetail()` payload normalization in `src/stores/pengusulan.ts` to accommodate all backend RAB formats, and ensuring `verifikasiKabDraftStore` resets/initializes RAB items on proposal changes.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~6.0.x)

**Primary Dependencies**: Pinia (`verifikasiKabDraft.ts`, `pengusulan.ts`), Lucide Vue icons

**Storage**: PostgreSQL DB via Backend REST API (`GET /api/proposals/:id`)

**Testing**: Type checking (`vue-tsc -b`), Vite build validation (`npm run build`)

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Immediate reactive RAB table update (<1ms after detail payload load)

**Constraints**: Strict TypeScript mode, DTO compatibility across backend variants

**Scale/Scope**: 2 Pinia stores (`src/stores/pengusulan.ts`, `src/stores/verifikasiKabDraft.ts`), 1 verification view (`StepVerifikasiPekebunDanDokumenProposal.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Pinia store normalizes raw DTOs, SFC binds reactively to store state).
- **Pinia State Management**: PASS (Pinia store manages verification draft state and active proposal detail).
- **TypeScript Strictness**: PASS (Strict `RabItem` and `Proposal` interface definitions preserved).

## Project Structure

### Documentation (this feature)

```text
bpdp-sarpras-kelapa-fe/specs/058-fix-rab-verifikasi-proposal/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & mapping
├── quickstart.md        # Validation guide
├── contracts/           # Interface definitions
│   └── rab-sync-contract.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/src/
├── stores/
│   ├── pengusulan.ts                               # Proposal API store
│   └── verifikasiKabDraft.ts                       # Verification draft store
└── views/dinas/kabupaten/
    └── StepVerifikasiPekebunDanDokumenProposal.vue # Verification view component
```

## Complexity Tracking

> No violations found. Fixes RAB items sync condition in verification view and store normalization logic.
