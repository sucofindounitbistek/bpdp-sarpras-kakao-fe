# Research Findings: Integrasi API Master Wilayah IAM pada Pengisian Lahan Pekebun

**Feature**: `086-integrate-iam-region-api`  
**Date**: 2026-09-14  
**Status**: Completed  

---

## 1. IAM Public Region Endpoints & HTTP Client Architecture

### Context
Frontend `bpdp-sarpras-kelapa-fe` needs to fetch real Indonesian administrative region master data (Provinces and Regencies/Cities) from `bpdp-iam-be` to replace the local 3-province mock array `MOCK_WILAYAH`.

### Backend Verification (Constitution Principle XIII)
Inspected sibling repository `bpdp-iam-be` directly:
- **Routes**: `internal/region/handler.go` and `cmd/api/main.go`
  - `GET /api/v1/public/regions/provinces`
  - `GET /api/v1/public/regions/regencies?province_id={province_id}`
- **Authentication**: Both endpoints are mounted on the public router group (`v1.GET("/public/regions/...", ...)`) without requiring JWT Bearer token authentication.
- **Payload Shape**:
  - `ProvinceResponse`: `{ id: uint64, name: string }`
  - `RegencyResponse`: `{ id: uint64, province_id: uint64, name: string }`
  - Standard JSON response envelope: `{ data: [...], message: "success" }`
  - Total data size: 38 provinces, 514 regencies/cities.

### Decision
Create a dedicated service `src/services/region.service.ts` using an Axios instance pointing to the IAM API base URL:
```typescript
const iamBaseURL = (import.meta.env.VITE_IAM_API_URL || 'https://sso-local.scitechnology.id/api/api/v1').trim();
```
The service exposes:
- `fetchProvinces(): Promise<Province[]>`
- `fetchRegenciesByProvince(provinceId: number | string): Promise<Regency[]>`

### Rationale
- Uses verified backend endpoints directly with exact contract matching.
- Avoids redundant backend hops through Sarpras backend proxy.
- Strips any trailing whitespace from environment variables safely.

### Alternatives Considered
- *Querying Sarpras Backend as proxy*: Rejected because Sarpras backend does not have region tables; IAM is the single authoritative source of truth for identity and master wilayah.

---

## 2. Pinia State Management & In-Memory Deduplication (Caching)

### Context
When operator KP adds or edits multiple land plots (persil lahan) within a single pekebun registration session, fetching provinces and regencies repeatedly on every modal open or tab switch introduces unnecessary network latency and violates Constitution Principle V (Zero Redundant API Calls).

### Decision
Implement a dedicated Pinia store `useRegionStore` in `src/stores/region.ts`:
- **State**:
  - `provinces: Province[]`
  - `regenciesByProvince: Record<string, Regency[]>` (indexed by stringified province ID)
  - `isLoadingProvinces: boolean`
  - `loadingRegencies: Record<string, boolean>`
  - `error: string | null`
- **Actions**:
  - `loadProvinces(force = false)`: If `provinces.length > 0` and not forced, return cached list immediately without network request.
  - `loadRegencies(provinceId: number | string, force = false)`: If `regenciesByProvince[provinceId]` exists, return immediately.
  - `getProvinceName(id: string | number): string`
  - `getRegencyName(id: string | number): string`
  - `getWilayahNama(code: string): string`: Unified lookup for both provinces and regencies, falling back to string value as-is for free-text kecamatan/desa.
- **Integration with `pekebun.ts`**:
  - Update `usePekebunStore.getWilayahByParent` and `usePekebunStore.getWilayahNama` to delegate to `useRegionStore` so all existing views (`StepPilihPekebunLahan.vue`, `TrackingPengusulanView.vue`, `regionHelper.ts`) remain fully functional without regressions.

### Rationale
- Strict compliance with Constitution Principle III (Mandatory Pinia Store for API integrations) and Principle V (Zero Redundant API Calls & Network Deduplication).
- Clean separation of concerns between Pekebun entity management and Region master data.
- 0 redundant network calls when switching between parcels of land.

### Alternatives Considered
- *Storing in component local state*: Violates Constitution Principle III and triggers duplicate network requests on every tab switch.
- *Persisting in `localStorage`*: Unnecessary complexity; master region data is lightweight (< 30KB total) and in-memory cache is active for the entire user session.

---

## 3. Kecamatan and Desa Input Strategy

### Context
`bpdp-iam-be` only provides master data down to Kabupaten/Kota (regencies/cities). There are no Kecamatan or Desa tables in IAM. In the current UI (`StepDataLahanPekebun.vue`), Kecamatan and Desa were dropdown selects reading from `MOCK_WILAYAH` (which only contained 3 subdistricts in Luwu, Kolaka, and Mamuju).

### Decision
Clarification Q1 resolved: **Option A (Free-Text Input)**.
- In `StepDataLahanPekebun.vue`, convert the select dropdowns for `kecamatanKode` and `desaKode` into clean, accessible `<input type="text">` elements with standard design styling (`h-10 px-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#066C2A]/20`).
- Add placeholders:
  - Kecamatan: `Contoh: Masamba`
  - Desa: `Contoh: Desa Bone`
- Keep field enabled as long as Kabupaten has been selected (or prompt user).
- Input value is stored directly in `kecamatanKode` and `desaKode`.

### Rationale
- Allows operators to register land in all 7,277 subdistricts (kecamatan) and 83,763 villages (desa) across all 38 provinces in Indonesia without being blocked.
- Clean and intuitive UX matching the rest of the form text controls.

### Alternatives Considered
- *Hardcoding all kecamatan and desa in frontend bundle*: Rejected because hundreds of thousands of records would inflate bundle size by tens of megabytes.
- *3rd party external API*: Rejected due to external dependency risks and lack of offline/internal network guarantees.

---

## 4. Region Identifiers, Data Model & Backward Compatibility

### Context
Backend Sarpras `bpdp-sarpras-kelapa-be` stores `kode_provinsi`, `kode_kabupaten`, `kode_kecamatan`, and `kode_desa` as VARCHAR strings in the database.

### Decision
Clarification Q2 resolved: **Option A (Standard Numeric IAM IDs)**.
- `provinsiKode`: Stored as IAM Province ID string (e.g. `"73"` for Sulawesi Selatan, `"14"` for Riau).
- `kabupatenKode`: Stored as IAM Regency ID string (e.g. `"7322"` for Luwu Utara).
- `kecamatanKode`: Stored as user-entered Kecamatan name string (or historical code).
- `desaKode`: Stored as user-entered Desa name string (or historical code).
- In `getWilayahNama(code)`:
  - If `code` matches an IAM Province ID, return uppercase province name (e.g. `"SULAWESI SELATAN"`).
  - If `code` matches an IAM Regency ID, return uppercase regency name (e.g. `"KABUPATEN LUWU UTARA"`).
  - Otherwise, return `code` as-is.

### Rationale
- Full alignment with IAM user/satker scopes (`province_id` and `regency_id`).
- Zero changes required to database schema or migration scripts in `bpdp-sarpras-kelapa-be`.
- Clean rehydration when editing drafts or existing pekebun lands.
