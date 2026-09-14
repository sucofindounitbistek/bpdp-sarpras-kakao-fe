# Tasks: Direct Multi-Tier Pushback for Published SK Dirut Proposals

**Feature Branch**: `066-direct-multi-tier-pushback-sk-dirut`
**Spec**: [spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/specs/066-direct-multi-tier-pushback-sk-dirut/spec.md)
**Plan**: [plan.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/specs/066-direct-multi-tier-pushback-sk-dirut/plan.md)
**Status**: Ready

## Phase 1: Foundational Setup

- [X] T001 Update `isReadonly` computed logic and introduce `isInspectMode` for `SK_DIRUT_PUBLISHED` and `SELESAI` statuses in `src/views/bpdp/ApprovalBpdpView.vue`
- [X] T002 Add `RAB_FINAL` document resolver, document alias mapping, and validation state in `src/views/bpdp/ApprovalBpdpView.vue`

## Phase 2: User Story 1 (P1) - Inspect & Reject Published Proposal Documents

**Goal**: Allow BPDP evaluators to inspect all 7 proposal documents and toggle rejection with individual notes without requiring approvals on published records.
**Independent Test**: Open a proposal with status `SK_DIRUT_PUBLISHED`, verify all 7 documents (`RAB_FINAL`, `SK_CPCL`, `BA_VERIFIKASI`, `BA_VERIFIKASI_LAPANGAN`, `SURAT_PENGANTAR_SK_CPCL`, `REKOMTEK`, `KEPUTUSAN_KELAYAKAN`) render with a "Tolak" button and notes field upon rejection.

- [X] T003 [US1] Implement exclusive "Tolak" (Reject) toggle buttons and per-document rejection notes input for all 7 documents in Inspect Mode in `src/views/bpdp/ApprovalBpdpView.vue`
- [X] T004 [US1] Bind "Kembalikan Usulan (Pushback)" action button to enable strictly when at least one document is rejected with non-empty notes in `src/views/bpdp/ApprovalBpdpView.vue`

## Phase 3: User Story 2 (P1) - Direct Multi-Tier Pushback Execution

**Goal**: Enable direct multi-tier pushback to Kabupaten (`REV_FROM_PROV`), Provinsi (`REV_FROM_DITJEN_VERIF`), Ditjenbun Verifikator (`REV_FROM_DITJEN_APPR`), or BPDP Verifikator (`REV_FROM_BPDP_APPR`) with automated disabled guardrails for unrejected tiers.
**Independent Test**: Reject a Kabupaten document, open the pushback modal, verify "Dinas Kabupaten/Kota" is enabled while other tiers are disabled, and execute pushback to update proposal status and save aggregated notes.

- [X] T005 [US2] Create Multi-Tier Pushback Selection Modal with 4 target tiers (Kabupaten, Provinsi, Ditjenbun Verifikator, BPDP Verifikator) in `src/views/bpdp/ApprovalBpdpView.vue`
- [X] T006 [US2] Implement smart disabled guardrail rules per tier based on rejected document ownership in `src/views/bpdp/ApprovalBpdpView.vue`
- [X] T007 [US2] Implement notes aggregation and submission handler invoking `proposalService.update` (`PATCH /proposals/:id`) and `proposalService.bulkProposalValidations` in `src/views/bpdp/ApprovalBpdpView.vue`
- [X] T008 [US2] Implement post-pushback success toast and redirection back to origin queue (`/bpdp/sk-dirut` or `/bpdp/riwayat-selesai`) in `src/views/bpdp/ApprovalBpdpView.vue`

## Phase 4: User Story 3 (P2) - Unified Navigation from SK Dirut & Riwayat Selesai

**Goal**: Unify navigation so published proposals from both BPDP Verifikator and BPDP Approval views open `ApprovalBpdpView.vue`.
**Independent Test**: Click "Tinjau" on `/bpdp/sk-dirut` and "Lihat" on `/bpdp/riwayat-selesai` to ensure both route to `/bpdp/approval/:id`.

- [X] T009 [P] [US3] Update action links in `src/views/bpdp/SkDirutView.vue` to navigate published proposals (`SK_DIRUT_PUBLISHED`) to `/bpdp/approval/:id`
- [X] T010 [P] [US3] Update action links in `src/views/bpdp/RiwayatSelesaiView.vue` to navigate completed proposals (`SELESAI` / `SK_DIRUT_PUBLISHED`) to `/bpdp/approval/:id`

## Phase 5: Polish & Verification

- [X] T011 Run frontend build and type check to verify zero regressions across all views
