# Implementation Plan: Modul Penyaluran Dashboard Mockup

**Branch**: `[002-modul-penyaluran]` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-modul-penyaluran/spec.md`

## Summary

Implement a multi-role mockup dashboard view and dynamic sidebar using client-simulated states. Switch active views (Kelembagaan Pekebun, Dinas Kab/Kota, Dinas Provinsi, Dirjenbun, BPDPKS) via a global top-header role selector dropdown. Create a dedicated User Management view for BPDPKS with role descriptions.

## Technical Context

**Language/Version**: TypeScript 5.7, Vue 3.5

**Primary Dependencies**: Vue Router 4.5, Pinia 3.0, Tailwind CSS 3.4, Lucide Vue Next, pinia-plugin-persistedstate

**Storage**: pinia-plugin-persistedstate (localStorage)

**Testing**: Vitest + Vue Test Utils

**Target Platform**: Responsive Web browsers (Mobile-first)

**Project Type**: Single web application frontend mockup

**Performance Goals**: Route transitions <200ms, responsive layouts

**Constraints**: Forest Green (`#066C2A`) WCAG AA compliance, client-simulated mockups (Principle XIII)

**Scale/Scope**: 5 dynamic roles, 1 unified dashboard view, 1 administration layout

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Vue 3 setup)**: YES. Using SFC `<script setup>` with dynamic composition.
- **Principle III (Pinia Store)**: YES. `authStore` encapsulates the active simulated role.
- **Principle IV (Modern UI/UX)**: YES. Forest Green paired with slate neutrals, smooth transitions.
- **Principle VI (Breadcrumbs)**: YES. Breadcrumbs configured for all views.
- **Principle VII (Mobile-first)**: YES. Mobile header handles overlay transitions; views adapt with Tailwind responsive grids.
- **Principle XIII (Mockup Contract)**: YES. Feature built as static mockup backed by mock store, logged in `plan.md`.

## Project Structure

### Documentation (this feature)

```text
specs/002-modul-penyaluran/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data models
├── quickstart.md        # Phase 1 validation scenarios
├── contracts/           # Phase 1 contract definition
│   └── ui-state.md      # UI state mapping structure
└── checklists/          # Specification checklist
    └── requirements.md  # Checklist status file
```

### Source Code (repository root)

We will modify or create the following source files:

```text
src/
├── App.vue                         # Add Desktop Top Header + Role Switcher
├── router/
│   └── index.ts                    # Register /bpdpks/user-management route
├── components/
│   └── ui/
│       └── Sidebar.vue             # Make sidebar navigation reactive to authStore.user.role
├── views/
│   ├── DashboardView.vue           # Refactor to load dashboard layouts by role
│   └── bpdpks/
│       └── UserManagementView.vue  # Create new BPDP User Management view
```

**Structure Decision**: Single project layout matching Vue 3 SFC guidelines. No new backend folders or components directories are introduced.
