# Tasks: Modul Penyaluran & Pengusulan Sarpras BPDPKS

**Input**: Design documents from `/specs/002-modul-penyaluran/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Infrastructure setup and base types

- [X] T001 Define TypeScript types for Role, SimulatedUser, CPCL, Proposal, and VerificationRecord in src/types/penyaluran.ts
- [X] T002 Configure mock data stores and default state in src/stores/authStore.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core layout and routing structure that MUST be complete before user stories can be tested

- [X] T003 [P] Implement global Role Switcher dropdown component in src/components/ui/RoleSwitcher.vue
- [X] T004 Integrate Role Switcher in Topbar / App Header in src/App.vue
- [X] T005 Update router configuration and navigation guards in src/router/index.ts

---

## Phase 3: User Story 1 - Dynamic Sidebar & Role Switching (Priority: P1) 🎯 MVP

**Goal**: Enable dynamic sidebar menu filtering and role switching across 5 roles (Kelembagaan Pekebun, Dinas Kab/Kota, Dinas Provinsi, Ditjenbun, BPDPKS).

**Independent Test**: Switch roles via the Role Switcher dropdown in the top header and verify that the sidebar navigation items and active role state update dynamically in <200ms.

- [X] T006 [P] [US1] Update Pinia authStore to support 5 simulated roles with persistent state in src/stores/authStore.ts
- [X] T007 [P] [US1] Refactor Sidebar component to dynamically filter navigation menus based on role in src/components/ui/Sidebar.vue
- [X] T008 [US1] Build multi-role KPI metric cards component for Dashboard in src/components/dashboard/MetricCards.vue
- [X] T009 [US1] Implement dynamic role-tailored landing overview in src/views/DashboardView.vue

---

## Phase 4: User Story 2 - Pengusulan Sarpras oleh Kelembagaan Pekebun (Priority: P1)

**Goal**: Provide forms for Kelembagaan Pekebun to input CPCL (farmer & land polygon geotagging), draft proposal, submit, and revise proposals.

**Independent Test**: Select "Kelembagaan Pekebun" role, navigate to CPCL & Proposal submission pages, fill mock data, and verify proposal status changes to `Diajukan ke Dinas Kab/Kota`.

- [X] T010 [P] [US2] Create CPCL Data Pekebun & Lahan Form component in src/components/penyaluran/CPCLForm.vue
- [X] T011 [P] [US2] Create Geotagging Poligon Lahan Map mockup component in src/components/penyaluran/PolygonMap.vue
- [X] T012 [US2] Implement Proposal Sarpras Pengajuan view in src/views/pemohon/PengajuanProposalView.vue
- [X] T013 [US2] Implement Revision Proposal page for returned proposals in src/views/pemohon/RevisiProposalView.vue

---

## Phase 5: User Story 3 - Verifikasi & Rekomtek Dinas Kabupaten/Kota (Priority: P2)

**Goal**: Allow Dinas Kab/Kota verifiers to review admin/field verification checklist and issue Surat Rekomendasi Teknis (Rekomtek) Kabupaten/Kota.

**Independent Test**: Select "Dinas Kab/Kota" role, open verification queue, approve checklist items, and verify Rekomtek issuance updates status to `Diajukan ke Dinas Provinsi`.

- [X] T014 [P] [US3] Create Regency Verification Checklist component in src/components/dinas/KabVerifikasiChecklist.vue
- [X] T015 [US3] Implement Dinas Kab/Kota Verifikasi & Rekomtek view in src/views/dinas/KabVerifikasiView.vue
- [X] T016 [US3] Add return/revision note modal for rejecting proposals in src/components/dinas/RevisiModal.vue

---

## Phase 6: User Story 4 - Validasi Dinas Provinsi & Evaluasi Ditjenbun (Priority: P3)

**Goal**: Provide provincial validation dashboard and Ditjenbun evaluation view for issuing SK Penetapan Penerima Sarpras.

**Independent Test**: Select "Dinas Provinsi" and "Ditjenbun" roles sequentially, review regional Rekomtek records, and execute SK Penetapan issuance.

- [X] T017 [P] [US4] Implement Dinas Provinsi Validation View in src/views/dinas/ProvVerifikasiView.vue
- [X] T018 [US4] Implement Ditjenbun Evaluasi & SK Penetapan View in src/views/ditjenbun/SKPenetapanView.vue

---

## Phase 7: User Story 5 - User Management & Penyaluran BPDPKS (Priority: P4)

**Goal**: Provide BPDPKS role with User Management directory, role permissions/responsibilities card panel, and PKS/BAST penyaluran tracking.

**Independent Test**: Select "BPDP" role, navigate to User Management, verify user directory list and 5-role description panel, then navigate to Penyaluran PKS view.

- [X] T019 [P] [US5] Create 5-Role Descriptions & Permissions Card component in src/components/bpdpks/RoleDescriptionsCard.vue
- [X] T020 [P] [US5] Create User Directory Table component with role filter in src/components/bpdpks/UserDirectoryTable.vue
- [X] T021 [US5] Implement BPDPKS User Management view in src/views/bpdpks/UserManagementView.vue
- [X] T022 [US5] Implement Penyaluran Dana & PKS Tracking view in src/views/bpdpks/PenyaluranPKSView.vue

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Refinement, mobile responsiveness check, and end-to-end validation

- [X] T023 [P] Verify WCAG AA contrast compliance and Forest Green (`#066C2A`) theme consistency across all views
- [X] T024 Test mobile layout responsiveness and overlay sidebar transitions
- [X] T025 Execute end-to-end validation scenarios documented in quickstart.md

---

## Dependencies & Execution Order

```
Phase 1: Setup (T001, T002)
  ↓
Phase 2: Foundational (T003, T004, T005)
  ↓
Phase 3: User Story 1 (T006 - T009) [P1 MVP]
  ↓
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ Phase 4: User Story 2   │ Phase 5: User Story 3   │ Phase 6: User Story 4   │
│ (T010 - T013) [P1]      │ (T014 - T016) [P2]      │ (T017 - T018) [P3]      │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
  ↓
Phase 7: User Story 5 (T019 - T022) [P4]
  ↓
Phase 8: Polish & Validation (T023 - T025)
```

---

## Implementation Strategy

### MVP Scope (User Story 1 Only)
1. Complete Setup (Phase 1) & Foundational (Phase 2).
2. Implement User Story 1 (Role Switcher topbar dropdown & reactive sidebar navigation).
3. Validate independent testing of User Story 1.

### Full Delivery
Proceed sequentially through User Story 2 to User Story 5, finishing with Phase 8 Polish & quickstart validation.
