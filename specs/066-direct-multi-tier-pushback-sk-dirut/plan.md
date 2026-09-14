# Implementation Plan - Direct Multi-Tier Pushback for Published SK Dirut Proposals

**Feature Branch**: `066-direct-multi-tier-pushback-sk-dirut`
**Spec**: [spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/specs/066-direct-multi-tier-pushback-sk-dirut/spec.md)
**Status**: In Progress

## Technical Context

The application is built on Vue 3 + TypeScript with Pinia and Tailwind CSS.
The goal is to enable an Inspect & Multi-Tier Pushback workflow on proposals with status `SK_DIRUT_PUBLISHED` / `SELESAI` inside `ApprovalBpdpView.vue`, navigable from both `SkDirutView.vue` (BPDP Verifikator) and `RiwayatSelesaiView.vue` (BPDP Approval).

Key files to modify/create:
- `src/views/bpdp/ApprovalBpdpView.vue`: Support Inspect Mode on `SK_DIRUT_PUBLISHED` / `SELESAI`, render 7 documents with `RAB_FINAL`, provide exclusive Reject action with inline notes, multi-tier pushback modal with smart disabled rules, and aggregated note update.
- `src/views/bpdp/SkDirutView.vue`: Point action button for `SK_DIRUT_PUBLISHED` to `/bpdp/approval/:id`.
- `src/views/bpdp/RiwayatSelesaiView.vue`: Point action button for `SELESAI` / `SK_DIRUT_PUBLISHED` to `/bpdp/approval/:id`.
- `src/services/proposal.service.ts`: Utilize `proposalService.update(id, payload)` and `proposalService.bulkProposalValidations(payload)`.

## Constitution Check

- Modular architecture adhered to.
- TypeScript strict typing maintained.
- Error handling with toasts and inline validations.
- Audit trail and status history preserved.

## Proposed Changes

### Component 1: `ApprovalBpdpView.vue`
1. Update `isReadonly` logic:
   - For `SK_DIRUT_PUBLISHED` / `SELESAI`, set `isInspectMode = true` (actions enabled for inspection/rejection, but no approve button).
2. Add `RAB_FINAL` document mapping alongside the existing 6 documents (`SK_CPCL`, `BA_VERIFIKASI`, `BA_VERIFIKASI_LAPANGAN`, `SURAT_PENGANTAR_SK_CPCL`, `REKOMTEK`, `KEPUTUSAN_KELAYAKAN`).
3. Add document rejection tracking (`is_valid: false`, `note: string`).
4. Implement Multi-Tier Pushback Modal:
   - Radio/Selection for 4 tiers:
     - **Dinas Kabupaten/Kota** (`REV_FROM_PROV`) -> Enabled if any Kab doc rejected (`RAB_FINAL`, `SK_CPCL`, `BA_VERIFIKASI`, `BA_VERIFIKASI_LAPANGAN`).
     - **Dinas Provinsi** (`REV_FROM_DITJEN_VERIF`) -> Enabled if `SURAT_PENGANTAR_SK_CPCL` rejected.
     - **Ditjenbun Verifikator** (`REV_FROM_DITJEN_APPR`) -> Enabled if `REKOMTEK` rejected.
     - **BPDP Verifikator** (`REV_FROM_BPDP_APPR`) -> Enabled if `KEPUTUSAN_KELAYAKAN` rejected.
   - Disabled state with tooltip/helper text for unrejected tiers.
5. Notes Aggregator & Service Calls:
   - Aggregates all rejected document notes.
   - Calls `proposalService.update(proposalId, { status: targetStatus, notes: aggregatedNotes })`.
   - Calls `proposalService.bulkProposalValidations(validationPayloads)`.
   - Redirects to origin queue (`/bpdp/sk-dirut` or `/bpdp/riwayat-selesai`).

### Component 2: `SkDirutView.vue` & `RiwayatSelesaiView.vue`
- Update router links to navigate to `/bpdp/approval/:id`.

## Verification Plan

### Automated Tests
- Type checking: `npm run build` / TypeScript verification.
- Unit tests: Run store and component test suite.

### Manual Verification
1. Log in as BPDP Verifikator, go to `/bpdp/sk-dirut`, click "Tinjau" on published proposal (`SK_DIRUT_PUBLISHED`).
2. Verify Inspect Mode displays 7 documents without Approve button.
3. Reject `SK_CPCL`, verify notes input appears and "Kabupaten" option is enabled in pushback modal while others are disabled.
4. Confirm pushback, verify status becomes `REV_FROM_PROV`, and redirected back to `/bpdp/sk-dirut`.
5. Repeat verification as BPDP Approval from `/bpdp/riwayat-selesai`.
