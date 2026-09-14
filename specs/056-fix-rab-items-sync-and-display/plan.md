# Implementation Plan: Fix RAB Items Synchronization and Display in Verification Views

**Branch**: `056-fix-rab-items-sync-and-display` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/056-fix-rab-items-sync-and-display/spec.md`

## Summary

Update RAB sync watcher in `StepVerifikasiPekebunDanDokumenProposal.vue` to unconditionally sync `verifikasiStore.rabItems` when proposal `rabItems` is available. Enhance `getProposalDetail()` in `src/stores/pengusulan.ts` to support all backend RAB structures (`item.rabs`, `item.rab_items`, `item.rabItems`).

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~6.0.x)

**Primary Dependencies**: Pinia (`verifikasiKabDraft.ts`, `pengusulan.ts`)

**Storage**: PostgreSQL DB via Backend REST API (`GET /api/proposals/:id`)

**Testing**: Type checking (`vue-tsc -b`), build validation (`vite build`)

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Immediate reactive RAB table update (<1ms)

**Constraints**: Strict TypeScript mode, DTO compatibility

**Scale/Scope**: 1 Pinia store (`src/stores/pengusulan.ts`), 1 verification view (`StepVerifikasiPekebunDanDokumenProposal.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Pinia store handles API parsing, verification view binds reactively).
- **Pinia State Management**: PASS (Pinia store `verifikasiStore.rabItems` synced from proposal state).
- **TypeScript Strictness**: PASS (Strict `RabItem` interface).

## Project Structure

### Documentation (this feature)

```text
specs/056-fix-rab-items-sync-and-display/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & mapping
├── quickstart.md        # Validation guide
├── contracts/           # Interface definitions
│   └── rab-sync.md
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

> No violations found. Fixes RAB items sync condition in verification view and store.
