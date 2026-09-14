# Implementation Plan: Proposal & RAB Store API Alignment

**Branch**: `039-proposal-rab-api-alignment` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/039-proposal-rab-api-alignment/spec.md` and API contract from `PROPOSAL_API_CONTRACT.md`.

---

## Summary

Migrate and align the Proposal (`src/stores/pengusulan.ts`, `src/types/pengusulan.ts`) and Budget Plan (`src/stores/rab.ts`, `src/types/rab.ts`) stores, types, and API services with the real backend contract defined in `PROPOSAL_API_CONTRACT.md`. Replace legacy variables (`nomorResi` $\rightarrow$ `nomor_proposal`, `gudangSerahTerima` $\rightarrow$ `storage_area`, `rabDitandatangani` $\rightarrow$ `documents`, `totalAnggaranPengajuan` $\rightarrow$ `total_anggaran`, `jenisSarpras` $\rightarrow$ `paket_sarpras`) across all consuming views, and implement an orchestrated 3-step sequential submission pipeline (`POST /proposals` $\rightarrow$ `POST /documents/bulk` $\rightarrow$ `POST /rabs`).

---

## Technical Context

**Language/Version**: TypeScript ~5.7.3, Vue 3.5.13  
**Primary Dependencies**: Pinia 3.0.1, Axios 1.18.1, Tailwind CSS 3.4.17, VeeValidate 4.15.1, Zod 3.24.2, Lucide Vue Next  
**Storage**: Pinia state management with `pinia-plugin-persistedstate`  
**Testing**: Static type checking (`vue-tsc -b`) and production build validation (`vite build`)  
**Target Platform**: Responsive Web (Mobile 375px+ to Desktop 1440px+)  
**Project Type**: Vue 3 Single-Page Application (Frontend)  
**Performance Goals**: Instant reactive subtotal calculations, fluid 60fps micro-animations, zero cumulative layout shift  
**Constraints**: Zero `any` types, exact contract compliance with `PROPOSAL_API_CONTRACT.md`, strict error propagation (no silent swallowed errors)  
**Scale/Scope**: 2 Pinia stores updated/created, 2 API services updated/created, 2 TypeScript definition files, 10+ consuming view and modal components  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Rationale |
| :--- | :--- | :---: | :--- |
| **I. Vue 3 & Component-Driven** | `<script setup>` SFCs, modular UI | ✅ PASS | All views and components follow modular Vue 3 SFC standards |
| **II. Strict TypeScript** | Explicit interfaces, zero unjustified `any` | ✅ PASS | Strict interfaces for `Proposal`, `StorageArea`, `ProposalDocument`, `RabProposal`, `RabItem` |
| **III. Mandatory Pinia State** | Dedicated stores for domain state, no direct component API calls | ✅ PASS | Proposal actions in `usePengusulanStore`, RAB actions in `useRabStore`, draft in `usePengusulanDraftStore` |
| **IV. Modern UI/UX** | Tailwind design tokens, Forest Green `#066C2A` identity | ✅ PASS | Preserved across all proposal forms, tracking tables, and modals |
| **V. Simplicity & YAGNI** | Minimal dependencies, clean architecture | ✅ PASS | Direct contract integration without bloated middleware or unnecessary layers |
| **IX. Error Response Fidelity** | Propagate backend HTTP errors without silent fallback | ✅ PASS | Services extract `error.message` from response envelopes and surface via Toaster |
| **XIII. Backend Contract Verification** | Verify endpoints and request/response models against contract | ✅ PASS | Documented in `contracts/proposal-api.md` and `contracts/rab-api.md` matching `PROPOSAL_API_CONTRACT.md` |
| **XV. Localization Externalization** | Centralized text copy in `localization.ts` | ✅ PASS | Status and package labels read from `LOCALIZATION` config |

---

## Project Structure

### Documentation (this feature)

```text
specs/039-proposal-rab-api-alignment/
├── plan.md              # This implementation plan
├── research.md          # Architectural decisions & research findings
├── data-model.md        # Entity definitions & TypeScript interfaces
├── quickstart.md        # End-to-end validation guide
├── checklists/
│   └── requirements.md  # Spec quality validation checklist
└── contracts/
    ├── proposal-api.md  # Proposals & Documents REST API contract
    └── rab-api.md       # Budget Plan (RAB) REST API contract
```

### Source Code Impact

```text
src/
├── types/
│   ├── pengusulan.ts         # [MODIFY] Align Proposal, StorageArea, ProposalDocument types
│   ├── rab.ts                # [NEW] RabProposal, RabItem, CreateRabPayload, RabFlag types
│   └── rekomtek.ts           # [MODIFY] Align storage_area and nomor_proposal references
├── services/
│   ├── proposal.service.ts   # [NEW/REFACTOR] API service for /api/v1/proposals & /documents
│   └── rab.service.ts        # [NEW] API service for /api/v1/rabs
├── stores/
│   ├── pengusulan.ts         # [MODIFY] Update state, actions (fetch, get, create, update, delete)
│   ├── rab.ts                # [NEW] Dedicated Pinia store for RAB state & line items
│   ├── pengusulanDraft.ts    # [MODIFY] 3-step sequential submission pipeline & stage serialization
│   └── rekomtek.ts           # [MODIFY] Update references to storage_area and nomor_proposal
├── components/
│   ├── pengusulan/
│   │   └── ProposalPreviewModal.vue               # [MODIFY] storage_area, nomor_proposal, documents
│   └── rekomtek/
│       └── PratinjauPekebunDanDokumenTab.vue      # [MODIFY] storage_area and photo previews
└── views/
    ├── pengusulan/
    │   ├── StepPaketSarpras.vue                   # [MODIFY] storage_area property bindings
    │   ├── StepPilihPekebunLahan.vue              # [MODIFY] submitProposal response handling
    │   └── TrackingPengusulanView.vue             # [MODIFY] nomor_proposal, total_anggaran, status
    ├── dinas/
    │   ├── kabupaten/
    │   │   ├── DetailVerifikasiKabView.vue        # [MODIFY] nomor_proposal bindings
    │   │   ├── QueueVerifikasiKabView.vue         # [MODIFY] nomor_proposal search/filter
    │   │   ├── StepVerifikasiPekebunDanDokumenProposal.vue # [MODIFY] storage_area & photo preview
    │   │   └── StepSummaryDanSubmit.vue           # [MODIFY] storage_area photo review
    │   └── provinsi/
    │       ├── DetailVerifikasiProvinsiView.vue   # [MODIFY] nomor_proposal bindings
    │       ├── QueueVerifikasiProvinsiView.vue    # [MODIFY] nomor_proposal search/filter
    │       ├── PratinjauPekebunDanDokumenProposal.vue # [MODIFY] storage_area & photo preview
    │       └── StepSummaryDanSubmit.vue           # [MODIFY] storage_area photo review
    └── ditjenbun/
        └── PenetapanPlenoView.vue                 # [MODIFY] nomor_proposal table display
```

---

## Complexity Tracking

> No constitution violations or unjustified complexity introduced.
