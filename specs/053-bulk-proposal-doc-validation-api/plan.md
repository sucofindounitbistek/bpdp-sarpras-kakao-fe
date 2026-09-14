# Implementation Plan: Wire Bulk Proposal Document Validations API into usePengusulanStore

**Branch**: `053-bulk-proposal-doc-validation-api` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/053-bulk-proposal-doc-validation-api/spec.md`

## Summary

Add `bulkValidateProposalDocuments` and `fetchProposalDocumentValidations` actions to `usePengusulanStore` in `src/stores/pengusulan.ts`. Wire `StepVerifikasiPekebunDanDokumenProposal.vue` to transmit granular document verification records to backend endpoint `POST /api/proposal-document-validations/bulk` upon submission.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>` SFCs), TypeScript (~6.0.x)

**Primary Dependencies**: Axios client (`src/services/api.ts`), Pinia store (`usePengusulanStore`)

**Storage**: PostgreSQL DB via Backend REST API (`POST /api/proposal-document-validations/bulk`)

**Testing**: Type checking (`vue-tsc -b`), build validation (`vite build`)

**Target Platform**: Web Browser (Desktop & Mobile, 375px+)

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Fast asynchronous HTTP dispatch (<300ms)

**Constraints**: Mobile-first responsive design, strict API DTO envelope handling, strict TypeScript mode

**Scale/Scope**: 1 Pinia store (`src/stores/pengusulan.ts`), 1 component view (`StepVerifikasiPekebunDanDokumenProposal.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Layered Architecture & SFC Discipline**: PASS (Centralized API actions in Pinia store, UI components delegate API execution).
- **Pinia State Management**: PASS (Pinia store `usePengusulanStore` exposes `bulkValidateProposalDocuments`).
- **TypeScript Strictness**: PASS (Strict DTO payload interfaces).
- **Backend Contract Fidelity**: PASS (Matches backend DTO schema in `bpdp-sarpras-kelapa-be/internal/proposal_document_validation/dto.go`).

## Project Structure

### Documentation (this feature)

```text
specs/053-bulk-proposal-doc-validation-api/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 API DTO payload interfaces
├── quickstart.md        # Validation guide
├── contracts/           # Interface and payload definitions
│   └── bulk-validation-api.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/src/
├── stores/
│   └── pengusulan.ts                               # Pinia store for proposal API calls
└── views/dinas/kabupaten/
    └── StepVerifikasiPekebunDanDokumenProposal.vue # Verification step view
```

## Complexity Tracking

> No violations found. All changes strictly observe existing Pinia store and Axios API patterns.
