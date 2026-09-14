# Implementation Plan: Standarisasi UI Setuju / Tolak Approval

**Branch**: `014-setuju-tolak-approval-ui` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-setuju-tolak-approval-ui/spec.md`

## Summary

Standardize the "Setuju" (✓) / "Tolak" (✕) button design and document review card layout across all approval and verification screens. Redesign `ApprovalBpdpView.vue` to match the exact card structure, button states, PDF preview modal, and rejection notes from `ApprovalDitjenbunView.vue` (the reference gold standard). Enhance `VerifikasiDokumenItem.vue` to support text-labeled `Setuju` / `Tolak` button variants.

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.4+ (`<script setup lang="ts">`)  
**Primary Dependencies**: Vue 3, Pinia 2.x, Vue Router 4.x, Lucide Vue Next, Tailwind CSS 3.x  
**Storage**: Client-side state / Pinia store (`src/stores/rekomtek.ts`)  
**Testing**: Manual verification against running app (`npm run dev`) per Constitution Quality Workflow  
**Target Platform**: Web application (Desktop & Mobile, modern browsers)  
**Project Type**: Single web application (`src/`)  
**Performance Goals**: Instant UI button toggle (<100ms), zero layout shift  
**Constraints**: 100% visual parity with `ApprovalDitjenbunView.vue`, mobile-first responsive  
**Scale/Scope**: 2 approval views (`ApprovalBpdpView.vue`, `ApprovalDitjenbunView.vue`), 1 component (`VerifikasiDokumenItem.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Vue 3 Component-Driven)**: SFC setup used throughout. Modal encapsulation via `DocumentPreviewModal.vue`.
- [x] **Principle II (Strict TypeScript & Schema)**: Strict type definitions for props, emits, and state without `any`.
- [x] **Principle III (Pinia State Management)**: State changes persisted via Pinia store actions.
- [x] **Principle IV & X (UI/UX Pro Max & Modern Design)**: Forest Green (`#066C2A`) and Emerald/Rose accents matching design system tokens.
- [x] **Principle V (YAGNI & Simplicity)**: Minimal abstractions, direct reuse of established approval design patterns.
- [x] **Principle VI (Breadcrumb Standard)**: Breadcrumb maintained on header.
- [x] **Principle VII (Mobile-First & Responsive)**: 375px+ responsive layouts, touch-friendly 44px targets.
- [x] **Principle XIV (Compact Information Density)**: Restrained font sizes, standard heights (`h-9`/`h-10`), flush padding.

## Project Structure

### Documentation (this feature)

```text
specs/014-setuju-tolak-approval-ui/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 decisions & rationale
├── data-model.md        # Phase 1 component interfaces & button styling
├── quickstart.md        # Phase 1 quickstart validation scenarios
└── contracts/
    └── ui-contract.md   # Phase 1 UI button & card contract
```

### Source Code (repository root)

```text
src/
├── components/
│   └── rekomtek/
│       └── VerifikasiDokumenItem.vue   # [MODIFY] Add buttonVariant ('text' / 'icon')
├── views/
│   ├── bpdp/
│   │   └── ApprovalBpdpView.vue        # [MODIFY] Redesign to match ApprovalDitjenbunView
│   └── ditjenbun/
│       └── ApprovalDitjenbunView.vue   # [MODIFY] Confirm reference implementation standards
```

**Structure Decision**: Single Vue 3 web application (`src/`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *All principles respected without violations.* | N/A |
