# Feature Specification: Direct Multi-Tier Pushback for Published SK Dirut Proposals

**Feature Branch**: `066-direct-multi-tier-pushback-sk-dirut`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "SK DIRUT Udah Upload / Selesai dengan status proposal SK_DIRUT_PUBLISHED. BPDP Verifikator (menu SK Dirut -> Detail Proposal Yang sudah publish SK Dirut) & BPDP Approval (menu Riwayat Selesai -> Detail Proposal = reuse / di component yang sama ApprovalBPDPView.vue). ada validasi dokumen (hanya button reject, tidak ada persetujuan dengan konteks hanya inspect namun ingin masih menolak dokumen). RAB_FINAL => Kabupaten, SK_CPCL => Kabupaten, BA_VERIFIKASI => Kabupaten, BA_VERIFIKASI_LAPANGAN => Kabupaten, SURAT_PENGANTAR_SK_CPCL => Provinsi, REKOMTEK => Ditjenbun Verifikator, KEPUTUSAN_KELAYAKAN => BPDP Verifikator. Ada button pushback di halaman diatas dengan catatan penolakan tiap dokumen. kumpulkan notes semua document yang terkena reject dikumpulkan jadi 1 variable nantinya akan mengpush menggunakan update function di proposal.service.ts dengan status tergantung user memilih antara Kabupaten, Provinsi, etc (sesuai pemilik dokumen diatas). Jika pushback ke kabupaten => status : REV_FROM_PROV, provinsi => status : REV_FROM_DITJEN_VERIF, ditjen_verif => status: REV_FROM_DITJEN_APPR, bpdp_Verif => status: REV_FROM_BPDP_APPR. Jika ada role dokumen yang tidak ditolak, maka disabled di option pilih untuk pushback"

## Clarifications

### Session 2026-09-01
- Q: Ke halaman manakah pengguna sebaiknya diarahkan setelah aksi pushback berhasil dieksekusi? → A: Option A (Mengarahkan kembali ke menu antrean/riwayat asal pengguna, yaitu `/bpdp/sk-dirut` untuk Verifikator atau `/bpdp/riwayat-selesai` untuk Approval, disertai Toast notifikasi sukses).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect & Reject Published Proposal Documents (Priority: P1)

As a BPDP Verifikator or BPDP Approval evaluator inspecting an already published proposal (`SK_DIRUT_PUBLISHED` or `SELESAI`), I want to audit/inspect the 7 official proposal documents with an exclusive **Tolak (Reject)** action and provide rejection notes per document, so that any compliance discrepancies discovered post-publication can be flagged for revision.

**Why this priority**: Core inspection interface that allows identifying invalid documents without requiring redundant approval clicks on already published records.

**Independent Test**: Open a proposal with status `SK_DIRUT_PUBLISHED` in the BPDP detail view, verify all 7 documents are listed with a "Tolak" button and document notes input upon rejection, and verify no "Approve" button is shown.

**Acceptance Scenarios**:

1. **Given** a proposal with status `SK_DIRUT_PUBLISHED`, **When** the BPDP user opens the detail page, **Then** the page is in Inspect Mode displaying 7 documents (`RAB_FINAL`, `SK_CPCL`, `BA_VERIFIKASI`, `BA_VERIFIKASI_LAPANGAN`, `SURAT_PENGANTAR_SK_CPCL`, `REKOMTEK`, `KEPUTUSAN_KELAYAKAN`).
2. **Given** a document in the inspection list, **When** the user clicks "Tolak", **Then** the document state switches to rejected and an input field for rejection notes is displayed.
3. **Given** no documents are rejected, **When** viewing the action bar, **Then** the "Kembalikan Usulan (Pushback)" button remains disabled.

---

### User Story 2 - Direct Multi-Tier Pushback Execution (Priority: P1)

As a BPDP Verifikator or BPDP Approval evaluator, I want to return/pushback a proposal with rejected documents directly to the responsible issuing tier (Kabupaten, Provinsi, Ditjenbun Verifikator, or BPDP Verifikator) with guardrails disabling tiers whose documents were not rejected, so that the proposal status is updated accurately and the aggregated rejection notes are saved.

**Why this priority**: Eliminates bureaucratic cascading bottlenecks by directly routing revisions to the exact tier responsible for the rejected documents.

**Independent Test**: Reject `SK_CPCL` and `SURAT_PENGANTAR_SK_CPCL`, click "Kembalikan Usulan", verify options for "Kabupaten" and "Provinsi" are enabled while "Ditjenbun Verifikator" and "BPDP Verifikator" are disabled. Selecting "Kabupaten" updates status to `REV_FROM_PROV` and redirects to the origin queue.

**Acceptance Scenarios**:

1. **Given** at least one document is rejected, **When** the user clicks "Kembalikan Usulan", **Then** a confirmation modal opens showing the available pushback target tiers.
2. **Given** only Kabupaten documents are rejected, **When** viewing the tier selection modal, **Then** "Dinas Kabupaten/Kota" is selectable and "Dinas Provinsi", "Ditjenbun Verifikator", "BPDP Verifikator" are disabled.
3. **Given** the user selects "Dinas Kabupaten/Kota", **When** confirming pushback, **Then** the proposal status transitions to `REV_FROM_PROV`, aggregated notes are saved, and a success notification is shown before redirecting to the origin page (`/bpdp/sk-dirut` for Verifikator, `/bpdp/riwayat-selesai` for Approval).

---

### User Story 3 - Unified Navigation from SK Dirut & Riwayat Selesai (Priority: P2)

As a BPDP Verifikator navigating from menu *SK Dirut* or a BPDP Approval user navigating from menu *Riwayat Selesai*, I want clicking "Tinjau" / "Lihat" on a published proposal to route to the shared `ApprovalBpdpView.vue` component, so that inspection and pushback capabilities are consistently accessible across both roles.

**Why this priority**: Ensures seamless UX and prevents navigation dead-ends or inconsistent read-only views for published proposals.

**Independent Test**: Navigate to `/bpdp/sk-dirut` as BPDP Verifikator and click "Tinjau" on a published proposal, confirming it opens `ApprovalBpdpView.vue`. Repeat from `/bpdp/riwayat-selesai` as BPDP Approval.

**Acceptance Scenarios**:

1. **Given** a BPDP Verifikator on `/bpdp/sk-dirut`, **When** clicking "Tinjau" on an item with status `SK_DIRUT_PUBLISHED`, **Then** the router navigates to `/bpdp/approval/:id`.
2. **Given** a BPDP Approval user on `/bpdp/riwayat-selesai`, **When** clicking "Lihat" on an item with status `SELESAI`, **Then** the router navigates to `/bpdp/approval/:id`.

---

### Edge Cases

- **No Rejection Notes Provided**: If a user marks a document as "Tolak" but leaves the notes field empty, the pushback action must be blocked and prompt the user to provide a specific reason.
- **Multiple Tiers Rejected**: If documents from both Kabupaten and Ditjenbun are rejected, both "Kabupaten" and "Ditjenbun Verifikator" options are enabled in the modal, allowing the evaluator to decide the initial return target.
- **Network Error During Pushback**: If the update request fails, a toast error message must be shown and the user remains on the page without losing their filled rejection notes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support Inspect Mode in `ApprovalBpdpView.vue` for proposals with status `SK_DIRUT_PUBLISHED` or `SELESAI`.
- **FR-002**: System MUST render all 7 mandatory documents in the inspection list:
  1. `RAB_FINAL` (Owner: Dinas Kabupaten/Kota)
  2. `SK_CPCL` (Owner: Dinas Kabupaten/Kota)
  3. `BA_VERIFIKASI` (Owner: Dinas Kabupaten/Kota)
  4. `BA_VERIFIKASI_LAPANGAN` (Owner: Dinas Kabupaten/Kota)
  5. `SURAT_PENGANTAR_SK_CPCL` (Owner: Dinas Provinsi)
  6. `REKOMTEK` (Owner: Ditjenbun Verifikator)
  7. `KEPUTUSAN_KELAYAKAN` (Owner: BPDP Verifikator)
- **FR-003**: System MUST provide a toggleable "Tolak" (Reject) button and an inline notes textarea for each document in Inspect Mode without displaying an "Approve" button.
- **FR-004**: System MUST enable the "Kembalikan Usulan (Pushback)" button only when at least one document is marked as rejected with non-empty notes.
- **FR-005**: System MUST present a pushback modal with the following 4 target tiers and status mappings:
  - **Dinas Kabupaten/Kota** ➔ Target Status: `REV_FROM_PROV` (Enabled if `RAB_FINAL`, `SK_CPCL`, `BA_VERIFIKASI`, or `BA_VERIFIKASI_LAPANGAN` is rejected)
  - **Dinas Provinsi** ➔ Target Status: `REV_FROM_DITJEN_VERIF` (Enabled if `SURAT_PENGANTAR_SK_CPCL` is rejected)
  - **Ditjenbun Verifikator** ➔ Target Status: `REV_FROM_DITJEN_APPR` (Enabled if `REKOMTEK` is rejected)
  - **BPDP Verifikator** ➔ Target Status: `REV_FROM_BPDP_APPR` (Enabled if `KEPUTUSAN_KELAYAKAN` is rejected)
- **FR-006**: System MUST disable any target tier option in the modal if none of its corresponding owner documents are marked as rejected.
- **FR-007**: System MUST consolidate all rejection notes into a structured summary string and dispatch the update using `proposal.service.ts` (`update(id, payload)` / `PATCH /proposals/:id`).
- **FR-008**: System MUST persist individual document validations using `proposal.service.ts` (`bulkProposalValidations`).
- **FR-009**: System MUST update action links in `SkDirutView.vue` and `RiwayatSelesaiView.vue` for published proposals to point to `/bpdp/approval/:id`, and redirect users back to their origin menu post-pushback.

### Key Entities

- **Proposal**: Main application entity with `status`, `nomor_proposal`, `documents`, and metadata.
- **ProposalDocument**: Document attachment record with `document_type` and `file_url`.
- **ProposalDocumentValidation**: Record storing inspection result (`is_valid`, `notes`, `document_type`, `validated_by_role`).
- **PushbackTierOption**: Definition of pushback target with `id`, `label`, `targetStatus`, `ownerRole`, and `isEnabled`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: BPDP evaluators can complete document rejection and initiate multi-tier pushback in under 1 minute.
- **SC-002**: 100% of invalid tier selections are prevented via automated disabled guardrails.
- **SC-003**: 100% of rejected document notes are consolidated and persisted to backend audit logs.
- **SC-004**: Both BPDP Verifikator and BPDP Approval roles have seamless access to inspect, push back published proposals, and return to their origin queues.

## Assumptions

- The backend `PATCH /proposals/:id` endpoint accepts status updates for `REV_FROM_PROV`, `REV_FROM_DITJEN_VERIF`, `REV_FROM_DITJEN_APPR`, and `REV_FROM_BPDP_APPR`.
- Role-based permissions allow BPDP Verifikator and BPDP Approval to submit proposal document validations and status revisions.
