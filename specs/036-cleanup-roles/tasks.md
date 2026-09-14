# Tasks: Role Cleanup - Remove Generic Ditjenbun Pusat & BPDPKS Admin Roles (036-cleanup-roles)

**Input**: Design documents from `/specs/036-cleanup-roles/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/roles-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions & role mapping preparation

- [x] T001 [P] Remove `DITJENBUN` and `BPDPKS` entries from `ROLE_DETAILS_MAP` in `src/types/role.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Auth Store Role Type Cleanup

**⚠️ CRITICAL**: Auth store role type changes affect navigation and role switcher components

- [x] T002 Update `User['role']` union type and `validRoles` array in `src/stores/auth.ts` to exclude `DITJENBUN` and `BPDPKS`

**Checkpoint**: Foundation ready - auth store strictly enforces the 7 active operational roles.

---

## Phase 3: User Story 1 - Remove Obsolete Generic Roles from Role Selection & Auth System (Priority: P1) 🎯 MVP

**Goal**: Remove generic/ambiguous roles ("Ditjenbun Pusat" `DITJENBUN` and "BPDPKS Admin" `BPDPKS`) from the simulation role switcher, navigation composable, and router guards.

**Independent Test**: Open the Role Switcher dropdown in the header and verify exactly 7 clean operational roles are listed without generic Ditjenbun or BPDPKS admin options.

### Implementation for User Story 1

- [x] T003 [US1] Remove `DITJENBUN` and `BPDPKS` options from `roles` array in `src/components/ui/RoleSwitcher.vue`
- [x] T004 [US1] Remove `DITJENBUN` and `BPDPKS` from navigation section `role` arrays in `src/composables/useNavigation.ts`
- [x] T005 [US1] Clean up `meta.roles` definitions in `src/router/index.ts` to replace generic `DITJENBUN`/`BPDPKS` with operational role keys

**Checkpoint**: At this point, User Story 1 is fully functional — generic roles are completely purged from UI and routing.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validation and code quality checks

- [x] T006 [P] Run TypeScript type-check with `npx vue-tsc -b`
- [x] T007 [P] Perform manual quickstart validation scenarios defined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS UI integration.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **Polish (Phase 4)**: Depends on all user stories complete.

### Parallel Opportunities

- `T001` can be developed in parallel with logic setup.
- `T006` and `T007` can be run in parallel during polish phase.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 & Phase 2 (Types & Auth Store).
2. Complete Phase 3 (RoleSwitcher, useNavigation, router).
3. Validate User Story 1.

### Full Delivery
1. Complete Phase 4 (Type safety check with `npx vue-tsc -b`).
