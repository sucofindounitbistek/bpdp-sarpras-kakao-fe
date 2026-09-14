# Implementation Tasks: Multi-Tier Pushback Revision Notes Display & Synchronization

**Feature Branch**: `067-sync-pushback-revision-notes`  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  

---

## Phase 1: Store & Data Layer Sync

- [x] **T001**: Update alias mapping in `src/stores/verifikasiKabDraft.ts` to map `BA_VERIFIKASI`, `BA_VERIFIKASI_LAPANGAN`, `RAB_FINAL`, and `SK_CPCL` to Kabupaten draft keys (`berita-acara-dokumen`, `berita-acara-lapangan`, `rabDocument`, `sk-cpcl`).
- [x] **T002**: Ensure `ApprovalBpdpView.vue` properly resolves `dokumen_proposal_id` (using document ID from proposal's document list) when constructing `bulkProposalValidations` payload on pushback.

---

## Phase 2: Component & Label Polish

- [x] **T003**: Update `StepDataCPCL.vue` (Kabupaten) to make rejection note label dynamic based on `validated_by_role` (`Catatan Revisi / Penolakan (BPDP KS):` vs `Ditjenbun` vs `Provinsi`).
- [x] **T004**: Verify `StepVerifikasiPekebunDanDokumenProposal.vue` and `StepDataCPCL.vue` (Provinsi) to ensure all rejected proposal documents render rejection notes seamlessly.

---

## Phase 3: Verification & Build

- [x] **T005**: Run `npm run build` in `bpdp-sarpras-kelapa-fe` to ensure clean TypeScript compilation (`✓ built in 22.02s`).
- [x] **T006**: Perform end-to-end verification: pushback from BPDP ➔ verify notes render in Kabupaten `/dinas/verifikasi/:id`.
