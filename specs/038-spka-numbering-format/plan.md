# Implementation Plan: SPKA Numbering Format

**Branch**: `038-spka-numbering-format` | **Date**: 14 Agustus 2026 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/038-spka-numbering-format/spec.md`

## Summary

Mengimplementasikan format penomoran standar proposal pengajuan Sarpras `SPKA` + `[Kode Paket 1-9]` + `[Bulan MM]` + `[Tahun YY]` + `[Nomor Urut Monthly 0001-9999]`. Urutan penomoran 4 digit otomatis direset ke `0001` setiap awal bulan kalender baru.

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3 (Composition API `<script setup>`)

**Primary Dependencies**: Pinia store (`rekomtek.ts`), Lucide Vue Next, Vue Router

**Storage**: Local reactive Pinia state with persisted store hydration

**Testing**: `npm run build` / TypeScript type checking

**Target Platform**: Web application (Desktop & Mobile Browser)

**Project Type**: Single web application

**Performance Goals**: Instant automatic number generation (< 50ms) upon proposal creation

**Constraints**: Strict compliance with 9 Sarpras package codes (1-9) and 4-digit monthly sequence reset

**Scale/Scope**: Applied across proposal creation, tracking views, details, and PDF export

## Constitution Check

*GATE: Passed. All design artifacts maintain system compatibility and follow project coding standards.*

- [x] No breaking architecture changes
- [x] Complete type safety in TypeScript
- [x] Technology-agnostic business logic in helper utility

## Project Structure

### Documentation (this feature)

```text
specs/038-spka-numbering-format/
├── plan.md              # Implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data structures and package mappings
├── quickstart.md        # Phase 1 verification scenarios
└── contracts/           # Phase 1 contract specifications
    └── spka-numbering-api.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── spkaNumbering.ts # Helper utility for SPKA number formatting and package code mapping
├── stores/
│   └── rekomtek.ts      # Update usulan creation logic to utilize SPKA numbering format
└── views/
    └── pengusulan/
        └── FormPengusulanView.vue # Proposal form integrated with SPKA numbering
```

**Structure Decision**: Single project architecture using helper utility module in `src/lib/` and Pinia store integration.
