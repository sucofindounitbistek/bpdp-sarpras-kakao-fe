# Implementation Plan: Proposal Status Update to REV_FROM_KAB on Rejection at Dinas Kabupaten

**Branch**: `060-kabupaten-rejection-status-rev-from-kab` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/060-kabupaten-rejection-status-rev-from-kab/spec.md`

## Summary

Standardize proposal rejection/return actions at Dinas Kabupaten level (`StepVerifikasiPekebunDanDokumenProposal.vue` and `DetailVerifikasiKabView.vue`) so that rejecting a proposal updates its status to `REV_FROM_KAB` (Revisi dari Kabupaten) instead of `REVISION_ADMIN`. Update associated status badge mapping and API store calls to maintain full status alignment.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~5.7.x)

**Primary Dependencies**: Vue Router, Pinia (`usePengusulanStore`), Tailwind CSS

**Storage**: PostgreSQL DB via Backend REST API (`PUT /api/proposals/:id` and status update endpoints)

**Testing**: Type checking (`npx vue-tsc -b`), Vitest (`npm test`)

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Instant UI response on rejection submission (<100ms)

**Constraints**: Strict TypeScript mode, DTO compatibility (`PengajuanStatus.REV_FROM_KAB`)

**Scale/Scope**: 2 views/components (`StepVerifikasiPekebunDanDokumenProposal.vue`, `DetailVerifikasiKabView.vue`) and store status mappings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Pinia store handles API requests, SFC views dispatch status updates).
- **Pinia State Management**: PASS (`updateStatus()` in `pengusulan` store handles state mutation).
- **TypeScript Strictness**: PASS (Uses strong typing with `PengajuanStatus` enum).

## Project Structure

### Documentation (this feature)

```text
specs/060-kabupaten-rejection-status-rev-from-kab/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & mapping
├── quickstart.md        # Validation guide
├── contracts/           # Interface definitions
│   └── rejection-status-contract.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/src/
├── types/
│   └── pengusulan.ts                      # PengajuanStatus enum definitions
├── stores/
│   └── pengusulan.ts                      # Proposal store & updateStatus
└── views/dinas/kabupaten/
    ├── StepVerifikasiPekebunDanDokumenProposal.vue # Kabupaten step 1 verification
    └── DetailVerifikasiKabView.vue       # Kabupaten proposal detail view
```

## Complexity Tracking

> No violations found. Standardizes proposal status transition on Kabupaten rejection to `REV_FROM_KAB`.
