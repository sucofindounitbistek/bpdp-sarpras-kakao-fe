# Feature Specification: Proposal & RAB Store API Alignment

**Feature Branch**: `039-proposal-rab-api-alignment`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "create or adjust store function and its types of pengusulan @[src/stores/pengusulan.ts] @[src/types/pengusulan.ts] to use real api from api documentation/contract in @[PROPOSAL_API_CONTRACT.md] . Rename some of the key or variable according to the api documentation, like example noResi actually nomor_proposal in the api, gudangSerahTerima actually storage_area in the api (also for the interior and exterior). rabDitandatangani actually comes from the documents in the api and etc. Rename and adjust some of the key and variable in some pages that use the store and type (also with another store that use the same type). Add new store (store func and global variable) and types for rab."

## Clarifications

### Session 2026-08-24
- Q: How should multi-stage RAB breakdown (`jumlahTahap1`, `jumlahTahap2`, `jenis`) be serialized to the backend contract? → A: Option A - Serialize `jumlahTahap1`, `jumlahTahap2`, and `jenis` into the `details` JSONB object while computing top-level `volume = (jumlahTahap1 ?? 0) + (jumlahTahap2 ?? 0)` and `item_type` as `BARANG` / `JASA` (or `LAINNYA`).
- Q: Does proposal creation require a sequential 3-step API submission flow (1. POST proposal, 2. POST documents bulk, 3. POST RAB) inside a single store orchestration function? → A: Yes. The proposal submission function (`submitFullProposal` / `submitProposal`) MUST execute a 3-step sequential API pipeline in order: (1) `POST /api/v1/proposals` creating the proposal header, assigned `lahan_ids`, and `storage_area`; (2) `POST /api/v1/proposals/:proposal_id/documents/bulk` attaching all uploaded files; and (3) `POST /api/v1/rabs` creating the itemized budget plan.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Farmer Institution Submits & Tracks Proposals via Sequential API Pipeline (Priority: P1)

As a farmer cooperative/institution user (Kelembagaan Pemohon), I want to submit a complete proposal through an orchestrated 3-step API flow (proposal header + storage, bulk documents, and budget plan) and track its status using standard proposal identifiers (`nomor_proposal`), associated land plots (`lahan_ids`), and storage facilities (`storage_area`), so that all proposal metadata strictly conforms to the backend database schema and REST API contract.

**Why this priority**: Core business capability. Complete proposal submission and status tracking is the foundational workflow of the entire Sarpras Kelapa ecosystem.

**Independent Test**: Can be tested by completing the 3-step proposal wizard, clicking submit, observing the sequential execution of `POST /api/v1/proposals`, `POST /api/v1/proposals/:id/documents/bulk`, and `POST /api/v1/rabs`, and verifying that the resulting proposal is retrieved via `GET /api/v1/proposals/:id` and listed in the proposal tracking table.

**Acceptance Scenarios**:
1. **Given** valid kelembagaan data, selected sarpras package, uploaded documents, line items, and assigned land plot IDs, **When** the user submits the proposal, **Then** the store sequentially executes:
   1. `POST /api/v1/proposals` (with `kelembagaan_id`, `paket_sarpras`, `nomor_proposal`, `detail_usulan`, `lahan_ids`, `storage_area`), receiving `{ id, nomor_proposal, status }`.
   2. `POST /api/v1/proposals/:proposal_id/documents/bulk` (with all uploaded `file_id`s and uppercase `document_type`s).
   3. `POST /api/v1/rabs` (with line items, volumes, unit prices, and stage details in JSONB).
   4. Returns the created proposal ID and `nomor_proposal`.
2. **Given** an existing proposal, **When** the user navigates to the proposal tracking page, **Then** the list displays records with `nomor_proposal`, `paket_sarpras`, `total_anggaran`, and current workflow `status` fetched from `GET /api/v1/proposals`.
3. **Given** an open proposal detail view, **When** the user views the facility information, **Then** storage details (`storage_area.address`, `storage_area.coordinate`, `storage_area.interior_photo_file_url`, `storage_area.exterior_photo_file_url`) are rendered accurately.

---

### User Story 2 - Dedicated Budget Plan (RAB) Management & Calculations (Priority: P2)

As a farmer cooperative user or administrative reviewer, I want a dedicated Budget Plan (RAB) state store and type system that supports creating, viewing, updating, and synchronizing line items (`items`) with automatic `total_price` calculations, multi-stage details serialization, and parent proposal budget alignment (`total_anggaran`), so that budget allocations are transparent, modular, and accurately tracked.

**Why this priority**: Financial accuracy is essential for proposal validation, verification, and disbursement approval across Dinas and BPDPKS.

**Independent Test**: Can be tested by adding line items with specific volume and unit price in the RAB form, verifying real-time subtotal/total calculations, sending `POST /api/v1/rabs` or `PUT /api/v1/rabs/:id` with stage details in JSON, and confirming that the proposal aggregate reflects the synchronized `total_anggaran`.

**Acceptance Scenarios**:
1. **Given** an active proposal without an existing budget plan, **When** the user inputs line items with `uraian`, `volume`, `unit`, `price_per_unit`, `item_type` (`BARANG` / `JASA` / `LAINNYA`), and stage breakdown (`jumlahTahap1`, `jumlahTahap2`, `jenis`), **Then** the dedicated RAB store computes item total prices (`volume * price_per_unit`), embeds stage breakdown in `details` JSON, submits `POST /api/v1/rabs`, and updates the proposal total budget.
2. **Given** an existing proposal with an attached RAB, **When** the user or verifier opens the budget tab, **Then** the system loads the RAB structure via `GET /api/v1/rabs/proposal/:proposal_id` with active line items, stage breakdown restored from `details`, and stage flags (`PROPOSAL`, `VERIFIKASI`, `REKOMTEK`, `FINAL`).
3. **Given** a revised budget plan, **When** line items are edited or added, **Then** `PUT /api/v1/rabs/:id` updates the items and recalculates the aggregated `total_anggaran`.

---

### User Story 3 - Proposal Document Attachment & Full Synchronization (Priority: P3)

As a proposal creator or verifier, I want attached documents (such as Surat Permohonan, Legalitas Kelembagaan, Surat Pernyataan Keabsahan, and signed statement/SPTJM) to be managed and synchronized via the backend documents contract (`/api/v1/proposals/:proposal_id/documents`), so that all uploaded files are tied to canonical document types and accessible via presigned URLs.

**Why this priority**: Required for administrative and legal completeness before proposals can move forward in verification queues.

**Independent Test**: Can be tested by uploading mandatory proposal documents, verifying bulk attachment via `POST /api/v1/proposals/:proposal_id/documents/bulk` or bulk sync via `PUT /api/v1/proposals/:proposal_id/documents`, and retrieving previewable file URLs.

**Acceptance Scenarios**:
1. **Given** uploaded proposal documents, **When** the user completes proposal document submission, **Then** documents are synchronized with uppercase canonical document types (`SURAT_PERMOHONAN`, `DOKUMEN_LEGALITAS_KELEMBAGAAN`, `SURAT_PERNYATAAN_KEABSAHAN`, `PROPOSAL_TEKNIS`, `SPTJM`, `DOKUMEN_PENDUKUNG`).
2. **Given** a proposal detail preview, **When** a user clicks on an attached document or signed RAB document, **Then** the file opens via its backend-provided `file_url`.

---

### User Story 4 - Multi-Role Proposal Review, Queue & Detail Alignment (Priority: P4)

As a Dinas Kabupaten, Dinas Provinsi, or Ditjenbun verifier, I want all verification queues, review tables, filter inputs, and preview modals to reference the standardized property names (`nomor_proposal`, `storage_area`, `documents`, `rabs`, and contract-aligned statuses), so that reviewers have a consistent and bug-free experience across all roles.

**Why this priority**: Ensures end-to-end operational integrity across all administrative review interfaces.

**Independent Test**: Can be tested by logging in as Dinas Kabupaten/Provinsi, filtering proposals by `nomor_proposal` or status, opening proposal details, and reviewing storage validity and document attachments.

**Acceptance Scenarios**:
1. **Given** an administrative reviewer navigating the verification queue, **When** searching by proposal number, **Then** the search filters on `nomor_proposal` and displays accurate table rows.
2. **Given** a reviewer checking storage facility compliance, **When** inspecting the storage tab, **Then** interior and exterior photos and GPS coordinates from `storage_area` are rendered properly with validation toggle controls.

---

### Edge Cases

- **Partial Pipeline Failure**: If Step 1 (`POST proposals`) succeeds but Step 2 (`POST documents/bulk`) or Step 3 (`POST rabs`) fails, the proposal remains in `DRAFT` status with the assigned ID. The error message from backend MUST be displayed via Toaster, allowing the user to retry document attachment or budget creation without creating duplicate proposal headers.
- **Missing Storage Area**: Non-fertilizer/seed packages (e.g. infrastructure or road packages) may not require storage facilities; the system must gracefully handle `storage_area: null` in creation, updates, and UI previews without throwing null reference errors.
- **RAB Conflict (`409 Conflict`)**: Attempting to create a duplicate RAB for a proposal that already owns one must be prevented in the UI and handled gracefully if returned by the backend by switching to update mode (`PUT /api/v1/rabs/:id`).
- **Empty or Partial Document Sync**: When synchronizing documents, omitting existing document types must trigger deletion on the backend; the UI must prompt for confirmation when removing previously uploaded documents.
- **Large Line Item Counts in RAB**: Proposal budget tables with dozens of items must calculate totals with numeric precision without rounding errors or UI lag.
- **Legacy Mock Data Transition**: Existing stored sessions in local storage must be migrated or gracefully handled without breaking active browser tabs.

---

## Requirements *(mandatory)*

### Functional Requirements

#### 1. Proposal Types & Domain Model Alignment
- **FR-001**: The system MUST define TypeScript interfaces matching the backend Proposal contract:
  - `Proposal` / `PengajuanSarpras`: `id` (number/string), `nomor_proposal` (string), `kelembagaan_id` (number), `paket_sarpras` (string), `detail_usulan` (string), `total_anggaran` (number), `no_rekomtek` (string | null), `bentuk_bantuan` (string | null), `status` (`DRAFT` | `SUBMITTED` | `VERIFIED` | `APPROVED` | `REJECTED`), `created_at` (string), `updated_at` (string).
  - `StorageArea` / `GudangSerahTerima`: `id` (number), `proposal_id` (number), `address` (string), `coordinate` (string), `interior_photo_file_id` (number | null), `interior_photo_file_url` (string | null), `exterior_photo_file_id` (number | null), `exterior_photo_file_url` (string | null), `coordinate_is_valid` (boolean | null), `address_is_valid` (boolean | null), `interior_photo_is_valid` (boolean | null), `exterior_photo_is_valid` (boolean | null).
  - `ProposalDocument`: `id` (number), `proposal_id` (number), `file_id` (number), `document_type` (`SURAT_PERMOHONAN` | `DOKUMEN_LEGALITAS_KELEMBAGAAN` | `SURAT_PERNYATAAN_KEABSAHAN` | `PROPOSAL_TEKNIS` | `SPTJM` | `DOKUMEN_PENDUKUNG` | string), `file_name` (string), `file_url` (string), `file_size` (number | string), `file_extension` (string), `mime_type` (string), `created_at` (string), `updated_at` (string).
  - `ProposalDetailResponse`: Full aggregate containing proposal fields, `storage_area`, `pekebuns` (with land plots and identity documents), `documents`, and `rabs`.

#### 2. Proposal State Store (`usePengusulanStore`) & Orchestrated Submission
- **FR-002**: The proposal store MUST expose reactive state:
  - `proposals` (list of proposals) / `listPengajuan`
  - `activeProposal` / `activePengajuan` (currently selected proposal aggregate)
  - `pagination` (page, limit, total)
  - `isLoading` (boolean)
  - `error` (string | null)
- **FR-003**: The proposal store MUST implement API actions conforming to the contract:
  - `fetchProposals(params)`: `GET /api/v1/proposals` with query parameters (`page`, `limit`, `search`, `status`, `start_date`, `end_date`, `sort_by`, `sort_order`).
  - `getProposalDetail(id)`: `GET /api/v1/proposals/:id` returning full aggregate.
  - `createProposal(payload)`: `POST /api/v1/proposals` sending `kelembagaan_id`, `paket_sarpras`, `nomor_proposal`, `detail_usulan`, `no_rekomtek`, `bentuk_bantuan`, `lahan_ids`, and `storage_area`.
  - `updateProposal(id, payload)`: `PATCH /api/v1/proposals/:id` for partial updates, storage modifications, and land assignments.
  - `deleteProposal(id)`: `DELETE /api/v1/proposals/:id` for soft deletion.
  - `syncProposalDocuments(proposalId, documents)`: `PUT /api/v1/proposals/:proposal_id/documents` for bulk synchronization.
- **FR-003b**: The proposal submission workflow (`submitFullProposal` in `usePengusulanDraftStore` / `usePengusulanStore`) MUST orchestrate the 3-step sequential API submission:
  1. `POST /api/v1/proposals` with header info, `lahan_ids`, and optional `storage_area`.
  2. `POST /api/v1/proposals/:id/documents/bulk` attaching all uploaded files.
  3. `POST /api/v1/rabs` creating the RAB budget items with stage details in JSONB.
  4. Hydrates and returns the final created proposal.
- **FR-004**: The proposal store MUST provide backward compatibility getters / mappers where needed so that existing components transition smoothly without breaking build checks.

#### 3. Dedicated Budget Plan (RAB) Store & Types (`useRabStore` & `src/types/rab.ts`)
- **FR-005**: The system MUST define dedicated TypeScript interfaces for RAB:
  - `RabProposal`: `id` (number), `proposal_id` (number), `flag` (`PROPOSAL` | `VERIFIKASI` | `REKOMTEK` | `FINAL`), `items` (`RabItem[]`), `created_at` (string), `updated_at` (string).
  - `RabItem`: `id` (number | string), `rab_proposal_id` (number | null), `uraian` (string), `volume` (number), `unit` (string), `price_per_unit` (number), `item_type` (`BARANG` | `JASA` | `LAINNYA`), `total_price` (number), `details` (Record<string, any> | null).
  - `CreateRabPayload`: `{ proposal_id: number; flag?: string; items: CreateRabItemPayload[] }`.
  - `UpdateRabPayload`: `{ flag?: string; items: UpdateRabItemPayload[] }`.
  - The system MUST serialize multi-stage inputs (`jumlahTahap1`, `jumlahTahap2`, `jenis`) into the `details` JSONB object while assigning `volume = (jumlahTahap1 ?? 0) + (jumlahTahap2 ?? 0)` and `total_price = volume * price_per_unit`.
- **FR-006**: The dedicated RAB store (`useRabStore`) MUST provide:
  - State: `activeRab` (`RabProposal | null`), `rabItems` (`RabItem[]`), `isLoading` (boolean), `error` (string | null).
  - Computed getters: `totalAnggaran` (sum of `total_price` of all items), `itemCount`, `barangItems`, `jasaItems`.
  - Actions:
    - `fetchRabByProposalId(proposalId)`: `GET /api/v1/rabs/proposal/:proposal_id`.
    - `createRab(payload)`: `POST /api/v1/rabs`.
    - `updateRab(id, payload)`: `PUT /api/v1/rabs/:id`.
    - `deleteRab(id)`: `DELETE /api/v1/rabs/:id`.
    - `setDraftItems(items)`: local state manipulation for draft creation.

#### 4. UI Components & Consuming Stores Variable Renaming
- **FR-007**: All UI views and consuming stores referencing legacy keys MUST be updated to contract keys:
  - `nomorResi` -> `nomor_proposal` (with fallback support during transition).
  - `gudangSerahTerima` -> `storage_area` (address, coordinate, interior photo, exterior photo).
  - `rabDitandatangani` -> accessed via proposal `documents` (e.g. document type `SPTJM` or attached budget document).
  - `totalAnggaranPengajuan` -> `total_anggaran`.
  - `jenisSarpras` -> `paket_sarpras`.
- **FR-008**: Views updated MUST include:
  - `src/views/pengusulan/*` (TrackingPengusulanView, StepPilihPekebunLahan, StepPaketSarpras, ProposalPreviewModal).
  - `src/stores/pengusulanDraft.ts` (draft proposal wizard integration).
  - `src/stores/rekomtek.ts` and `src/components/rekomtek/PratinjauPekebunDanDokumenTab.vue`.
  - `src/views/dinas/kabupaten/*` (DetailVerifikasiKabView, QueueVerifikasiKabView, StepVerifikasiPekebunDanDokumenProposal, StepSummaryDanSubmit).
  - `src/views/dinas/provinsi/*` (DetailVerifikasiProvinsiView, QueueVerifikasiProvinsiView, PratinjauPekebunDanDokumenProposal, StepSummaryDanSubmit).
  - `src/views/ditjenbun/PenetapanPlenoView.vue`.

---

### Key Entities *(include if feature involves data)*

- **Proposal (Proposal Aggregate)**: Represents the formal grant request submitted by a farmer cooperative (`Kelembagaan`). Contains package information (`paket_sarpras`), proposal tracking identifier (`nomor_proposal`), proposal description (`detail_usulan`), total budget (`total_anggaran`), technical recommendation number (`no_rekomtek`), form of assistance (`bentuk_bantuan`), and workflow review status (`status`).
- **Storage Area (`storage_area`)**: Physical warehouse/storage site designated for receiving agricultural supplies (fertilizers, seedlings, tools). Holds full street address, GPS coordinates, and interior/exterior verification photos.
- **Proposal Document (`documents`)**: Legal, technical, and administrative file attachments associated with the proposal, categorized by canonical document types (`SURAT_PERMOHONAN`, `DOKUMEN_LEGALITAS_KELEMBAGAAN`, `SURAT_PERNYATAAN_KEABSAHAN`, `PROPOSAL_TEKNIS`, `SPTJM`, `DOKUMEN_PENDUKUNG`).
- **Budget Plan (`RAB`)**: Itemized breakdown of proposed expenditures, containing line items with quantity (`volume`), unit of measure (`unit`), unit price (`price_per_unit`), category (`item_type`: `BARANG` / `JASA` / `LAINNYA`), computed total price, dynamic attribute details, and lifecycle flag (`PROPOSAL`, `VERIFIKASI`, `REKOMTEK`, `FINAL`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposal and budget plan API calls adhere strictly to the REST endpoints and JSON contracts defined in `PROPOSAL_API_CONTRACT.md`.
- **SC-002**: 100% of references to legacy property names (`nomorResi`, `gudangSerahTerima`, `rabDitandatangani`) across views and stores are migrated to canonical contract properties without regression.
- **SC-003**: 0 TypeScript compilation errors (`vue-tsc -b`) and 0 build errors (`vite build`) across the entire repository after renaming and store additions.
- **SC-004**: Real-time calculation of item subtotals and aggregated proposal budget produces exact numeric values across all budget editing interactions.
- **SC-005**: Proposal tracking and verification queue search and filtering function seamlessly with `nomor_proposal` and canonical workflow statuses.
- **SC-006**: The sequential 3-step proposal submission pipeline completes all 3 API requests in sequence and successfully returns the created proposal without orphaned child records.

---

## Assumptions

- **API Base URL**: The application communicates with the backend via the existing configured API service / Axios client (`@/services/api` or baseURL `/api/v1`).
- **File Upload Integration**: Photos and document files are first uploaded via `/api/v1/files` to obtain integer `file_id`s before being attached to proposals or storage areas.
- **State Persistence**: The draft wizard (`usePengusulanDraftStore`) remains session-based while submitted proposals and active review aggregates are managed via Pinia stores with appropriate reactivity.
- **Localization**: UI display labels for status, package names, and document types continue to leverage `src/config/localization.ts` per the project constitution.
