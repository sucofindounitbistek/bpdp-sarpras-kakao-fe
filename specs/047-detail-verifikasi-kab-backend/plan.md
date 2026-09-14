# Implementation Plan: Detail Verifikasi Kabupaten Backend Integration

**Branch**: `047-detail-verifikasi-kab-backend` | **Date**: 2026-08-27 | **Spec**: [spec.md](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/specs/047-detail-verifikasi-kab-backend/spec.md)

**Input**: Feature specification from `/specs/047-detail-verifikasi-kab-backend/spec.md`

## Summary

Integrate Dinas Kabupaten/Kota verification detail view (`DetailVerifikasiKabView.vue`) and its step subcomponents with the backend API:
1. Fetch proposal details via GET `/api/v1/proposals/:id`.
2. Fetch spatial overlap data via GET `/api/v1/proposals/:id/spatial-overlap`.
3. Submit bulk validations for farmer documents/fields via POST `/api/v1/farmer-document-validations/bulk`.
4. Submit bulk validations for land documents via POST `/api/v1/land-document-validations/bulk`.
5. Return proposal for revision via PATCH `/api/v1/proposals/:id` setting status to `"REV_FROM_KAB"`.
6. Upload SK CPCL and approve proposal via POST `/api/v1/proposals/:id/documents/bulk` and PATCH `/api/v1/proposals/:id` setting status to `"KAB_SUBMITTED"`.

Encapsulate all API operations in Pinia store actions to satisfy Principle III. Use `LOCALIZATION` config values for all user-facing copy (Principle XV).

## Technical Context

- **Language/Version**: Vue 3 (Composition API, `<script setup>`), TypeScript strict.
- **Primary Dependencies**: Tailwind CSS, Pinia, Axios.
- **Storage**: Pinia stores (`usePengusulanStore` & `useVerifikasiKabDraftStore`).
- **Testing**: Manual verification against running app (no automated testing frameworks per Constitution).
- **Target Platform**: Responsive Web Browser.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Vue 3 `<script setup>`** - Yes. Uses composition setup.
- **Principle III: Pinia store for API** - Yes. Encapsulates all backend actions in `usePengusulanStore` instead of direct Axios calls inside views.
- **Principle IX: Error response fidelity** - Yes. Standard catch and toast alerts are used.
- **Principle XII: Skeleton Loader Standard** - Yes. Skeleton loaders are displayed during detail fetching.
- **Principle XV: Wording Externalization** - Yes. All hardcoded Indonesian UI texts are replaced with `LOCALIZATION` fields.

## Project Structure

### Documentation (this feature)

```text
specs/047-detail-verifikasi-kab-backend/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Data entities
├── quickstart.md        # Validation guide
└── contracts/
    └── api.md           # API schema
```

### Source Code (repository root)

```text
src/
├── services/
│   └── proposal.service.ts
├── stores/
│   └── pengusulan.ts
└── views/
    └── dinas/
        └── kabupaten/
            ├── DetailVerifikasiKabView.vue
            ├── StepVerifikasiPekebunDanDokumenProposal.vue
            ├── StepDataCPCL.vue
            └── StepSummaryDanSubmit.vue
```

**Structure Decision**: Single project layout. Modify `proposal.service.ts` to add validation and spatial overlap endpoints, extend `pengusulan.ts` store with actions, and update the view and step subcomponents.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | N/A | N/A |
