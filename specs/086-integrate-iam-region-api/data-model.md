# Data Model: Integrasi API Master Wilayah IAM

**Feature**: `086-integrate-iam-region-api`  
**Date**: 2026-09-14  
**Status**: Ready  

---

## 1. Domain Entities & Interfaces

### 1.1 `Province` (IAM Master Region)
Represents a first-level Indonesian administrative province returned by `GET /public/regions/provinces`.

```typescript
export interface Province {
  id: number;
  name: string; // e.g. "SULAWESI SELATAN", "RIAU", "ACEH"
}
```

### 1.2 `Regency` (IAM Master Region)
Represents a second-level administrative entity (Kabupaten / Kota) returned by `GET /public/regions/regencies?province_id={id}`.

```typescript
export interface Regency {
  id: number;
  province_id: number;
  name: string; // e.g. "KABUPATEN LUWU UTARA", "KOTA PEKANBARU"
}
```

### 1.3 `RegionOption` (UI Select Option Model)
Standard UI dropdown representation conforming to existing form selects.

```typescript
export interface RegionOption {
  value: string; // Stored as stringified ID, e.g. "73", "7322"
  label: string; // Formatted display text, e.g. "SULAWESI SELATAN", "KABUPATEN LUWU UTARA"
}
```

### 1.4 `LahanFormData` (Updated Form State)
Represents the land parcel registration and editing form data model in `StepDataLahanPekebun.vue`.

```typescript
export interface LahanFormData {
  jenisLegalitas: JenisLegalitas | '';
  nomorLegalitas: string;
  tanggalPenerbitanLegalitas: string;
  luasLahan: number | '';
  provinsiKode: string;    // IAM Province ID string (e.g. "73")
  kabupatenKode: string;   // IAM Regency ID string (e.g. "7322")
  kecamatanKode: string;   // Free-text Kecamatan name entered by operator
  desaKode: string;        // Free-text Desa name entered by operator
  alamatKebun: string;     // Street / block detail address
  tahunTanam: string;
  jenisBibit: string;
  scanLegalitas: File | DokumenPekebun | null;
  existingScanLegalitasUrl?: string;
  scanBedaNamaLahan?: File | DokumenPekebun | null;
  nomorSuratBedaNama?: string;
  coordinates: Coords[];
}
```

---

## 2. Pinia Store State Model (`useRegionStore`)

```typescript
export interface RegionState {
  provinces: Province[];
  regenciesByProvince: Record<string, Regency[]>; // Keyed by stringified province_id
  isLoadingProvinces: boolean;
  loadingRegencies: Record<string, boolean>;     // Track loading state per province
  error: string | null;
}
```

### State Transitions & Lifecycle
1. **Initial State**:
   - `provinces = []`
   - `regenciesByProvince = {}`
2. **On `loadProvinces()`**:
   - If `provinces.length > 0`: Return cached list immediately (no state change, no HTTP call).
   - If `provinces.length === 0`: Set `isLoadingProvinces = true` -> Fetch API -> Set `provinces = data`, `isLoadingProvinces = false`.
3. **On `loadRegencies(provinceId)`**:
   - If `regenciesByProvince[provinceId]` exists: Return cached list immediately.
   - Otherwise: Set `loadingRegencies[provinceId] = true` -> Fetch API -> Store `regenciesByProvince[provinceId] = data`, `loadingRegencies[provinceId] = false`.
4. **On User Changes Province in Form**:
   - `activeForm.provinsiKode = newId`
   - `activeForm.kabupatenKode = ''` (reset child)
   - `activeForm.kecamatanKode = ''` (reset child)
   - `activeForm.desaKode = ''` (reset child)
   - Call `loadRegencies(newId)` to populate Kabupaten dropdown.

---

## 3. Validation Rules

| Field | Type | Validation Constraint | Error Message |
|---|---|---|---|
| `provinsiKode` | `string` | Required, non-empty, must match an existing IAM province ID | `"Provinsi wajib dipilih"` |
| `kabupatenKode` | `string` | Required, non-empty, must match an existing IAM regency ID belonging to `provinsiKode` | `"Kabupaten wajib dipilih"` |
| `kecamatanKode` | `string` | Required, trimmed length ≥ 2 characters | `"Kecamatan wajib diisi"` |
| `desaKode` | `string` | Required, trimmed length ≥ 2 characters | `"Desa wajib diisi"` |
