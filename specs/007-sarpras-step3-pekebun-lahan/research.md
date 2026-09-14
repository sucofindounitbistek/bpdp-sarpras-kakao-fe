# Research: Step 3 Pengajuan Sarpras — Pekebun & Lahan, Dokumen Kepemilikan, Validasi Minimum Paket

**Feature**: `007-sarpras-step3-pekebun-lahan`
**Phase**: 0 — Outline & Research
**Date**: 2026-07-31

---

## Existing Codebase Findings

### Current Step 3 (`StepPilihPekebunLahan.vue`)

- Displays pekebun list as flat cards; selecting a pekebun shows a separate "Pilih Lahan" section below
- Pekebun and lahan are selected independently — no combined tree view
- `LahanPekebun` is a **singular** field on `Pekebun` (one pekebun = one lahan), not an array
- No document ownership type selection exists
- `isStep3Valid` only checks: `selectedPekebunIds.length > 0 && selectedLahanIds.length > 0`
- No minimum paket validation exists

### Current Draft Store (`pengusulanDraft.ts`)

- `selectedPekebunIds: string[]` — flat list of pekebun IDs
- `selectedLahanIds: string[]` — flat list of lahan IDs (no mapping to pekebun)
- `setSelectedPekebun()` clears all lahan selections when pekebun list changes
- No per-lahan document ownership data
- No minimum paket validation logic

### Pekebun Type (`Pekebun`)

- `lahan: LahanPekebun` (singular, not array) — one pekebun has exactly one lahan
- `LahanPekebun` has `jenisLegalitas: JenisLegalitas` (enum: `SHM | NON_SHM`)
- `LahanPekebun` has `nomorLegalitas: string` — existing document number
- `LahanPekebun` has `luasLahan: number` (hectares) — needed for validation

### Paket Options Config (`pengusulan-persyaratan.config.ts`)

- `PAKET_OPTIONS` array with 11 entries (all `JenisSarpras` values)
- Each option has `id`, `label`, `icon`, `description`, `isPupuk`, `persyaratan`
- No minimum pekebun/luas requirements currently defined

### ProposalPreviewModal

- Section 5 shows selected pekebun with simple "lahan dipilih" indicator
- No document ownership info displayed
- Total pekebun count and total luas not shown

---

## Design Decisions

### 1. Combined Tree View: Single Section vs Two Sections

- **Decision**: Replace current two-section layout (pekebun list + separate lahan list) with a single combined tree hierarchy where each pekebun card shows its lahan inline
- **Rationale**: Spec FR-001 requires combined view; current pattern already shows lahan under selected pekebun but in a separate section — moving lahan into the pekebun card itself eliminates the need for a second "Pilih Lahan" section and matches the spec's "tampilan gabungan"
- **Alternative rejected**: Accordion pattern — adds unnecessary click to expand; simple inline list is faster for selection

### 2. Lahan Document Ownership: New Per-Lahan State

- **Decision**: Store per-lahan document ownership in a `Map<string, LahanDokumenOwnership>` within the draft store, keyed by `lahanId`
- **Rationale**: FR-004 through FR-007 require per-lahan document selection; flat `selectedLahanIds` array cannot carry document metadata; `Map` provides O(1) lookup per lahan
- **Alternative rejected**: Array of `{lahanId, jenisDokumen, nomorDokumen}` — verbose for lookups; `Record<string, LahanDokumenOwnership>` — reactive limitations in Vue 3 (ref-wrapped Map is fine)

### 3. Minimum Paket Validation: Static Config

- **Decision**: Define `PAKET_MINIMUM_REQUIREMENTS` as a static `Record<JenisSarpras, PaketMinimumRule | null>` in `pengusulan-persyaratan.config.ts`
- **Rationale**: No backend endpoint confirmed for fetching minimum requirements (Constitution XIII); static config is easily swappable once backend exposes endpoint; table data is known and unlikely to change frequently
- **Alternative rejected**: Fetch from API — no endpoint exists; hardcode in component — harder to maintain and violates separation of config from UI

### 4. Validation Logic: "dan/atau" = OR

- **Decision**: Validation passes if `(totalPekebun >= minimumPekebun) OR (totalLuas >= minimumLuasHa)`
- **Rationale**: Spec FR-009 explicitly defines "dan/atau" as OR logic; user confirmed this interpretation; simpler to implement than AND
- **Alternative rejected**: AND logic — would make validation stricter than intended

### 5. Validation Display: Real-time Status Bar

- **Decision**: Add a persistent status bar at the top of the Step 3 content showing: total pekebun, total luas, minimum requirement, pass/fail indicator
- **Rationale**: FR-010 requires real-time status; FR-011 requires informative warning messages; a status bar provides constant visibility without requiring the user to scroll
- **Alternative rejected**: Inline validation per pekebun — not applicable since minimum is checked against totals, not per-entry

### 6. Jarak Antar Kebun: Informational Only

- **Decision**: Display jarak requirement as a note below the status bar for applicable paket types (Alat Transportasi sub-types, Mesin Pertanian); no automatic validation
- **Rationale**: Spec FR-012 explicitly states validation is done by field officers; frontend cannot compute distance without geospatial data
- **Alternative rejected**: Attempting to calculate distance from coordinates — unreliable without proper geospatial library

### 7. Sub-Component Extraction: LahanDocumentFields

- **Decision**: Extract document ownership fields (jenis dropdown, nomor input, jenisDokumenLainnya input) into a composable inline pattern rather than a separate component
- **Rationale**: YAGNI (Constitution V); fields are simple and tightly coupled to the lahan card context; extracting to a component would add prop-passing complexity for 3 fields
- **Alternative rejected**: Separate `LahanDocumentSelect.vue` component — premature abstraction for 3 fields in a single workflow step

### 8. Pekebun Selection: Select All Lahan

- **Decision**: When a pekebun is checked, automatically select its lahan and initialize document ownership fields with defaults
- **Rationale**: Spec FR-002 requires "select all" behavior; since `LahanPekebun` is singular per pekebun, checking a pekebun = checking its single lahan
- **Alternative rejected**: Manual lahan selection after pekebun selection — adds unnecessary step

### 9. ProposalPreviewModal Update: Add Lahan Document Info

- **Decision**: Extend Section 5 in `ProposalPreviewModal` to show: total pekebun count, total luas, lahan document type and number per selected lahan
- **Rationale**: Spec FR-005 acceptance scenario 5 requires document info in preview; preview already shows pekebun list, needs minimal extension
- **Alternative rejected**: Separate preview section for documents — adds visual clutter

---

## Backend Contract Status

No new backend endpoints needed:
- Pekebun/lahan data: already from `usePekebunStore` (mock data)
- Submit: existing `POST /pengusulan` endpoint unchanged (mock in current implementation)
- Minimum requirements: static config per Constitution XIII

**Approach**: All additions are client-side UI and validation. No contract document needed.

---

## NEEDS CLARIFICATION: All Resolved

No unresolved clarifications. All design decisions above address potential ambiguities from the spec.