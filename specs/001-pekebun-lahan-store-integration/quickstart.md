# Quickstart: Pekebun & Lahan Store Integration

**Date**: 2026-08-16

## Prerequisites

- Node.js (LTS)
- Backend API running at `http://localhost:8080/api/v1` (see `api-contracts.md`)
- Environment variable `VITE_API_BASE_URL=http://localhost:8080/api/v1` in `.env` or `.env.local`
- `npm install` completed

## Run the App

```bash
npm run dev
```

## Validation Scenarios

### 1. Pekebun List with API Data

1. Navigate to `/master-data/pekebun`
2. **Expected**: List loads from API, shows paginated results
3. **Expected**: Search by name/NIK works (sends query param to API)
4. **Expected**: Tab filters "Semua", "Draft", "Terdaftar" filter entries client-side
5. **Expected**: Delete button triggers API DELETE and refreshes list

### 2. Create Pekebun with Lahan

1. Navigate to `/master-data/pekebun/tambah`
2. Fill Step 1 (Identitas): Enter NIK, click "Cari NIK" (mock Dukcapil)
3. Fill Step 2 (Upload Dokumen): Upload 4 required files
4. Fill Step 3 (Data Lahan): Add at least 1 lahan entry with wilayah, coordinates, scan legalitas
5. Click "Simpan Pekebun"
6. **Expected**: `POST /pekebun` succeeds → `POST /lahan` called for each lahan → redirected to list
7. **Expected**: New entry appears in "Terdaftar" tab

### 3. Save Draft via API

1. Start filling the form, click "Simpan Draft"
2. **Expected**: `POST /pekebun` called with `is_draft: true` → `POST /lahan` called for each lahan
3. **Expected**: Redirected to list, entry appears in "Draft" tab
4. Click on the draft entry to resume
5. **Expected**: Form loads with all data (pekebun + lahan) from API

### 4. Update Pekebun (Finalize Draft)

1. Open a draft entry from the list
2. Modify fields, click "Simpan Pekebun"
3. **Expected**: `PUT /pekebun/:id` called with `is_draft: false` → lahan synchronized (PUT existing, POST new, DELETE removed)
4. **Expected**: Entry moves from "Draft" to "Terdaftar" tab

### 5. Error Handling

1. Submit with invalid data → **Expected**: API validation error shown inline
2. Submit with oversized file (>5MB) → **Expected**: Client-side validation rejects
3. Disconnect network during submission → **Expected**: Error toast shown, form data preserved

## Run Tests

```bash
npm test
```

## Key Files Changed

| File | Change |
|------|--------|
| `src/services/api.ts` | Adjust error interceptor for `{ error: { code, message } }` format |
| `src/services/pekebun.service.ts` | New: API calls for pekebun CRUD |
| `src/services/lahan.service.ts` | New: API calls for lahan CRUD |
| `src/stores/pekebun.ts` | Replace mock data with API-backed actions |
| `src/stores/lahan.ts` | New: Lahan store with CRUD |
| `src/types/pekebun.ts` | Add API response field mappings |
| `src/types/lahan.ts` | New: Lahan types matching API contract |
| `src/views/master-data/PekebunListView.vue` | Use API store, add draft tabs |
| `src/views/master-data/FormPekebunView.vue` | Orchestrate API calls on submit |