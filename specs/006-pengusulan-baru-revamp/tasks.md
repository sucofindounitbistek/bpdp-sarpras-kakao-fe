# Tasks: Revamp Pengusulan Baru — Multi-Step Wizard (006)

**Input**: Design documents from `specs/006-pengusulan-baru-revamp/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested — verification via TypeScript strict mode + manual quickstart scenarios.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no inter-task dependencies)
- **[Story]**: Maps to user story in spec.md (US1 = Step 1 Paket & Dokumen, US2 = Step 2 RAB, US3 = Step 3 Pekebun & Submit)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend type definitions and create the shared Pinia draft store that ALL three steps depend on. MUST complete before any step component work.

- [X] T001 Extend `JenisSarpras` enum in `src/types/pengusulan.ts` — add 9 new canonical values: EKSTENSIFIKASI, INTENSIFIKASI, ALAT_PASCAPANEN, UPH, JALAN_KEBUN, ALAT_TRANSPORTASI, MESIN_PERTANIAN, INFRASTRUKTUR_PASAR, VERIFIKASI_TEKNIS (keep old values for backward compat)
- [X] T002 Add new TypeScript interfaces to `src/types/pengusulan.ts`: `PaketSarprasOption`, `PersyaratanDokumen`, `DokumenUpload`, `GudangSerahTerima`, `RabItem`, `PengusulanDraftState` (per data-model.md)
- [X] T003 Create `src/stores/pengusulanDraft.ts` — Pinia store with `persist: false`; implement full state shape from `PengusulanDraftState`, all getters (`isPupukPaket`, `rabTotal`, `isStep1Valid`, `isStep2Valid`, `isStep3Valid`), and all actions (`setPaket`, `addDokumenUpload`, `removeDokumenUpload`, `setGudang`, `addRabItem`, `updateRabItem`, `removeRabItem`, `setRabDitandatangani`, `setSelectedPekebun`, `setSelectedLahan`, `resetDraft`, `submitProposal`)
- [X] T004 Create `src/lib/pengusulan-persyaratan.config.ts` — static `PAKET_PERSYARATAN_CONFIG` object mapping all 9 `JenisSarpras` values to their `PersyaratanDokumen[]` arrays (per research.md persyaratan table); also export `PAKET_OPTIONS: PaketSarprasOption[]` array (9 entries with label, icon, description, isPupuk flag)

**Checkpoint**: Types compiled cleanly (`vue-tsc -b`). Draft store importable. Config exported. — All user story components can now begin.

---

## Phase 2: Foundational (Shared Component Infrastructure)

**Purpose**: Create reusable sub-components consumed by multiple wizard steps. Parallelisable once Phase 1 is done.

- [X] T005 [P] Create `src/components/pengusulan/RabTable.vue` — editable table component with columns Tahap / Uraian / Volume / Satuan / Harga Satuan / Sub-total (auto-computed) / Delete-row action; emits `add`, `update`, `remove`; mobile-responsive (horizontal scroll on small viewports); inputs use `h-9 rounded-lg` per constitution XIV
- [X] T006 [P] Create `src/components/pengusulan/ProposalPreviewModal.vue` — full-proposal preview modal wrapping `Modal.vue`; reads all data from `usePengusulanDraftStore` and `usePekebunStore`; renders sections: Paket Terpilih, Dokumen Persyaratan (with per-doc preview button via `<iframe>`/`<img>`), Gudang Serah Terima (conditional), RAB table (readonly), RAB bertandatangan preview, Pekebun & Lahan list; supports inline document preview without closing modal
- [X] T007 [P] Create `src/components/ui/DocumentPreviewModal.vue` — simple single-document preview modal (reusable slot for `<iframe src="dataUrl">` for PDF, `<img>` for images); accepts `{ open, title, dataUrl, mimeType }` props; used by both ProposalPreviewModal and step components

**Checkpoint**: All shared components render without errors. Can be imported into step files.

---

## Phase 3: User Story 1 — Paket Sarpras & Dokumen (Priority: P1) 🎯 MVP

**Goal**: Pemohon can select 1-of-9 paket types, view per-paket document requirements, download format templates, upload required documents, preview uploaded documents, and fill in Gudang Serah Terima (only for Ekstensifikasi / Intensifikasi) — then advance to Step 2 only when all wajib documents are uploaded (and Gudang fields filled if applicable).

**Independent Test**: Navigate to `/pengusulan/baru`, verify 9 paket cards appear, select "Ekstensifikasi", confirm persyaratan list and Gudang section appear, upload a document, preview it, attempt to advance without full completion (expect validation block), complete all required fields, advance to Step 2 successfully.

### Implementation for User Story 1

- [X] T008 [US1] Rewrite `src/views/pengusulan/StepPaketSarpras.vue` — render 9 paket selection cards from `PAKET_OPTIONS` (icon, label, description, selected highlight `#066C2A` ring); on paket select call `store.setPaket()` with confirmation dialog when switching away from a pupuk paket that already has Gudang data; read persyaratan list from `PAKET_PERSYARATAN_CONFIG[selectedPaket]`
- [X] T009 [US1] Within `StepPaketSarpras.vue` — implement "Persyaratan Dokumen" section: render each `PersyaratanDokumen` as a card row showing nama, wajib badge, download-format button (if `formatDownloadUrl` present — triggers `<a download>` link), and upload slot; for each slot show either "Belum Diunggah" state or uploaded file name + size + "Pratinjau" button + "Hapus" button; call `store.addDokumenUpload()` / `store.removeDokumenUpload()` on file change; file input restricted to PDF/JPG/PNG, max 10 MB
- [X] T010 [US1] Within `StepPaketSarpras.vue` — wire "Pratinjau" button on uploaded documents to open `DocumentPreviewModal.vue` with the `dataUrl` and `mimeType` from the stored `DokumenUpload`
- [X] T011 [US1] Within `StepPaketSarpras.vue` — implement conditional "Gudang Serah Terima" section (v-if `store.isPupukPaket`): Alamat text input, Koordinat text input, Upload Foto Tampak Depan slot, Upload Foto Tampak Dalam slot (JPG/PNG/WebP, max 5 MB each); bind all fields to `store.setGudang()`; show inline validation messages for empty required fields on advance attempt
- [X] T012 [US1] Within `StepPaketSarpras.vue` — implement step validation gate: "Lanjut ke Step 2" button disabled / shows validation toast when `!store.isStep1Valid`; enumerate missing items in toast message (e.g. "Dokumen wajib belum diunggah: Proposal Usulan, STDB Pekebun")

**Checkpoint**: User Story 1 fully functional. All 9 pakets selectable. Persyaratan display + upload + preview + gudang work. Validation gate blocks advancement. `vue-tsc -b` passes.

---

## Phase 4: User Story 2 — Pengisian RAB (Priority: P1)

**Goal**: Pemohon can add/edit/delete rows in the RAB table (with auto-computed sub-totals and grand total), download the RAB as a file, upload the signed RAB, and preview the signed RAB — then advance to Step 3 only when at least 1 RAB row is present and the signed RAB is uploaded.

**Independent Test**: Navigate directly to Step 2 (or advance from Step 1), add 2+ RAB rows, verify sub-totals compute automatically, click "Unduh RAB" and verify download, upload a signed PDF, preview it, attempt advance without signed RAB (expect block), complete and advance to Step 3.

### Implementation for User Story 2

- [X] T013 [US2] Create `src/views/pengusulan/StepRAB.vue` — step wrapper `Card` with title "Step 2: Rencana Anggaran Biaya"; integrate `RabTable.vue` component, wiring `add` / `update` / `remove` emits to `store.addRabItem()`, `store.updateRabItem()`, `store.removeRabItem()`; display grand total row (formatted `Rp X.XXX.XXX`) below table
- [X] T014 [US2] Within `StepRAB.vue` — implement "Unduh RAB" button: build a CSV Blob from `store.rabItems` (columns: Tahap, Uraian, Volume, Satuan, Harga Satuan, Sub-total) and trigger browser download via `URL.createObjectURL(blob)` with filename `RAB-Usulan-{date}.csv`; add explicit comment: `// CLIENT-SIMULATED: Real implementation requires GET /api/v1/pengusulan/rab-template`
- [X] T015 [US2] Within `StepRAB.vue` — implement "Upload RAB Bertandatangan" section: `FileUpload.vue` restricted to PDF only, max 10 MB; on upload convert to `DokumenUpload` object and call `store.setRabDitandatangani()`; show upload confirmation card with filename, size, "Pratinjau" button, "Hapus" button
- [X] T016 [US2] Within `StepRAB.vue` — wire "Pratinjau" button on signed RAB to open `DocumentPreviewModal.vue`
- [X] T017 [US2] Within `StepRAB.vue` — implement step validation gate: "Lanjut ke Step 3" button checks `store.isStep2Valid`; if not, shows toast "Lengkapi RAB: minimal 1 baris harus diisi dan RAB bertandatangan harus diunggah"

**Checkpoint**: User Story 2 fully functional. RAB table CRUD + auto-subtotal + download + upload + preview + validation gate all work. `vue-tsc -b` passes.

---

## Phase 5: User Story 3 — Pilih Pekebun, Lahan & Submit (Priority: P1)

**Goal**: Pemohon can select pekebun from the master data list, select lahan per pekebun, preview the complete proposal (with inline document previews), and submit — receiving a success toast with a registration number and being redirected to the tracking page.

**Independent Test**: Navigate to Step 3, verify pekebun list renders, select a pekebun, verify lahan appear, select lahan, click "Pratinjau Proposal" — verify modal shows full summary with clickable document previews, close modal, click "Submit Proposal", verify success toast with nomorResi and redirect to `/pengusulan/tracking`, verify new entry appears in tracking list.

### Implementation for User Story 3

- [X] T018 [US3] Create `src/views/pengusulan/StepPilihPekebunLahan.vue` — step wrapper `Card` with title "Step 3: Pilih Pekebun & Lahan"; read `usePekebunStore().listPekebun` to render pekebun list; each pekebun row shows nama, NIK, checkbox for selection; call `store.setSelectedPekebun(ids)` on change; show empty state if no pekebun available ("Belum ada pekebun terdaftar — daftar pekebun terlebih dahulu di modul Master Data")
- [X] T019 [US3] Within `StepPilihPekebunLahan.vue` — for each selected pekebun, render their `daftarLahan` list with checkboxes (lahan ID, nomor surat, luas hektar); call `store.setSelectedLahan(ids)` on change
- [X] T020 [US3] Within `StepPilihPekebunLahan.vue` — implement "Pratinjau Proposal" button that opens `ProposalPreviewModal.vue` with `open: true`
- [X] T021 [US3] Within `StepPilihPekebunLahan.vue` — implement "Submit Proposal" button: on click, call `store.submitProposal()` which calls `usePengusulanStore().createPengajuan(payload)` with all draft data; on success, show `toast.success()` with nomorResi, call `store.resetDraft()`, navigate to `/pengusulan/tracking`; on error show `toast.error()`; button shows loading state during submission; add comment: `// CLIENT-SIMULATED: Real implementation requires POST /api/v1/pengusulan`
- [X] T022 [US3] Within `StepPilihPekebunLahan.vue` — implement submit validation gate: "Submit Proposal" button is disabled when `!store.isStep3Valid`; show toast "Pilih minimal 1 pekebun dan 1 lahan sebelum submit"

**Checkpoint**: User Story 3 fully functional. Pekebun + lahan selection, proposal preview, submit + success feedback all work. `vue-tsc -b` passes.

---

## Phase 6: Wizard Shell Integration

**Purpose**: Wire all 3 steps into the updated `FormPengusulanView.vue` multi-step shell. Depends on all step components (US1–US3) being complete.

- [X] T023 Rewrite `src/views/pengusulan/FormPengusulanView.vue` — replace current 5-step wizard with 3-step wizard; update `steps` array to 3 entries: [{ id: 1, title: 'Paket & Dokumen', icon: Package }, { id: 2, title: 'RAB', icon: FileText }, { id: 3, title: 'Pekebun & Submit', icon: Users }]; render `StepPaketSarpras` / `StepRAB` / `StepPilihPekebunLahan` via `defineAsyncComponent` lazy imports with `Skeleton.vue` fallback
- [X] T024 Within `FormPengusulanView.vue` — implement step navigation: "Kembali" button decrements step; "Lanjut" button is controlled by step component validation gates (step component emits `@valid` or parent reads store getters `isStep1Valid` / `isStep2Valid`); remove direct `handleNext` bypass; scroll to top on step change
- [X] T025 Within `FormPengusulanView.vue` — initialize `usePengusulanDraftStore()` and call `store.resetDraft()` on component `onMounted` to clear any stale draft from a previous session
- [X] T026 Within `FormPengusulanView.vue` — update breadcrumbs to: `[{ label: 'Beranda', to: '/dashboard' }, { label: 'Pengusulan Sarpras', to: '/pengusulan/tracking' }, { label: 'Usulan Baru — 3 Langkah' }]`

**Checkpoint**: Full 3-step wizard flows end-to-end. Navigation, step persistence, and submission all work correctly.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass, responsive checks, TypeScript validation, build verification.

- [X] T027 [P] Audit responsive behaviour on mobile (360px viewport): RAB table horizontal scroll, paket card grid stacks to 1-col, Gudang photo uploads stack vertically — fix any layout overflow issues per constitution VII
- [X] T028 [P] Verify all toast notifications use `useToast()` (no `alert()`/`confirm()` calls) across all new/modified files — per constitution XI
- [X] T029 [P] Audit typography and spacing in all new components — base text 13–14px, section headers ≤18px, buttons/inputs `h-9`–`h-10`, `rounded-lg` — per constitution XIV
- [X] T030 Run `npx vue-tsc -b` — resolve ALL TypeScript errors in new and modified files
- [X] T031 Run `npm run build` — confirm production build completes with 0 errors
- [X] T032 Execute quickstart.md validation scenarios 1–7 manually — document any deviations

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup: types + store + config)
  └── Phase 2 (Foundational: shared components)
        └── Phase 3 (US1: StepPaketSarpras)  ─┐
        └── Phase 4 (US2: StepRAB)             ├── can run in parallel
        └── Phase 5 (US3: StepPilihPekebunLahan) ─┘
              └── Phase 6 (Wizard Shell: FormPengusulanView)
                    └── Phase 7 (Polish)
```

### User Story Dependencies

- **US1 (Step 1)**: Needs Phase 1 + Phase 2 (DocumentPreviewModal) ✅
- **US2 (Step 2)**: Needs Phase 1 + Phase 2 (RabTable, DocumentPreviewModal) ✅
- **US3 (Step 3)**: Needs Phase 1 + Phase 2 (ProposalPreviewModal) ✅
- **US1, US2, US3** can all be implemented in parallel once Phase 2 is done

### Within Each User Story

- Types/store (Phase 1) → component reads store → component validates → wizard shell integrates

### Parallel Opportunities

- T005, T006, T007 (Phase 2 shared components) — fully parallel
- T008–T012 (US1), T013–T017 (US2), T018–T022 (US3) — all three groups parallelisable once Phase 2 done
- T027, T028, T029 (Polish audits) — fully parallel

---

## Parallel Execution Examples

```
# Phase 2 — all 3 components in parallel:
Task T005: "Create RabTable.vue in src/components/pengusulan/"
Task T006: "Create ProposalPreviewModal.vue in src/components/pengusulan/"
Task T007: "Create DocumentPreviewModal.vue in src/components/ui/"

# Phase 3+4+5 — all 3 step components in parallel (once Phase 2 done):
Task T008–T012: "StepPaketSarpras.vue rewrite (US1)"
Task T013–T017: "StepRAB.vue creation (US2)"
Task T018–T022: "StepPilihPekebunLahan.vue creation (US3)"
```

---

## Implementation Strategy

### MVP First (Phases 1–3 → Step 1 working)

1. Complete Phase 1: Types + Store + Config
2. Complete T007 (DocumentPreviewModal — needed for US1 preview)
3. Complete Phase 3: US1 (StepPaketSarpras)
4. Wire T023 partially (wizard shell rendering only Step 1)
5. **STOP and VALIDATE**: Step 1 fully usable — paket selection + upload + preview + gudang + validation gate
6. Demo / validate before proceeding to Step 2

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 (US1) → Step 1 MVP ✅
3. Phase 4 (US2) → Step 2 added ✅
4. Phase 5 (US3) → Step 3 + Submit ✅
5. Phase 6 → Full wizard integrated ✅
6. Phase 7 → Polish + build verified ✅

---

## Notes

- All file uploads are client-side only (dataUrl / ObjectURL) — no real backend calls per Constitution XIII
- `store.resetDraft()` must be called on wizard mount to avoid carrying over stale draft data
- `RabTable.vue` sub-total column must be `readonly` (computed, not bound to input) — prevent manual override
- When switching paket while Gudang data exists, use `window.confirm()` replacement via a small inline confirmation UI (no browser `confirm()` per Constitution XI)
- Backward compatibility: existing mock data in `pengusulanStore.ts` uses old `JenisSarpras` values — do NOT remove old enum members
