# Tasks: Proposal & RAB Store API Alignment

**Input**: Design documents from `specs/039-proposal-rab-api-alignment/` (`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`)

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Organization**: Tasks are grouped by user story and execution phase to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`, `US4`)

---

## Phase 1: Setup (Types & Data Contracts)

**Purpose**: Establish core TypeScript definitions and data interfaces matching `PROPOSAL_API_CONTRACT.md`.

- [x] T001 Create Budget Plan (RAB) TypeScript interfaces (`RabProposal`, `RabItem`, `CreateRabPayload`, `RabFlag`, `RabItemType`) in `src/types/rab.ts`
- [x] T002 [P] Update Proposal types, enums, `StorageArea`, `ProposalDocument`, and aggregate interfaces in `src/types/pengusulan.ts`
- [x] T003 [P] Align `src/types/rekomtek.ts` data structures to reference `storage_area` and `nomor_proposal`

---

## Phase 2: Foundational (API Service Layer)

**Purpose**: Core HTTP services communicating with `/api/v1/proposals`, `/api/v1/proposals/:id/documents`, and `/api/v1/rabs`.

**⚠️ CRITICAL**: Foundational services must be in place before store and view integrations begin.

- [x] T004 Implement Proposal REST API Service (`getList`, `getById`, `create`, `update`, `delete`, `bulkCreateDocuments`, `syncDocuments`) in `src/services/proposal.service.ts`
- [x] T005 [P] Implement Budget Plan (RAB) REST API Service (`getByProposalId`, `create`, `update`, `delete`) in `src/services/rab.service.ts`
- [x] T006 [P] Update `src/services/pengusulan.service.ts` to alias and forward calls to `proposal.service.ts` for clean backward compatibility

**Checkpoint**: Foundation ready - store and user story implementation can begin.

---

## Phase 3: User Story 1 - Proposal Creation, Tracking & Sequential Pipeline (Priority: P1) 🎯 MVP

**Goal**: Enable farmer cooperatives to create proposals via the 3-step sequential API pipeline and track proposal status using canonical `nomor_proposal`, `storage_area`, and `total_anggaran`.

**Independent Test**: Complete the 3-step wizard, submit a proposal, observe sequential network calls (`POST /proposals` $\rightarrow$ `POST /documents/bulk` $\rightarrow$ `POST /rabs`), and verify the proposal appears in `TrackingPengusulanView.vue`.

- [x] T007 [US1] Update `src/stores/pengusulan.ts` with reactive state (`proposals`, `activeProposal`, `pagination`, `isLoading`, `error`) and contract actions (`fetchProposals`, `getProposalDetail`, `createProposal`, `updateProposal`, `deleteProposal`)
- [x] T008 [US1] Update `src/stores/pengusulanDraft.ts` to implement the sequential 3-step submission pipeline (`submitProposal`) coordinating proposal creation, document bulk upload, and RAB creation
- [x] T009 [P] [US1] Update `src/views/pengusulan/StepPaketSarpras.vue` to bind storage area form controls to `storage_area` (`address`, `coordinate`, `interior_photo_file_id`, `exterior_photo_file_id`)
- [x] T010 [P] [US1] Update `src/views/pengusulan/StepPilihPekebunLahan.vue` to handle submission responses and trigger success toast with `nomor_proposal`
- [x] T011 [US1] Update `src/views/pengusulan/TrackingPengusulanView.vue` to display and filter records by `nomor_proposal`, `paket_sarpras`, `total_anggaran`, and `status`
- [x] T012 [P] [US1] Update `src/components/pengusulan/ProposalPreviewModal.vue` to render `storage_area` details, address, and photo previews

**Checkpoint**: User Story 1 is functional and delivers the core proposal creation & tracking MVP.

---

## Phase 4: User Story 2 - Dedicated Budget Plan (RAB) Store & Calculations (Priority: P2)

**Goal**: Provide a dedicated Pinia store for RAB budget items with real-time calculations, multi-stage details serialization into JSONB, and proposal budget synchronization.

**Independent Test**: Add line items in wizard step 2 with `jumlahTahap1` and `jumlahTahap2`, verify computed subtotals/totals, submit `POST /rabs`, and verify `total_anggaran` updates on the parent proposal.

- [x] T013 [US2] Create dedicated Pinia store `useRabStore` in `src/stores/rab.ts` with state (`activeRab`, `rabItems`, `isLoading`, `error`), computed `totalAnggaran`, and CRUD actions (`fetchRabByProposalId`, `createRab`, `updateRab`, `deleteRab`)
- [x] T014 [US2] Implement stage details serialization in `useRabStore` and `src/stores/pengusulanDraft.ts` (mapping `jumlahTahap1`, `jumlahTahap2`, `jenis` into `RabItem.details` and calculating `volume`)
- [x] T015 [P] [US2] Wire `useRabStore` methods into wizard Step 2 and budget preview components for dynamic item additions and deletions

**Checkpoint**: User Story 2 complete; budget plans calculate accurately and sync with parent proposals.

---

## Phase 5: User Story 3 - Proposal Document Attachment & Full Synchronization (Priority: P3)

**Goal**: Support bulk document attachment and full synchronization (`PUT /proposals/:id/documents`) with canonical uppercase `document_type`s and presigned file URLs.

**Independent Test**: Upload mandatory documents, verify bulk attachment via `POST /api/v1/proposals/:id/documents/bulk`, and verify previewable `file_url` links work in proposal detail modals.

- [x] T016 [US3] Implement `bulkCreateDocuments` and `syncDocuments` actions in `src/stores/pengusulan.ts` calling `proposal.service.ts`
- [x] T017 [US3] Align document type mapping in `src/stores/pengusulanDraft.ts` to canonical document types (`SURAT_PERMOHONAN`, `DOKUMEN_LEGALITAS_KELEMBAGAAN`, `SPTJM`, `PROPOSAL_TEKNIS`, `SURAT_PERNYATAAN_KEABSAHAN`, `DOKUMEN_PENDUKUNG`)
- [x] T018 [P] [US3] Update document preview links across proposal detail and preview modals to load backend-provided `file_url`

**Checkpoint**: User Story 3 complete; documents synchronize cleanly with backend storage.

---

## Phase 6: User Story 4 - Multi-Role Proposal Review, Queue & Detail Alignment (Priority: P4)

**Goal**: Ensure all Dinas Kabupaten, Dinas Provinsi, Ditjenbun, and Rekomtek verification views use standardized contract properties (`nomor_proposal`, `storage_area`, `documents`, `rabs`).

**Independent Test**: Log in under Dinas Kabupaten/Provinsi roles, filter queues by `nomor_proposal`, open proposal details, and verify storage area photos and validation toggles render without error.

- [x] T019 [P] [US4] Update `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue` and `DetailVerifikasiKabView.vue` with `nomor_proposal` and `storage_area` bindings
- [x] T020 [P] [US4] Update `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` and `StepSummaryDanSubmit.vue` to use `storage_area` and photo validation flags
- [x] T021 [P] [US4] Update `src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue` and `DetailVerifikasiProvinsiView.vue` with `nomor_proposal` bindings
- [x] T022 [P] [US4] Update `src/views/dinas/provinsi/PratinjauPekebunDanDokumenProposal.vue` and `StepSummaryDanSubmit.vue` to use `storage_area` and photo validation flags
- [x] T023 [P] [US4] Update `src/views/ditjenbun/PenetapanPlenoView.vue` with `nomor_proposal` table display and contract status
- [x] T024 [P] [US4] Update `src/stores/rekomtek.ts` and `src/components/rekomtek/PratinjauPekebunDanDokumenTab.vue` to use `storage_area` and `nomor_proposal`

**Checkpoint**: User Story 4 complete; all administrative review interfaces operate seamlessly with the real contract.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation, type checking, and end-to-end verification.

- [x] T025 [P] Verify localization strings in `src/config/localization.ts` for all proposal workflow statuses and document types
- [x] T026 Run TypeScript static type check (`vue-tsc -b`) and production build validation (`vite build`)
- [x] T027 Execute end-to-end quickstart validation scenarios per `specs/039-proposal-rab-api-alignment/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 types.
- **User Story 1 (Phase 3)**: Depends on Phase 2 services.
- **User Story 2 (Phase 4)**: Depends on Phase 2 services & `src/types/rab.ts`.
- **User Story 3 (Phase 5)**: Depends on Phase 2 services & User Story 1 draft store.
- **User Story 4 (Phase 6)**: Depends on User Story 1 & User Story 2 data structures.
- **Polish (Phase 7)**: Depends on all implementation phases.

### Parallel Opportunities
- Within Phase 1: T001, T002, T003 can run in parallel.
- Within Phase 2: T004, T005, T006 can run in parallel.
- Within Phase 3: T009, T010, T012 can run in parallel.
- Within Phase 6: T019, T020, T021, T022, T023, T024 can run in parallel across different view files.

---

## Implementation Strategy

### MVP First (User Story 1 & 2)
1. Complete Types (`src/types/rab.ts`, `src/types/pengusulan.ts`) and Services (`proposal.service.ts`, `rab.service.ts`).
2. Complete Proposal Store (`pengusulan.ts`), RAB Store (`rab.ts`), and Draft Store (`pengusulanDraft.ts`).
3. Validate proposal creation pipeline and tracking table.
4. Progress to remaining views across Dinas and Ditjenbun.
