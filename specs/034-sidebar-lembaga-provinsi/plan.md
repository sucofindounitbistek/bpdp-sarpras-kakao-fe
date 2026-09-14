# Implementation Plan: Provincial Dinas Institutional Account Sidebar & List View (034-sidebar-lembaga-provinsi)

**Branch**: `034-sidebar-lembaga-provinsi` | **Date**: 2026-08-14 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/034-sidebar-lembaga-provinsi/spec.md`

## Summary

This feature adds a new **"Lembaga"** sidebar navigation item for the Provincial Dinas (`DINAS_PROV`) role pointing to route `/dinas/provinsi/lembaga` (`LembagaProvinsiView.vue`). The page renders a comprehensive, searchable data table displaying registered farmer organization accounts (Kelompok Tani / Gapoktan / Koperasi / Kelembagaan Pekebun) with district filtering, status badges, and detail modal inspection.

## Technical Context

**Language/Version**: Vue 3 (Composition API `<script setup>`), TypeScript (Strict Mode)  
**Primary Dependencies**: Vue Router, Lucide Vue Next (`Building2`, `Search`, `Eye`, `Users`, `MapPin`, etc.)  
**Storage**: Mock Pinia store / local reactive state (`LembagaAccount[]`)  
**Testing**: Manual runtime verification & strict type-checking (`vue-tsc -b`)  
**Target Platform**: Responsive Web (Mobile to Desktop)  
**Project Type**: Vue 3 Frontend Single-Page Application  
**Scale/Scope**: 4 files modified/created (`useNavigation.ts`, `router/index.ts`, `localization.ts`, `LembagaProvinsiView.vue`)  

## Constitution Check

- [x] **Principle I (Vue 3 SFC & Component Architecture)**: View component uses `<script setup>`.
- [x] **Principle II (Strict TypeScript)**: Explicit interfaces for `LembagaAccount`.
- [x] **Principle IV & X (UI/UX Pro Max Standards)**: Curated color palette, badges, responsive table.
- [x] **Principle XV (Mandatory Wording Externalization)**: Externalized wording in `src/config/localization.ts`.

## Proposed Changes

### Navigation Layer
#### [MODIFY] [`useNavigation.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/composables/useNavigation.ts)
Add `{ label: 'Lembaga', to: '/dinas/provinsi/lembaga', icon: Building2 }` under `DINAS_PROV` section.

### Router Layer
#### [MODIFY] [`router/index.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/router/index.ts)
Register route `/dinas/provinsi/lembaga` mapping to `@/views/dinas/provinsi/LembagaProvinsiView.vue`.

### Configuration Layer
#### [MODIFY] [`localization.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/config/localization.ts)
Add `lembagaProvinsi` section under `LOCALIZATION` with Indonesian wording for titles, table headers, search placeholders, and detail modals.

### View Layer
#### [NEW] [`LembagaProvinsiView.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/dinas/provinsi/LembagaProvinsiView.vue)
Create view displaying:
- Header stats summary (Total Lembaga, Total Anggota Pekebun, Total Luas Lahan, Akun Aktif).
- Search input and district dropdown filter.
- Institutional accounts data table.
- Account Detail Modal.

## Verification Plan

### Automated Tests
- Type checking: `npx vue-tsc -b`

### Manual Verification
1. Log in / switch role to `DINAS_PROV`.
2. Verify "Lembaga" menu item appears in the sidebar under "DINAS PROVINSI".
3. Click "Lembaga" and confirm navigation to `/dinas/provinsi/lembaga`.
4. Test real-time search filtering and district filter.
5. Click "Detail" on a row to open detail modal.
