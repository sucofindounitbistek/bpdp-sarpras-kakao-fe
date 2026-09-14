# Tasks: Master Data Pekebun

**Input**: Design documents from `specs/004-master-data-pekebun/`

**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

**Tests**: Not required per Constitution (Development & Quality Workflow).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create type definitions, Zod schemas, and Pinia store — the foundational layer all views and components depend on.

- [x] T001 [P] Create Pekebun type definitions in `src/types/pekebun.ts` — define interfaces: `Pekebun`, `DokumenPekebun`, `LahanPekebun`, `DukcapilResult`, `WilayahItem`, enums: `JenisLegalitas`, `StatusPernikahan`, `WilayahLevel`, `TipeDokumenPekebun` per data-model.md
- [x] T002 [P] Create Pekebun Zod validation schemas in `src/schemas/pekebun.schema.ts` — define: `identitasPekebunSchema` (NIK 16-digit, alamat min 10 chars, kodepos 5 digits, nomorHP min 10 digits), `lahanPekebunSchema` (jenisLegalitas enum, nomorLegalitas min 3, luasLahan positive, tahunTanam 1950-current, all wilayah codes required) per contracts/ui-contract.md
- [x] T003 [P] Create placeholder document templates in `public/templates/` — create 3 empty .docx placeholder files: `format-sporadik.docx`, `format-surat-beda-nama.docx`, `format-surat-penguasaan-fisik.docx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pinia store with mock data, Dukcapil simulation, wilayah data, and NIK uniqueness check — MUST complete before any view can work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Create Pekebun Pinia store in `src/stores/pekebun.ts` — implement `usePekebunStore` with: (1) `listPekebun` ref with 3-5 hardcoded mock Pekebun records including dokumen and lahan data, (2) `addPekebun(payload)` action that generates ID and pushes to list, (3) `isNikRegistered(nik)` that checks uniqueness against existing records, (4) `lookupDukcapil(nik)` that returns mock DukcapilResult after 500ms simulated delay for 3-5 known NIKs or null for unknown, (5) `getWilayahByParent(parentKode, level)` that returns mock wilayah data (2-3 provinces, nested kabupaten/kecamatan/desa), (6) `persist: true` option. Use types from `src/types/pekebun.ts` and follow existing pattern in `src/stores/pengusulan.ts`
- [x] T005 Add routes for Master Data Pekebun in `src/router/index.ts` — add 2 new routes: `/master-data/pekebun` (name: `master-data-pekebun`, lazy import `PekebunListView.vue`) and `/master-data/pekebun/tambah` (name: `master-data-pekebun-tambah`, lazy import `FormPekebunView.vue`)
- [x] T006 Add "Master Data" sidebar section in `src/components/ui/Sidebar.vue` — add new `navSections` entry with `title: 'MASTER DATA'`, `role: 'PEMOHON'`, containing item `{ label: 'Pekebun', to: '/master-data/pekebun', icon: Users }`. Import `Users` from `lucide-vue-next`. Place section after the existing "LEMBAGA PEKEBUN" section

**Checkpoint**: Foundation ready — store, routes, and sidebar navigation functional. User story implementation can now begin.

---

## Phase 3: User Story 1 — Pendaftaran Data Identitas Pekebun (Priority: P1) 🎯 MVP

**Goal**: Users can enter a 16-digit NIK, see Dukcapil data auto-populated, fill manual fields (Alamat, Kodepos, No HP), and navigate Step 1 of the registration form.

**Independent Test**: Enter NIK on Step 1, verify Dukcapil fields auto-fill, fill manual fields, click "Selanjutnya" — validation passes and step advances.

### Implementation for User Story 1

- [x] T007 [US1] Create StepIdentitasPekebun component in `src/components/master-data/StepIdentitasPekebun.vue` — implement Step 1 form with: (1) Input field for Nomor KTP (16-digit, with search/lookup button), (2) Read-only generated fields (Nama, Nomor KK, Status Pernikahan, Tempat & Tanggal Lahir) styled with disabled Input components, (3) Manual input fields (Alamat textarea, Kodepos 5-digit input, Nomor HP input), (4) Props: `modelValue: IdentitasFormData`, `dukcapilData: DukcapilResult | null`, `nikError: string`, (5) Emits: `update:modelValue`, `lookup-nik`. Use existing `Input.vue` component. Follow Constitution XIV compact typography (text-xs md:text-sm labels, h-9 to h-10 inputs)
- [x] T008 [US1] Create FormPekebunView page in `src/views/master-data/FormPekebunView.vue` — implement 3-step wizard using `useFormWizard(3)` composable with: (1) Breadcrumb (Beranda > Master Data > Pekebun > Tambah Pekebun), (2) StepIndicator with 3 steps (Data Identitas, Upload Dokumen, Data Lahan), (3) Step 1: StepIdentitasPekebun with NIK lookup via `usePekebunStore().lookupDukcapil()`, NIK uniqueness validation via `isNikRegistered()`, (4) Zod validation via `identitasPekebunSchema` before advancing steps, (5) Navigation buttons (Kembali/Selanjutnya/Simpan), (6) Toast notifications for errors and success. Use existing `Card.vue`, `Button.vue`, `Badge.vue`, `Breadcrumb.vue`, `StepIndicator.vue`. Page wrapper uses `px-4 lg:px-6 py-4` for flush navbar alignment per Constitution XIV

**Checkpoint**: Step 1 form functional with Dukcapil lookup, NIK validation, and step navigation.

---

## Phase 4: User Story 2 — Upload Dokumen Pekebun (Priority: P1)

**Goal**: Users can upload 4 mandatory documents (Scan KTP, Scan KK, Swafoto, Surat Kuasa PDF) with file type/size validation and preview.

**Independent Test**: Navigate to Step 2, upload all 4 documents, verify preview/filename displayed, try invalid file types — rejected with error.

### Implementation for User Story 2

- [x] T009 [US2] Create StepUploadDokumenPekebun component in `src/components/master-data/StepUploadDokumenPekebun.vue` — implement Step 2 form with: (1) 4 FileUpload areas in a 2x2 responsive grid (`grid-cols-1 md:grid-cols-2`), (2) Scan KTP: accept image/jpeg, image/png, max 5MB, (3) Scan KK: accept image/jpeg, image/png, max 5MB, (4) Swafoto Pekebun: accept image/jpeg, image/png, max 5MB, (5) Surat Kuasa Pekebun ke Ketua: accept application/pdf, max 10MB, (6) Each upload shows image preview (for images) or filename + size (for PDF), (7) Props: `modelValue: DokumenFormData`, Emits: `update:modelValue`. Reuse existing `FileUpload.vue` component
- [x] T010 [US2] Wire StepUploadDokumenPekebun into FormPekebunView — add Step 2 rendering in `src/views/master-data/FormPekebunView.vue`, validate all 4 documents are uploaded before allowing "Selanjutnya" to Step 3, show toast error if any document is missing

**Checkpoint**: Steps 1 and 2 functional — identity data and documents collected.

---

## Phase 5: User Story 3 — Pendaftaran Data Lahan Pekebun (Priority: P1)

**Goal**: Users can register land data with cascading wilayah dropdown, upload legalitas scan, download template documents, and complete the full registration.

**Independent Test**: On Step 3, select legalitas type, fill all land fields, select cascading Provinsi → Kabupaten → Kecamatan → Desa, upload scan, click "Simpan" — record saved and visible in list.

### Implementation for User Story 3

- [x] T011 [US3] Create StepDataLahanPekebun component in `src/components/master-data/StepDataLahanPekebun.vue` — implement Step 3 form with: (1) Select Jenis Legalitas Lahan (SHM / Non SHM), (2) Conditional "Download Format Sporadik" button when Non SHM selected (links to `/templates/format-sporadik.docx`), (3) Input fields: Nomor Legalitas, Tanggal Penerbitan (date picker), Luas Lahan (number in hectares), (4) Cascading wilayah selects: Provinsi → Kabupaten → Kecamatan → Desa using `usePekebunStore().getWilayahByParent()` with disabled state on child selects until parent selected, (5) Input fields: Alamat/Blok Kebun, Tahun Tanam (number), Jenis Bibit (text), (6) FileUpload for Scan Legalitas Lahan (image/pdf, max 10MB), (7) Download buttons for "Format Surat Keterangan Beda Nama Lahan" and "Format Surat Pernyataan Penguasaan Fisik Bidang Tanah" (.docx), (8) Props: `modelValue: LahanFormData`, Emits: `update:modelValue`. Validate with `lahanPekebunSchema`
- [x] T012 [US3] Wire StepDataLahanPekebun and submit logic into FormPekebunView — add Step 3 rendering in `src/views/master-data/FormPekebunView.vue`, implement `handleSubmit()` that: (1) validates Step 3 with `lahanPekebunSchema`, (2) calls `usePekebunStore().addPekebun()` with combined data from all 3 steps, (3) shows success toast "Data pekebun berhasil disimpan", (4) navigates to `/master-data/pekebun` list page

**Checkpoint**: Full 3-step registration flow functional end-to-end.

---

## Phase 6: User Story 4 — List Pekebun & Detail Modal (Priority: P2)

**Goal**: Users can view a list of registered Pekebun with search/filter, and view read-only details in a modal.

**Independent Test**: Navigate to `/master-data/pekebun`, see table with mock data, search by name/NIK, filter by wilayah, click "Detail" — modal shows full data.

### Implementation for User Story 4

- [x] T013 [P] [US4] Create DetailPekebunModal component in `src/components/master-data/DetailPekebunModal.vue` — implement read-only detail modal using existing `Modal.vue` with: (1) Sectioned layout: Identitas (NIK, Nama, KK, status pernikahan, tempat/tgl lahir, alamat, kodepos, HP), Dokumen (list of 4 uploaded document names), Lahan (jenis legalitas, nomor, tanggal, luas, wilayah, alamat kebun, tahun tanam, jenis bibit), (2) Props: `pekebun: PekebunRecord | null`, `isOpen: boolean`, (3) Emits: `close`. Style labels as `text-xs text-slate-500` and values as `text-sm text-slate-900`
- [x] T014 [US4] Create PekebunListView page in `src/views/master-data/PekebunListView.vue` — implement list page with: (1) Breadcrumb (Beranda > Master Data > Pekebun), (2) Header with title "Master Data Pekebun" and "+ Tambah Pekebun" button (navigates to `/master-data/pekebun/tambah`), (3) Search input (filters by Nama or NIK), (4) Filter dropdown (filter by Wilayah/Provinsi), (5) Responsive data table showing columns: No, NIK, Nama Pekebun, Wilayah (Kabupaten), Luas Lahan, Aksi, (6) "Detail" button per row that opens `DetailPekebunModal`, (7) Empty state when no data matches search/filter, (8) Page wrapper uses `px-4 lg:px-6 py-4` for flush navbar alignment. Load data from `usePekebunStore().listPekebun`

**Checkpoint**: Full feature functional — list with search/filter/detail and 3-step registration form.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build validation, skeleton loading, and final quality assurance.

- [x] T015 [P] Add skeleton loading states in `src/views/master-data/PekebunListView.vue` — add Skeleton.vue placeholders for table rows during initial load simulation (500ms delay) per Constitution XII
- [x] T016 [P] Add skeleton loading states in `src/views/master-data/FormPekebunView.vue` — add Skeleton.vue placeholders for form during Dukcapil lookup per Constitution XII
- [x] T017 Run `npm run build` (`vue-tsc -b && vite build`) — verify 0 TypeScript errors and successful production build per Constitution Development & Quality Workflow
- [x] T018 Run quickstart.md validation scenarios — manually verify all 8 scenarios from `specs/004-master-data-pekebun/quickstart.md` pass in the browser

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001, T002, T003 can start immediately and run in parallel
- **Foundational (Phase 2)**: T004 depends on T001 (types). T005, T006 can start after Phase 1
- **US1 (Phase 3)**: Depends on T004 (store). T007 → T008 sequential
- **US2 (Phase 4)**: Depends on T008 (FormPekebunView exists). T009 → T010 sequential
- **US3 (Phase 5)**: Depends on T010 (Step 2 wired). T011 → T012 sequential
- **US4 (Phase 6)**: Depends on T004 (store). T013 and T014 can run in parallel, but T014 references T013
- **Polish (Phase 7)**: Depends on all user stories complete. T015, T016 can run in parallel

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **US2 (P1)**: Depends on US1 (FormPekebunView exists as host) — adds Step 2 to existing form
- **US3 (P1)**: Depends on US2 (Step 2 wired) — adds Step 3 and submit logic
- **US4 (P2)**: Can start after Foundational (Phase 2) — independent from form stories, but benefits from store data

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 all run in parallel (different files)
- **Phase 2**: T005 and T006 can run in parallel after T004
- **Phase 6**: T013 can be built in parallel with earlier phases since it's a standalone modal component

---

## Parallel Example: Phase 1

```text
# All 3 setup tasks can run simultaneously:
Task T001: "Create types in src/types/pekebun.ts"
Task T002: "Create schemas in src/schemas/pekebun.schema.ts"
Task T003: "Create templates in public/templates/"
```

## Parallel Example: Phase 6

```text
# Modal can be built while list page is also being built:
Task T013: "Create DetailPekebunModal in src/components/master-data/DetailPekebunModal.vue"
Task T014: "Create PekebunListView in src/views/master-data/PekebunListView.vue"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (types, schemas, templates)
2. Complete Phase 2: Foundational (store, routes, sidebar)
3. Complete Phase 3: User Story 1 — Step 1 Identity Form
4. **STOP and VALIDATE**: Test Step 1 independently
5. Complete Phase 4: User Story 2 — Step 2 Document Upload
6. Complete Phase 5: User Story 3 — Step 3 Land Data + Submit
7. **STOP and VALIDATE**: Full 3-step registration works end-to-end

### Incremental Delivery

1. Setup + Foundational → Navigation works, store available
2. Add US1 → Step 1 with Dukcapil lookup testable → Demo
3. Add US2 → Step 2 with file uploads testable → Demo
4. Add US3 → Full form with submit testable → Demo (MVP!)
5. Add US4 → List page with search/filter/detail → Full Feature
6. Polish → Skeletons, build validation → Production Ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All data is client-simulated (mockup) per Constitution XIII — no real backend calls
