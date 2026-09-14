# Implementation Plan: Penyambungan Alur Riwayat Status & Catatan Timeline

**Branch**: `015-riwayat-status-timeline-flow` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-riwayat-status-timeline-flow/spec.md`

## Summary

Refactor the vertical timeline track rendering in `LogStatusUsulan.vue` to guarantee a seamless, continuous connected vertical line (`w-0.5 bg-slate-200 dark:bg-slate-700`) linking every status log node to the next item, while automatically hiding the line below the final node to eliminate hanging vertical borders. Add color-coded node indicators for forward progress (`bg-[#066C2A]`) vs return/revision steps (`bg-amber-500` / `bg-rose-500`).

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.4+ (`<script setup lang="ts">`)  
**Primary Dependencies**: Vue 3, Lucide Vue Next, Tailwind CSS 3.x  
**Storage**: Client-side state / Pinia store (`src/stores/rekomtek.ts`)  
**Testing**: Manual verification against running app (`npm run dev`) per Constitution Quality Workflow  
**Target Platform**: Web application (Desktop & Mobile, modern browsers)  
**Project Type**: Single web application (`src/`)  
**Performance Goals**: Instant render, zero cumulative layout shift  
**Constraints**: Fully backward compatible with existing `StatusLog[]` props, WCAG AA contrast  
**Scale/Scope**: 1 component (`LogStatusUsulan.vue`), validated across 5 detail views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Vue 3 Component-Driven)**: Component setup used in `LogStatusUsulan.vue`.
- [x] **Principle II (Strict TypeScript & Schema)**: Strict type safety with `StatusLog` interface.
- [x] **Principle IV & X (UI/UX Pro Max & Modern Design)**: Forest Green (`#066C2A`), Amber, and Emerald color tokens with Dark Mode support.
- [x] **Principle V (YAGNI & Simplicity)**: Minimal CSS flex/absolute layout refactoring.
- [x] **Principle VII (Mobile-First & Responsive)**: Responsive layout with flex items.
- [x] **Principle XIV (Compact Information Density)**: Restrained font sizes (`text-[11px]`, `text-[12px]`), clean spacing.

## Project Structure

### Documentation (this feature)

```text
specs/015-riwayat-status-timeline-flow/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 decisions & rationale
├── data-model.md        # Phase 1 data interfaces & item layout model
├── quickstart.md        # Phase 1 quickstart validation guide
└── contracts/
    └── ui-contract.md   # Phase 1 component contract
```

### Source Code (repository root)

```text
src/
├── components/
│   └── rekomtek/
│       └── LogStatusUsulan.vue   # [MODIFY] Refactor item-level connecting line & node dots
```

**Structure Decision**: Single Vue 3 web application (`src/`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *All principles respected without violations.* | N/A |
