# Implementation Plan: Queue Kabupaten Backend Integration

**Branch**: `046-queue-kabupaten-backend` | **Date**: 2026-08-27 | **Spec**: [spec.md](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/specs/046-queue-kabupaten-backend/spec.md)

**Input**: Feature specification from `/specs/046-queue-kabupaten-backend/spec.md`

## Summary

Integrate Dinas Kabupaten/Kota verification queue view (`QueueVerifikasiKabView.vue`) with the backend API. The view will fetch proposals with the status `"SUBMITTED"` on mount and render them with skeleton loaders during load, complying with Wording Externalization (Principle XV) by replacing hardcoded Indonesian text with config-defined values.

## Technical Context

- **Language/Version**: Vue 3 (Composition API, `<script setup>`), TypeScript strict.
- **Primary Dependencies**: Tailwind CSS, Pinia, Axios.
- **Storage**: Pinia store state (`listPengajuan` populated via `fetchProposals`).
- **Testing**: Manual verification against running app (no automated testing frameworks per Constitution).
- **Target Platform**: Responsive Web Browser.
- **Project Type**: Web Frontend Application.
- **Performance Goals**: Under 1s load/render time.
- **Constraints**: AA accessibility contrast, compact density, mobile-first responsiveness.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Vue 3 `<script setup>`** - Yes. Uses existing composition setup in SFC.
- **Principle III: Pinia store for API** - Yes. Uses `store.fetchProposals` action to load data.
- **Principle IX: Error response fidelity** - Yes. Catches exceptions and uses Toast container.
- **Principle XII: Skeleton Loader Standard** - Yes. Synchronizes `pageLoading` state with actual API request lifecycle.
- **Principle XV: Localization Externalization** - Yes. All hardcoded Indonesian UI texts in `QueueVerifikasiKabView.vue` are replaced with `LOCALIZATION.dinasKabAntrean` fields.

## Project Structure

### Documentation (this feature)

```text
specs/046-queue-kabupaten-backend/
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
├── config/
│   └── localization.ts
├── stores/
│   └── pengusulan.ts
└── views/
    └── dinas/
        └── kabupaten/
            └── QueueVerifikasiKabView.vue
```

**Structure Decision**: Single project layout. The changes modify `QueueVerifikasiKabView.vue` to fetch data, handle loading states, and read localization tokens.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | N/A | N/A |
