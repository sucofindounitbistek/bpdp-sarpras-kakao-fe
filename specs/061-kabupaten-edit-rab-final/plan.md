# Implementation Plan: Create FINAL Flag RAB on Edit RAB at Dinas Kabupaten

**Branch**: `061-kabupaten-edit-rab-final` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/061-kabupaten-edit-rab-final/spec.md`

## Summary

When RAB is edited in Dinas Kabupaten verification (`StepVerifikasiPekebunDanDokumenProposal.vue` and `verifikasiKabDraft`), issue API request to create/upsert RAB object linked to the proposal with `flag: 'FINAL'`, leaving original `flag: 'PROPOSAL'` intact.

## Technical Context

**Language/Version**: Vue 3 (`<script setup>`), TypeScript (~5.7.x)

**Primary Dependencies**: Pinia (`usePengusulanStore`, `useVerifikasiKabDraftStore`), `rabService`

**Storage**: PostgreSQL DB via Backend REST API (`POST /api/proposals/:id/rabs` or `/api/rabs` with `flag: 'FINAL'`)

**Testing**: Type checking (`npx vue-tsc -b`), Vitest (`npm test`)

**Target Platform**: Web Browser

**Project Type**: Single-page web application frontend (`bpdp-sarpras-kelapa-fe`)

## Project Structure

```text
specs/061-kabupaten-edit-rab-final/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & mapping
├── quickstart.md        # Validation guide
├── contracts/           # Interface definitions
│   └── final-rab-contract.md
└── checklists/
    └── requirements.md  # Quality checklist
```
