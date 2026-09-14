# Feature Specification: Role Cleanup - Remove Generic Ditjenbun Pusat & BPDPKS Admin Roles (036-cleanup-roles)

**Feature Branch**: `036-cleanup-roles`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Role User role Ditjenbun Pusat dan BPDPKS Admin tolong diapus aja ges, meminimalisir yang rancu rancu"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Obsolete Generic Roles from Role Selection & Auth System (Priority: P1)

As a System User / Administrator, when selecting roles or switching active user roles in the application, I want generic/ambiguous roles ("Ditjenbun Pusat" `DITJENBUN` and "BPDPKS Admin" `BPDPKS`) to be completely removed from the system role options, so that users can only select precise operational roles (`DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, `BPDP_APPROVAL`, `PEMOHON`, `DINAS_KAB`, `DINAS_PROV`).

**Why this priority**: Eliminates user confusion and role duplication between generic roles and specific operational verificator/approver roles.

**Independent Test**: Can be tested by opening the Role Switcher modal in the header and inspecting the available role cards. Neither "Ditjenbun Pusat" (`DITJENBUN`) nor "BPDPKS Admin" (`BPDPKS`) should appear.

**Acceptance Scenarios**:

1. **Given** a user opens the Role Switcher component in DesktopHeader, **When** reviewing the available role cards, **Then** only the 7 operational roles are rendered (`PEMOHON`, `DINAS_KAB`, `DINAS_PROV`, `DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, `BPDP_APPROVAL`).
2. **Given** the Auth Store (`useAuthStore`), **When** setting active roles or accessing role dropdowns, **Then** `DITJENBUN` and `BPDPKS` are no longer valid options or defaults.
3. **Given** navigation composables (`useNavigation.ts`) and router meta guards, **When** mapping role permissions, **Then** routes previously accepting `DITJENBUN` or `BPDPKS` now map strictly to `DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, or `BPDP_APPROVAL`.
4. **Given** a TypeScript build command (`npx vue-tsc -b`), **When** compiling the application, **Then** 0 type errors exist related to removed role keys.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove `DITJENBUN` and `BPDPKS` keys from `ROLE_DETAILS_MAP` in `src/types/role.ts`.
- **FR-002**: System MUST remove `DITJENBUN` and `BPDPKS` from `RoleType` / `UserRole` type definitions in `src/types/auth.ts` or related type files.
- **FR-003**: System MUST update `src/stores/auth.ts` to remove `DITJENBUN` and `BPDPKS` from available role lists and reset any default active role fallback to a valid operational role (e.g. `PEMOHON` or `DITJENBUN_VERIFIKATOR`).
- **FR-004**: System MUST update navigation items in `src/composables/useNavigation.ts` to assign any `DITJENBUN` / `BPDPKS` scoped items to their specific counterparts (`DITJENBUN_VERIFIKATOR` / `DITJENBUN_APPROVAL` / `BPDP_VERIFIKATOR` / `BPDP_APPROVAL`).
- **FR-005**: System MUST update router meta role definitions in `src/router/index.ts`.

### Key Entities

- **UserRole / RoleType**: Enum or union of active operational roles: `'PEMOHON' | 'DINAS_KAB' | 'DINAS_PROV' | 'DITJENBUN_VERIFIKATOR' | 'DITJENBUN_APPROVAL' | 'BPDP_VERIFIKATOR' | 'BPDP_APPROVAL'`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 occurrences of `DITJENBUN` (generic) or `BPDPKS` (generic) in Role Switcher UI.
- **SC-002**: 100% of role selection dropdowns display exactly 7 clean operational roles.
- **SC-003**: Passing strict TypeScript type check (`npx vue-tsc -b`) with zero errors.

## Assumptions

- No functional feature is lost because all Ditjenbun and BPDPKS operational tasks are handled by `DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, and `BPDP_APPROVAL`.
