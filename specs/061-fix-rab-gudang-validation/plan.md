# Implementation Plan: Fix RAB and Gudang Validation Display in Regency Verification

**Branch**: `061-fix-rab-gudang-validation` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `bpdp-sarpras-kelapa-fe/specs/061-fix-rab-gudang-validation/spec.md`

## Summary

On the Regency Verification view (`/dinas/verifikasi/kabupaten/22`), the Gudang (Storage Area) and RAB validation cards were failing to display because `StepVerifikasiPekebunDanDokumenProposal.vue` used overly restrictive rendering guards (`v-if="isPupukPaket"` with strict string comparison and `v-if="getDokumen('RAB_RK')"` requiring an explicit uploaded file).

We fix this by updating `isPupukPaket` to perform package string normalization across all payload aliases, introducing `hasStorageArea` (which checks both package type and presence of `storage_area` / `gudangSerahTerima` object data), and updating RAB visibility to display whenever RAB items or budget verification is active.

---

## Technical Context

**Language/Version**: TypeScript strict mode (`vue-tsc`), Vue 3 Composition API (`<script setup>`)

**Primary Dependencies**: Vue 3 (`^3.5.x`), Pinia (`^4.0.x`), Lucide Vue Next, Tailwind CSS

**Storage**: Reactive Pinia store (`verifikasiKabDraftStore`, `pengusulanStore`)

**Testing**: `vue-tsc -b` type checking, `vite build` production bundle compilation, manual quickstart verification

**Target Platform**: Desktop & Mobile Web Browsers

**Project Type**: Frontend Web Application (`bpdp-sarpras-kelapa-fe`)

**Performance Goals**: Instant rendering (<50ms) without CLS or missing validation cards

**Constraints**: WCAG AA contrast, zero native browser alerts (`alert()`, `confirm()`)

**Scale/Scope**: `StepVerifikasiPekebunDanDokumenProposal.vue` and `verifikasiKabDraftStore.ts`

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Rule I & III (Component SFC & Single Source of Truth)**: Vue 3 `<script setup>` with Pinia store state. -> PASS
- **Rule III (Design & Accessibility Standards)**: Tailwind CSS utility classes and WCAG AA contrast. -> PASS
- **Rule IV (API Envelope & Data Normalization)**: Payload properties mapped flexibly across `storage_area` / `gudangSerahTerima` and `rabItems`. -> PASS
- **Rule VI (Quality Assurance & Type Check)**: Must pass `vue-tsc -b` and `vite build` cleanly. -> PASS

---

## Project Structure

### Documentation (this feature)

```text
bpdp-sarpras-kelapa-fe/specs/061-fix-rab-gudang-validation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ui-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
bpdp-sarpras-kelapa-fe/
└── src/
    ├── stores/
    │   └── verifikasiKabDraft.ts                       # Pinia draft store holding verification items and RAB items
    └── views/
        └── dinas/
            └── kabupaten/
                └── StepVerifikasiPekebunDanDokumenProposal.vue # Step 1 verification view displaying RAB & Gudang cards
```

**Structure Decision**: Single project frontend module (`bpdp-sarpras-kelapa-fe`).

---

## Design Artifacts Summary

1. **[Research](./research.md)**: Root cause analysis of `isPupukPaket` and `getDokumen('RAB_RK')` guards.
2. **[Data Model](./data-model.md)**: Definitions of `hasStorageArea`, normalized `isPupukPaket`, and `hasRabContent`.
3. **[UI Contract](./contracts/ui-contract.md)**: Component DOM rendering structure and validation key contracts.
4. **[Quickstart Guide](./quickstart.md)**: Manual verification scenarios for proposal #22.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| *None* | Follows clean Vue 3 Composition API standards. | N/A |
