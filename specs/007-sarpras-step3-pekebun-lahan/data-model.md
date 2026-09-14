# Data Model: Step 3 Pengajuan Sarpras — Pekebun & Lahan, Dokumen Kepemilikan, Validasi Minimum Paket

**Feature**: `007-sarpras-step3-pekebun-lahan`
**Phase**: 1 — Design & Contracts
**Date**: 2026-07-31

---

## New Type Definitions (`src/types/pengusulan.ts`)

### LahanDokumenOwnership Interface

Per-lahan document ownership data stored in the draft store.

```typescript
export interface LahanDokumenOwnership {
  jenisDokumen: 'SHM' | 'DOKUMEN_LAINNYA';
  nomorDokumen: string;
  jenisDokumenLainnya: string; // Only meaningful when jenisDokumen === 'DOKUMEN_LAINNYA'
}
```

### PaketMinimumRule Interface

Minimum requirement rule for a single paket sarpras.

```typescript
export interface PaketMinimumRule {
  minimalPekebun: number | null;  // null = no minimum requirement
  minimalLuasHa: number | null;   // null = no minimum requirement
  jarakAntarKebunKm: number | null; // null = no distance requirement
  keterangan: string;             // Additional note e.g. "Tidak ada minimal"
}
```

### Step3ValidationResult Interface

Result of the minimum requirement validation check.

```typescript
export interface Step3ValidationResult {
  isValid: boolean;
  totalPekebun: number;
  totalLuasHa: number;
  minimalPekebun: number | null;
  minimalLuasHa: number | null;
  pekebunDefisit: number;    // How many more pekebun needed (- means exceeded)
  luasDefisit: number;       // How many more Ha needed (- means exceeded)
  jarakAntarKebunKm: number | null;
  message: string;           // Human-readable status message
}
```

---

## Extended Store: `usePengusulanDraftStore` (`src/stores/pengusulanDraft.ts`)

### New State

| Field | Type | Description |
|-------|------|-------------|
| `selectedLahanDocs` | `Ref<Record<string, LahanDokumenOwnership>>` | Per-lahan document ownership, keyed by `lahanId` |

### New Getters

| Getter | Returns | Description |
|--------|---------|-------------|
| `step3TotalPekebun` | `number` | Count of unique selected pekebun |
| `step3TotalLuasHa` | `number` | Sum of `luasLahan` for all selected lahan |
| `step3MinimumRule` | `PaketMinimumRule \| null` | Minimum requirement for selected paket; null for VERIFIKASI_TEKNIS |
| `step3ValidationResult` | `Step3ValidationResult` | Computed validation result |
| `isStep3Valid` | `boolean` | Updated: must have pekebun + lahan selected, all lahan docs filled, AND minimum validation passes |

### Updated Getters

| Getter | Old Logic | New Logic |
|--------|-----------|-----------|
| `isStep3Valid` | `selectedPekebunIds.length > 0 && selectedLahanIds.length > 0` | `selectedPekebunIds.length > 0 && selectedLahanIds.length > 0 && allLahanDocsFilled && step3ValidationResult.isValid` |

### New Actions

| Action | Description |
|--------|-------------|
| `setLahanDoc(lahanId, patch)` | Set or update `LahanDokumenOwnership` for a lahan |
| `removeLahanDoc(lahanId)` | Remove document ownership when lahan is deselected |

### Updated Actions

| Action | Change |
|--------|--------|
| `setSelectedPekebun(ids)` | Also clear `selectedLahanDocs` for removed pekebun |
| `setSelectedLahan(ids)` | Also remove `selectedLahanDocs` entries for deselected lahan |
| `resetDraft()` | Also reset `selectedLahanDocs` to `{}` |

---

## New Config: `PAKET_MINIMUM_REQUIREMENTS` (`src/lib/pengusulan-persyaratan.config.ts`)

```typescript
export const PAKET_MINIMUM_REQUIREMENTS: Record<JenisSarpras, PaketMinimumRule | null> = {
  [JenisSarpras.EKSTENSIFIKASI]:      { minimalPekebun: 20, minimalLuasHa: 5,  jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.INTENSIFIKASI]:       { minimalPekebun: 20, minimalLuasHa: 5,  jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.ALAT_PASCAPANEN]:     { minimalPekebun: 20, minimalLuasHa: 5,  jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.UPH]:                 { minimalPekebun: 40, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.JALAN_KEBUN]:         { minimalPekebun: 20, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.ALAT_ANGKUT_LANGSIR]: { minimalPekebun: 25, minimalLuasHa: 10, jarakAntarKebunKm: 0.5, keterangan: 'Jarak antar kebun paling jauh 0,5 km' },
  [JenisSarpras.GEROBAK_BERMOTOR]:    { minimalPekebun: 25, minimalLuasHa: 20, jarakAntarKebunKm: 1,   keterangan: 'Jarak antar kebun paling jauh 1 km' },
  [JenisSarpras.TRUK]:                { minimalPekebun: 25, minimalLuasHa: 50, jarakAntarKebunKm: 1,   keterangan: 'Jarak antar kebun paling jauh 1 km' },
  [JenisSarpras.MESIN_PERTANIAN]:     { minimalPekebun: 25, minimalLuasHa: 10, jarakAntarKebunKm: 0.5, keterangan: 'Jarak antar kebun paling jauh 0,5 km' },
  [JenisSarpras.INFRASTRUKTUR_PASAR]: { minimalPekebun: 40, minimalLuasHa: 10, jarakAntarKebunKm: null, keterangan: '' },
  [JenisSarpras.VERIFIKASI_TEKNIS]:   null, // No minimum requirement

  // Legacy values — no minimum requirements defined
  [JenisSarpras.BENIH_PUPUK]:         null,
  [JenisSarpras.ALSINTAN]:            null,
  [JenisSarpras.JALAN_PERKEBUNAN]:    null,
  [JenisSarpras.DRAINASE]:            null,
  [JenisSarpras.UPH_KAKAO]:           null,
};
```

---

## Updated Entity Relationships

```
PengusulanDraftState
  ├── selectedPaket → JenisSarpras
  │     └── via PAKET_MINIMUM_REQUIREMENTS → PaketMinimumRule (for validation)
  ├── selectedPekebunIds[] → ref Pekebun.id
  ├── selectedLahanIds[] → ref LahanPekebun.id
  │     └── each has entry in selectedLahanDocs → LahanDokumenOwnership
  ├── selectedLahanDocs → Record<lahanId, LahanDokumenOwnership>
  │     └── keyed by LahanPekebun.id
  └── step3ValidationResult (computed) → Step3ValidationResult
        ├── totals from selectedPekebunIds + selectedLahanIds
        └── compared against PAKET_MINIMUM_REQUIREMENTS[selectedPaket]
```

---

## Validation Rules (Updated)

### Step 3 Validation Gate (Submit)

| Rule | Check | Error Message |
|------|-------|---------------|
| Pekebun selected | `selectedPekebunIds.length >= 1` | "Pilih minimal 1 pekebun." |
| Lahan selected | `selectedLahanIds.length >= 1` | "Pilih minimal 1 lahan." |
| All lahan docs filled | Every selected lahan has `selectedLahanDocs[lahanId]` with `nomorDokumen` non-empty, and `jenisDokumenLainnya` non-empty if `jenisDokumen === 'DOKUMEN_LAINNYA'` | "Lengkapi dokumen kepemilikan untuk semua lahan yang dipilih." |
| Minimum pekebun OR luas | `step3ValidationResult.isValid === true` | "Belum memenuhi syarat minimum: {detail}. Total pekebun: {n}, total luas: {ha} Ha. Minimum: {minPekebun} pekebun atau {minLuasHa} Ha." |

### "dan/atau" Logic

```
isValid = (minimalPekebun === null && minimalLuasHa === null)  // No minimum (VERIFIKASI_TEKNIS)
       || (totalPekebun >= minimalPekebun)                     // Pekebun count meets minimum
       || (totalLuasHa >= minimalLuasHa)                       // OR total area meets minimum
```

### Document Ownership Validation

```
For each selected lahanId:
  doc = selectedLahanDocs[lahanId]
  must exist AND
  doc.nomorDokumen.trim() !== '' AND
  if doc.jenisDokumen === 'DOKUMEN_LAINNYA':
    doc.jenisDokumenLainnya.trim() !== ''
```

---

## UI State: Selection-Initialization Flow

When a pekebun is selected (`togglePekebun`):
1. Add `pekebun.id` to `selectedPekebunIds`
2. Add `pekebun.lahan.id` to `selectedLahanIds` (one lahan per pekebun)
3. Initialize `selectedLahanDocs[pekebun.lahan.id]` with defaults:
   ```ts
   { jenisDokumen: 'SHM', nomorDokumen: '', jenisDokumenLainnya: '' }
   ```
   If `pekebun.lahan.jenisLegalitas` and `pekebun.lahan.nomorLegalitas` already exist in the pekebun data, pre-fill from there.

When a pekebun is deselected:
1. Remove `pekebun.id` from `selectedPekebunIds`
2. Remove `pekebun.lahan.id` from `selectedLahanIds`
3. Delete `selectedLahanDocs[pekebun.lahan.id]`