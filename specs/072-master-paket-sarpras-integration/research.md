# Research: Frontend Integration for Master Data Paket Sarpras API

**Feature**: `072-master-paket-sarpras-integration`
**Date**: 2026-09-03

## 1. Technical Objectives

Decouple the frontend proposal wizard (`bpdp-sarpras-kelapa-fe`) from static hardcoded configuration files by integrating with the newly built backend master data REST APIs (`/api/v1/master/*`). Ensure fast, reactive rendering with Pinia state management and resilient fallback handling.

## 2. Architectural Decisions

### Decision 1: Service and Store Separation
- **Choice**:
  - `src/services/masterSarpras.service.ts`: Handles Axios HTTP requests to `/api/v1/master/kategori-sarpras`, `/api/v1/master/paket-sarpras`, `/api/v1/master/paket-sarpras/:code/persyaratan`, `/api/v1/master/dokumen-persyaratan`, and `/api/v1/master/syarat-lahan`.
  - `src/stores/masterSarpras.ts`: Pinia store that executes parallel initial loading, caches datasets in-memory, provides fast lookup getters (by code), and falls back to static defaults if network requests fail.
- **Rationale**: Isolates network transport concerns from reactive state and UI binding.

### Decision 2: Integration with Step 1 & Cascading Dropdown
- **Choice**:
  - `src/views/pengusulan/StepPaketSarpras.vue` reads `masterSarprasStore.paketList` and `masterSarprasStore.kategoriList`.
  - `src/components/ui/CascadingPaketSelect.vue` computes groups dynamically from `masterSarprasStore.paketGroups`.
- **Rationale**: Provides consistent package lists across all views in the application.

### Decision 3: Document Requirements & Step 3 Threshold Integration
- **Choice**:
  - `src/stores/pengusulanDraft.ts` calls `masterSarprasStore.getSyaratMinimum(paketId)` to determine required farmer count and land acreage.
  - Verification views (`StepVerifikasiPekebunDanDokumenProposal.vue`, `StepSummaryDanSubmit.vue`) use `masterSarprasStore.getPersyaratanByPaket(code)` for dynamic review checklists.
- **Rationale**: Any rule change made in the backend database instantly takes effect in the proposal creation and verification workflows.
