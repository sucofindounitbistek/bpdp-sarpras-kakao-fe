# Tasks: sarpras-kelapa-branding

**Input**: Design documents from `specs/028-sarpras-kelapa-branding/`

**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Correctness will be verified via manual UI checks, type checking, and production build checks.

---

## Phase 1: Setup & Styling (Shared Infrastructure)

**Purpose**: Rebrand CSS variables and Tailwind configuration theme mapping.

- [x] T001 Update HSL variables for `--primary`, `--secondary`, and `--ring` in `src/assets/main.css` to match coconut green and palm cream.
- [x] T002 Update custom tailwind configuration colors (`brand`, rename/map `cocoa` to `kelapa` keys) in `tailwind.config.js`.

---

## Phase 2: User Story 1 - Rebranding UI Components (Wording & Color Styles)

**Goal**: Substitute "Kakao" display copy and adjust custom background/text styles in all page views.

- [x] T003 [P] Update header word from "Kakao" to "Kelapa" and remove `text-cocoa-accent` in `src/components/ui/Sidebar.vue`.
- [x] T004 [P] Update `text-cocoa-accent` usage in `src/components/ui/RoleSwitcher.vue`.
- [x] T005 [P] Replace "kakao" mentions and update gradient class `to-cocoa` to `to-emerald-950` in `src/views/DashboardView.vue`.
- [x] T006 [P] Update "BPDP Sarpras Kakao" header and default profile names in `src/views/LoginView.vue`.
- [x] T007 Replace all remaining instances of "Kakao" / "kakao" in page-level templates:
  - `src/views/pemohon/PengajuanProposalView.vue`
  - `src/views/pengusulan/TrackingPengusulanView.vue`
  - `src/views/pengusulan/StepProfilLembaga.vue`
  - `src/views/pengusulan/FormPengusulanView.vue`
  - `src/views/master-data/PekebunListView.vue`
  - `src/views/ditjenbun/SKPenetapanView.vue`
  - `src/views/ditjenbun/AntreanRekomtekView.vue`

---

## Phase 3: User Story 2 - Rebranding Store Mocks & Activity Logs

**Goal**: Update mock commodity, group names, crops, and audit logs.

- [x] T008 [P] Update mock commodity, crop types, group names, and RAB descriptions in `src/stores/rekomtek.ts`.
- [x] T009 [P] Update mock receipt prefixes (`BPDP-KELAPA-`), proposal details, and organization names in `src/stores/pengusulan.ts`.
- [x] T010 [P] Update mock user organization names in `src/stores/users.ts`.
- [x] T011 Replace mock proposal name references in activity logs/detail views:
  - `src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue`
  - `src/views/dinas/kabupaten/DetailVerifikasiKabView.vue`
  - `src/views/dinas/ProvVerifikasiView.vue`

---

## Phase 4: Polish & Bundling Verification

**Purpose**: Confirm overall formatting, compilation, and bundling completeness.

- [x] T012 Run type checker `npx vue-tsc --noEmit` and production build `npm run build` to verify zero compile or packaging errors.
