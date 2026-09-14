# Implementation Plan: Role Cleanup - Remove Generic Ditjenbun Pusat & BPDPKS Admin Roles (036-cleanup-roles)

**Branch**: `036-cleanup-roles` | **Date**: 2026-08-14 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/036-cleanup-roles/spec.md`

## Summary

This feature removes generic/ambiguous user roles ("Ditjenbun Pusat" `DITJENBUN` and "BPDPKS Admin" `BPDPKS`) across system types, role details maps, auth store defaults, navigation composables, router guards, and the simulation role switcher dropdown component. Exactly 7 clear operational roles are retained.

## Technical Context

**Language/Version**: Vue 3 (Composition API `<script setup>`), TypeScript (Strict Mode)  
**Primary Dependencies**: Vue Router, Pinia (`auth.ts`)  
**Testing**: Manual runtime verification & strict type-checking (`vue-tsc -b`)  
**Target Platform**: Responsive Web (Mobile to Desktop)  
**Project Type**: Vue 3 Frontend Single-Page Application  
**Scale/Scope**: 5 files modified (`role.ts`, `auth.ts`, `useNavigation.ts`, `router/index.ts`, `RoleSwitcher.vue`)  

## Constitution Check

- [x] **Principle I (Vue 3 SFC & Component Architecture)**: View/UI components use `<script setup>`.
- [x] **Principle II (Strict TypeScript)**: Remove obsolete keys from union types and `validRoles` array.
- [x] **Principle IV (UI/UX Pro Max)**: Clean, un-cluttered Role Switcher UX.

## Proposed Changes

### Data & Type Definitions Layer
#### [MODIFY] [`role.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/types/role.ts)
Remove `DITJENBUN` and `BPDPKS` entries from `ROLE_DETAILS_MAP`.

#### [MODIFY] [`auth.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/stores/auth.ts)
Remove `DITJENBUN` and `BPDPKS` from `User['role']` union type and `validRoles` array.

### Navigation & Routing Layer
#### [MODIFY] [`useNavigation.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/composables/useNavigation.ts)
Clean up `role` arrays in navigation sections (remove `DITJENBUN` and `BPDPKS`).

#### [MODIFY] [`index.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/router/index.ts)
Clean up `meta.roles` arrays across route definitions (remove `DITJENBUN` and `BPDPKS`).

### UI Component Layer
#### [MODIFY] [`RoleSwitcher.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/components/ui/RoleSwitcher.vue)
Remove `DITJENBUN` and `BPDPKS` options from `roles` array.

## Verification Plan

### Automated Tests
- Type checking: `npx vue-tsc -b`

### Manual Verification
1. Expand Role Switcher in header.
2. Verify only 7 clean operational roles are visible.
