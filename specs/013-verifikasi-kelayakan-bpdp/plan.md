# Implementation Plan: Verifikasi Kelayakan BPDP

**Branch**: `013-verifikasi-kelayakan-bpdp` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-verifikasi-kelayakan-bpdp/spec.md`

## Summary

Redesign the BPDP document validation interface (`CekiBpdpView.vue`) to match the Ditjenbun verification pattern (`CekiDitjenbunView.vue`), featuring granular per-document Sesuai (✓) / Tidak Sesuai (✗) controls, conditional note textareas, conditional document download buttons, and support for returning invalid usulan to Ketua Ditjenbun (`APPROVAL_DITJENBUN`). Introduce a reusable presentational SFC `VerifikasiDokumenItem.vue` and refactor both BPDP and Ditjenbun views to consume it.

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.4+ (`<script setup lang="ts">`)  
**Primary Dependencies**: Vue 3, Pinia 2.x, Vue Router 4.x, Lucide Vue Next, Tailwind CSS 3.x  
**Storage**: Client-side state / Pinia store (`src/stores/rekomtek.ts`)  
**Testing**: Manual verification against running app (`npm run dev`) per Constitution Quality Workflow  
**Target Platform**: Web application (Desktop & Mobile, modern browsers)  
**Project Type**: Single web application (`src/`)  
**Performance Goals**: Auto-save <1s, document review completion <3 minutes per usulan  
**Constraints**: Mobile-first responsive (375px+), no horizontal overflow, WCAG AA contrast, Toast notifications  
**Scale/Scope**: 2 views (`CekiBpdpView.vue`, `CekiDitjenbunView.vue`), 1 new component (`VerifikasiDokumenItem.vue`), 1 store update (`rekomtek.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Vue 3 Component-Driven)**: Reusable SFC `VerifikasiDokumenItem.vue` created for presentation. Logic encapsulated in Pinia store.
- [x] **Principle II (Strict TypeScript & Schema)**: Explicit interfaces defined for `BpdpDocValidation`, `BpdpChecklistState`, component props, and emits. No `any`.
- [x] **Principle III (Pinia State Management)**: Document state and actions managed exclusively in `useRekomtekStore`.
- [x] **Principle IV & X (UI/UX Pro Max & Modern Design)**: `#066C2A` primary branding, WCAG AA contrast, smooth transitions, Lucide icons.
- [x] **Principle V (YAGNI & Simplicity)**: Minimal modular component abstraction. Reuses existing modal (`FormPengembalianModal.vue`) and toast notifications.
- [x] **Principle VI (Breadcrumb Standard)**: Existing Breadcrumb component maintained at top of view.
- [x] **Principle VII (Mobile-First & Responsive)**: Flex/grid layout starting from 375px, responsive breakpoint classes (`lg:col-span-2`), 44px+ touch targets.
- [x] **Principle XI (Vue Toaster Standard)**: `useToast()` used exclusively for user feedback (no native `alert`/`confirm`).
- [x] **Principle XIV (Compact Information Density)**: Standard input heights (`h-9`/`h-10`), restrained typography (`text-xs`, `text-[13px]`), flush header alignment.

## Project Structure

### Documentation (this feature)

```text
specs/013-verifikasi-kelayakan-bpdp/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 decisions & rationale
├── data-model.md        # Phase 1 data models & state rules
├── quickstart.md        # Phase 1 validation scenarios guide
└── contracts/
    └── ui-contract.md   # Phase 1 store & component interface contracts
```

### Source Code (repository root)

```text
src/
├── components/
│   └── rekomtek/
│       ├── VerifikasiDokumenItem.vue   # [NEW] Reusable per-document validation SFC
│       ├── ChecklistDokumen.vue        # [EXISTING] Retained for other simple checklist uses
│       ├── FormPengembalianModal.vue   # [EXISTING] Used for return to Ditjenbun
│       └── LogStatusUsulan.vue         # [EXISTING] Used for usulan log timeline
├── stores/
│   └── rekomtek.ts                     # [MODIFY] Update bpdpChecklist state & actions
├── types/
│   └── rekomtek.ts                     # [MODIFY] Add BpdpDocValidation & BpdpChecklistState types
└── views/
    ├── bpdp/
    │   └── CekiBpdpView.vue            # [MODIFY] Redesign BPDP validation view
    └── ditjenbun/
        └── CekiDitjenbunView.vue       # [MODIFY] Refactor to use VerifikasiDokumenItem
```

**Structure Decision**: Single Vue 3 web application (`src/`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *All principles respected without violations.* | N/A |
