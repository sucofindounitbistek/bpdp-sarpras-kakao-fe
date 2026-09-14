# Feature Specification: Pekebun & Lahan Store Integration with API

**Feature Branch**: `001-pekebun-lahan-store-integration`
**Created**: 2026-08-16
**Status**: Draft

## Clarifications

### Session 2026-08-16

- Q: Are drafts stored locally (browser) or submitted to the API? → A: Drafts are submitted to the API with `is_draft: true`, not saved locally.
- Q: How are drafts listed/distinguished in the pekebun list? → A: Tabs: "Semua" (all), "Draft" (is_draft=true), "Terdaftar" (is_draft=false). Entry rows show a visual badge.
- Q: Are lahan entries submitted to the API during draft save? → A: Yes, lahan entries are submitted alongside pekebun during draft save.

## User Scenarios & Testing *(mandatory)*

### 1. Browse Pekebun List with Real API Data

**Actor**: Petugas Dinas (Data Entry Officer)

**Precondition**: User is authenticated and navigates to Master Data > Pekebun list page.

**Flow**:
1. User opens the Pekebun list page.
2. System fetches pekebun data from the API with pagination (page, limit, search, kelembagaan_id filters).
3. System displays pekebun records in a table with pagination controls and tab filters: "Semua" (all entries), "Draft" (is_draft=true), "Terdaftar" (is_draft=false).
4. User can search by name or NIK, filter by institution, switch tabs, and navigate pages.
5. User can delete a pekebun record, triggering an API DELETE call.

**Acceptance Criteria**:
- List loads data from `GET /pekebun` API endpoint.
- Pagination meta (page, limit, total) is read from the API response and used to drive pagination UI.
- Search and filter parameters are sent as query params to the API.
- Delete triggers `DELETE /pekebun/:id` and refreshes the list on success.

### 2. Create Pekebun with Lahan in One Submission

**Actor**: Petugas Dinas (Data Entry Officer)

**Precondition**: User is on the Pekebun creation form (multi-step wizard).

**Flow**:
1. User fills Step 1 (Identitas), Step 2 (Upload Dokumen), Step 3 (Data Lahan).
2. User clicks "Simpan Pekebun" to submit.
3. System calls `POST /pekebun` (multipart/form-data) to create the pekebun profile.
4. On successful pekebun creation, system receives the pekebun ID from the response.
5. System calls `POST /lahan` (multipart/form-data) for each lahan entry, using the returned pekebun_id.
6. On completion, user is redirected to the pekebun list page with a success notification.

**Acceptance Criteria**:
- Pekebun creation sends all required fields (nik, address, postcode, phone_number, kelembagaan_id) plus files (scan_ktp, scan_kk, swafoto, surat_kuasa) as multipart/form-data.
- After pekebun creation succeeds, lahan entries are created sequentially using the returned pekebun_id.
- If pekebun creation fails, lahan API is not called and error is shown.
- If any lahan creation fails, the error is reported but already-created pekebun and lahan data remain intact (partial success handled).

### 3. Update Pekebun with Lahan Modifications

**Actor**: Petugas Dinas (Data Entry Officer)

**Precondition**: User is editing an existing pekebun record (opened via draft or edit flow).

**Flow**:
1. User modifies pekebun fields and/or lahan data.
2. User clicks "Simpan Pekebun" to submit.
3. System calls `PUT /pekebun/:id` (multipart/form-data, optional fields) to update the pekebun profile.
4. System calls `PUT /lahan/:id` for each modified existing lahan, and `POST /lahan` for new lahan entries.
5. On completion, user is redirected to the pekebun list page with a success notification.

**Acceptance Criteria**:
- Pekebun update sends only changed fields (optional multipart/form-data).
- Existing lahan entries are updated via `PUT /lahan/:id`, new ones via `POST /lahan`.
- Deleted lahan entries (removed from the form) trigger `DELETE /lahan/:id`.

### 4. View Pekebun Detail with Lahan Data

**Actor**: Petugas Dinas

**Precondition**: User opens a pekebun detail.

**Flow**:
1. System fetches pekebun detail from `GET /pekebun/:id`.
2. System fetches associated lahan list from `GET /lahan?pekebun_id=`.
3. Combined data is displayed in the detail view.

**Acceptance Criteria**:
- Pekebun detail is fetched via `GET /pekebun/:id`.
- Lahan list is fetched via `GET /lahan?pekebun_id=` with the pekebun ID.
- Both API calls complete before the detail view renders.

### 5. Simpan Draft via API

**Actor**: Petugas Dinas

**Precondition**: User is filling the pekebun form and clicks "Simpan Draft".

**Flow**:
1. System calls `POST /pekebun` (or `PUT /pekebun/:id` if editing an existing draft) with `is_draft: true` and current form data.
2. API stores the pekebun record marked as draft.
3. System calls `POST /lahan` for each lahan entry using the returned pekebun_id (same as final submission flow).
4. User is redirected to the pekebun list page; draft entries are visible with a draft indicator.
5. User can later resume a draft by opening it from the list, which loads both pekebun and lahan data from the API.

**Acceptance Criteria**:
- Draft save calls `POST /pekebun` (or `PUT /pekebun/:id`) with `is_draft: true`.
- Lahan entries are submitted via `POST /lahan` after pekebun creation, same as final submission.
- Draft data (pekebun + lahan) is fetched from the API when resuming.
- Draft entries appear in the pekebun list with a visual "Draft" indicator.

### Edge Cases

- **API timeout**: Show user-friendly error message, allow retry.
- **Duplicate NIK**: API returns validation error, shown inline on the NIK field.
- **File size exceeds 5MB**: Client-side validation rejects before API call; API-side validation also returns error.
- **Empty lahan list**: Pekebun creation should still succeed; lahan API is simply not called.
- **Network offline**: Detect and show connectivity error; do not clear form data.
- **Concurrent delete**: If a pekebun is deleted by another user while viewing, API returns 404; show "record not found" message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Pekebun store MUST call `GET /pekebun` (paginated) for listing, replacing mock data.
- **FR-002**: Pekebun store MUST call `POST /pekebun` (multipart/form-data) for creation.
- **FR-003**: Pekebun store MUST call `PUT /pekebun/:id` (multipart/form-data, optional fields) for update.
- **FR-004**: Pekebun store MUST call `DELETE /pekebun/:id` for deletion.
- **FR-005**: Pekebun store MUST call `GET /pekebun/:id` for fetching a single record.
- **FR-006**: Lahan store MUST be created with `GET /lahan?pekebun_id=`, `POST /lahan`, `PUT /lahan/:id`, `DELETE /lahan/:id`, and `GET /lahan/:id` endpoints.
- **FR-007**: Pekebun creation in FormPekebunView MUST call pekebun create API, then sequentially call lahan create API for each lahan entry using the returned pekebun_id.
- **FR-008**: Pekebun update in FormPekebunView MUST call pekebun update API, then synchronize lahan entries (create new, update existing, delete removed).
- **FR-009**: Dukcapil NIK lookup and wilayah data remain as mock/simulated data (no real API endpoints for these).
- **FR-010**: Draft save MUST call `POST /pekebun` (or `PUT /pekebun/:id` for existing drafts) with `is_draft: true`, then sequentially call `POST /lahan` for each lahan entry using the returned pekebun_id.
- **FR-011**: The pekebun list page (PekebunListView) MUST use the API-backed store functions for browsing, searching, filtering, and deleting.
- **FR-012**: The pekebun list page MUST provide tab filters: "Semua" (all entries), "Draft" (is_draft=true), "Terdaftar" (is_draft=false).
- **FR-013**: All API calls MUST handle the standard response format (`{ data, message }` for success, `{ error: { code, message } }` for errors).
- **FR-014**: All API calls MUST include `Authorization: Bearer <token>` header via the existing axios instance.

### Key Entities

- **Pekebun**: Farmer profile — NIK, name, address, marital status, documents, timestamps.
- **Lahan**: Land plot — legalitas type/number, area, coordinates, wilayah codes, planting year, documents, linked to a pekebun.
- **PekebunDocument**: Attached documents (scan KTP, scan KK, swafoto, surat kuasa) with file metadata.
- **LahanDocument**: Attached documents (scan legalitas, surat keterangan beda nama) with file metadata.

## Success Criteria *(mandatory)*

- **SC-001**: Pekebun list page loads data from the API within 3 seconds under normal network conditions.
- **SC-002**: Pekebun creation with 1 lahan entry completes within 5 seconds under normal network conditions.
- **SC-003**: Pekebun update with lahan synchronization completes within 5 seconds for up to 3 lahan entries.
- **SC-004**: API errors display user-friendly messages (not raw error codes) to the user within 1 second of the failed request.
- **SC-005**: All existing list, detail, create, update, and delete flows remain functional after the transition from mock data to API calls.
- **SC-006**: Draft submission saves to the API and the draft entry appears in the pekebun list within 3 seconds under normal network conditions.

## Assumptions

- The API base URL `http://localhost:8080/api/v1` is already configured in the existing axios instance (`src/services/api.ts`).
- JWT authentication interceptor is already set up in the axios instance.
- The existing `Pekebun` and `LahanPekebun` TypeScript interfaces will be adapted to match the API response shapes (camelCase to snake_case mapping handled by the store or a mapping layer).
- File uploads use the existing `multipart/form-data` approach with `FormData`.
- The `is_draft` field is sent to the API for draft submissions; drafts are stored server-side, not in browser storage.
- Wilayah hierarchy data (provinsi, kabupaten, kecamatan, desa) continues to use mock data until a wilayah API endpoint is available.