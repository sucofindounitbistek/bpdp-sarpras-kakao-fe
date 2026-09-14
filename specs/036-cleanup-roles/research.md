# Research: Role Cleanup - Remove Generic Ditjenbun Pusat & BPDPKS Admin Roles (036-cleanup-roles)

## Problem Statement & Context
Currently, the system defines 9 user roles. Two of these roles ("Ditjenbun Pusat" `DITJENBUN` and "BPDPKS Admin" `BPDPKS`) are generic legacy roles that duplicate and conflict with specific operational roles (`DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, `BPDP_APPROVAL`).

The user requested: "Role User role Ditjenbun Pusat dan BPDPKS Admin tolong diapus aja ges, meminimalisir yang rancu rancu".

Removing `DITJENBUN` and `BPDPKS` generic keys leaves 7 distinct, unambiguous operational roles in the frontend.

## Technical Decisions & Rationale

### 1. Removal Scope
- **`src/types/role.ts`**: Remove `DITJENBUN` and `BPDPKS` entries from `ROLE_DETAILS_MAP`.
- **`src/types/auth.ts` / `src/stores/auth.ts`**: Remove `DITJENBUN` and `BPDPKS` from `User['role']` union type and `validRoles` array.
- **`src/components/ui/RoleSwitcher.vue`**: Remove `DITJENBUN` and `BPDPKS` from the simulation dropdown options array.
- **`src/composables/useNavigation.ts`**: Clean up role arrays in navigation sections, removing `DITJENBUN` and `BPDPKS` references.
- **`src/router/index.ts`**: Clean up route meta `roles` arrays, replacing `DITJENBUN` / `BPDPKS` with their operational counterparts.

### 2. Retained Active Operational Roles
1. `PEMOHON` (Kelembagaan Pekebun)
2. `DINAS_KAB` (Dinas Kabupaten / Kota)
3. `DINAS_PROV` (Dinas Provinsi)
4. `DITJENBUN_VERIFIKATOR` (Ditjenbun Verifikator)
5. `DITJENBUN_APPROVAL` (Ditjenbun Approval / Ketua Tim)
6. `BPDP_VERIFIKATOR` (BPDP Verifikator / Staff)
7. `BPDP_APPROVAL` (BPDP Approval / Kadiv)

### 3. Risk Mitigation
- Validate with `npx vue-tsc -b` after removal to ensure no broken role references exist across components or stores.

## Alternatives Considered
- **Keeping roles as hidden fallbacks**: Rejected because leaving dead role keys leads to future confusion and lint/type drift.
