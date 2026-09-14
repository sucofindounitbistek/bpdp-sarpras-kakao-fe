# Implementation Plan: Active Sidebar & Aligned Breadcrumbs

**Branch**: `011-sidebar-active-breadcrumbs` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-sidebar-active-breadcrumbs/spec.md`

## Summary

The goal of this feature is to resolve navigation state discrepancies by ensuring that:
1. The sidebar maintains active highlighting when navigating to sub-sub-menus (e.g. details, creation forms).
2. The breadcrumbs are dynamically generated to match the exact wording of the sidebar items and reflect their section and route hierarchy.

To achieve this cleanly without duplicate logic, we will:
* Introduce a shared navigation composable/store that exposes the sidebar navigation sections.
* Enhance `Sidebar.vue` to check Vue Router's `meta.activeMenu` property when determining the active item.
* Update `Breadcrumb.vue` to dynamically build breadcrumbs using the active route, its `meta.activeMenu`, and `meta.title`, matching them against the sidebar navigation sections.
* Update routes in `src/router/index.ts` to include standard metadata (`activeMenu` and `title`).

## Technical Context

**Language/Version**: Vue 3 (Composition API with TypeScript)

**Primary Dependencies**: Vue Router 4, Tailwind CSS, Lucide Vue Next

**Storage**: N/A

**Testing**: Manual verification against the running dev server (port 5173).

**Target Platform**: Desktop and Mobile Web Browsers

**Project Type**: Vue 3 SPA Frontend

**Performance Goals**: Instant client-side state resolution without rendering lag or CLS.

**Constraints**: Compliant with Constitution principles, specifically Principle VI (Breadcrumb Navigation) and Principle XIV (Information Density).

**Scale/Scope**: ~25 view pages updated to use dynamic breadcrumbs and correct sidebar active states.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **Principle I (Vue 3 & script setup)**: YES - Implementation will be purely SFC with `<script setup>`.
* **Principle II (Strict TS)**: YES - No `any` type will be introduced. Interfaces/Types will be fully defined.
* **Principle V (YAGNI)**: YES - Leveraging native Vue Router meta features instead of third-party breadcrumb modules.
* **Principle VI (Breadcrumb Navigation)**: YES - Updating the standard Breadcrumb component to be fully automatic and aligned with sidebar titles and paths.
* **Principle VII (Mobile-First)**: YES - Sidebar active state and breadcrumb formatting will remain mobile-responsive.

## Project Structure

### Documentation (this feature)

```text
specs/011-sidebar-active-breadcrumbs/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ui/
│       ├── Breadcrumb.vue    # Will be modified to support automatic generation
│       └── Sidebar.vue       # Will be modified to use shared navigation store and activeMenu meta
├── composables/
│   └── useNavigation.ts      # New: shared navigation structure helper
├── router/
│   └── index.ts              # Will be modified to add activeMenu and title metadata
```

**Structure Decision**: Web application layout - Single project structure (`src/`).

## Complexity Tracking

No violations of constitution detected. No custom complexity tracking needed.
