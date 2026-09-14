# Research: Pekebun & Lahan Store Integration

**Date**: 2026-08-16

## Decision 1: API Response Format Handling

**Decision**: Keep existing axios interceptor. The API contract format `{ data, message }` for success and `{ error: { code, message } }` for errors maps naturally to the existing interceptor. The interceptor returns `response.data` (the full `{ data, message }` object). Service methods access `.data` to get the payload. The `res.success` check in the interceptor is a no-op for this API format (no `success` field on success responses), which is harmless.

For error responses, the API returns `{ error: { code, message } }`. The error interceptor reads `error.response?.data?.message` which would be undefined (message is nested under `error`). **Fix**: Update the error interceptor to also read `error.response?.data?.error?.message`.

**Rationale**: Minimal change to existing infrastructure. The interceptor already handles the happy path correctly.

**Alternatives considered**: Creating a new axios instance. Rejected: unnecessary duplication.

## Decision 2: Store Architecture Pattern

**Decision**: Follow existing Pinia composable setup pattern used by `usePekebunStore` and `pengusulanDraft`. Each store exposes reactive refs for state and async functions for actions. Services are called from store actions.

**Rationale**: Consistency with existing codebase. All other stores (`auth.ts`, `pengusulan.ts`, `verifikasiKab.ts`) use the same pattern.

**Alternatives considered**: 
- Calling services directly from components. Rejected: breaks existing pattern, scatters API logic.
- Class-based stores. Rejected: Pinia setup stores are the standard in this project.

## Decision 3: Snake_case to camelCase Mapping

**Decision**: The API uses snake_case (`phone_number`, `kelembagaan_id`). The existing TypeScript interfaces use camelCase (`nomorHP`, `kelembagaanId`). We will NOT rename the existing TS interfaces to match the API — instead, add a mapping layer in the store:

- **API request mapping**: Build `FormData` with snake_case keys directly from form data.
- **API response mapping**: Convert snake_case API response to camelCase TS interface in the store's getter/action.

**Rationale**: Preserves existing component code that uses camelCase interfaces. The mapping is a thin translation layer in the store, not a separate module.

**Alternatives considered**:
- Renaming all TS interfaces to snake_case. Rejected: would require changes across 11+ files that consume Pekebun/Lahan types.
- Using a schema-based transformation library. Rejected: overkill for 2 entities.

## Decision 4: File Upload Approach

**Decision**: Use `FormData` with `multipart/form-data` content type. The existing axios instance sets `Content-Type: application/json` by default. For multipart requests, we override the content-type header per-request by not setting it (letting the browser set it with boundary). The `FormData` approach is already used in the existing mock store's `addPekebun` for local `URL.createObjectURL`.

**Rationale**: The API contract requires `multipart/form-data` for all create/update endpoints. `FormData` is the browser-native way to build multipart requests.

**Alternatives considered**: Base64 encoding in JSON. Rejected: API explicitly requires multipart/form-data.

## Decision 5: Sequential API Call Orchestration

**Decision**: Pekebun create → receive pekebun_id → sequentially POST each lahan. Pekebun update → PUT pekebun → synchronize lahan (PUT existing, POST new, DELETE removed). All orchestrated in the store action, called from `FormPekebunView.vue`.

**Rationale**: Lahan requires `pekebun_id` which only exists after pekebun creation. Sequential calls are necessary. The store action encapsulates the orchestration, keeping the component clean.

**Alternatives considered**: 
- Parallel lahan creation. Rejected: API requires sequential `pekebun_id` dependency.
- Orchestration in the component. Rejected: violates separation of concerns; store is the right place.

## Decision 6: Service Layer Pattern

**Decision**: Create `pekebun.service.ts` and `lahan.service.ts` following the existing `pengusulan.service.ts` pattern: plain object export with methods, each wrapping api calls in try/catch, returning `response.data` or `null` on error.

**Rationale**: Consistent with existing `pengusulan.service.ts`. Services are thin wrappers around the axios instance; stores consume services.

**Alternatives considered**: 
- Putting API calls directly in the store. Rejected: existing pattern separates services from stores.
- Class-based service. Rejected: existing services use plain objects.

## Decision 7: Draft Tab Filtering

**Decision**: The `GET /pekebun` API does not have an `is_draft` query parameter. Tab filtering ("Semua", "Draft", "Terdaftar") will be done client-side on the fetched data. The store fetches the full list (or paginated page) and the view filters by `is_draft` field.

**Rationale**: API limitation. Client-side filtering is straightforward since the `is_draft` field is returned in the response. Pagination impact: each tab shows only the matching entries from the current page; users can paginate within each tab.

**Alternatives considered**: 
- Requesting backend to add `is_draft` filter. Rejected: out of scope for this frontend-only feature.
- Fetching all data without pagination. Rejected: would not scale.