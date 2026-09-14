# Data Model & Validation Specification: sarpras-package-rules

This document specifies the TypeScript interfaces, enums, and validation schemas adjusted for the package selection feature.

## 1. Updated `JenisSarpras` Enum
In `src/types/pengusulan.ts`:
```typescript
export enum JenisSarpras {
  // Legacy values preserved for backward compatibility
  BENIH_PUPUK = 'BENIH_PUPUK',
  ALSINTAN = 'ALSINTAN',
  JALAN_PERKEBUNAN = 'JALAN_PERKEBUNAN',
  DRAINASE = 'DRAINASE',
  UPH_KAKAO = 'UPH_KAKAO',

  // Canonical packages
  EKSTENSIFIKASI = 'EKSTENSIFIKASI',
  INTENSIFIKASI = 'INTENSIFIKASI',
  ALAT_PASCAPANEN = 'ALAT_PASCAPANEN',
  UPH_1_JENIS = 'UPH_1_JENIS',           // Updated UPH split
  UPH_MULTI_JENIS = 'UPH_MULTI_JENIS',   // Updated UPH split
  JALAN_KEBUN = 'JALAN_KEBUN',
  ALAT_ANGKUT_LANGSIR = 'ALAT_ANGKUT_LANGSIR',
  GEROBAK_BERMOTOR = 'GEROBAK_BERMOTOR',
  PIKAP = 'PIKAP',                       // Added Pikap
  TRUK = 'TRUK',
  MESIN_PERTANIAN = 'MESIN_PERTANIAN',
  INFRASTRUKTUR_PASAR = 'INFRASTRUKTUR_PASAR',
  VERIFIKASI_TEKNIS = 'VERIFIKASI_TEKNIS',
}
```

## 2. Document Checklist Configuration
In `src/lib/pengusulan-persyaratan.config.ts`, the `PAKET_PERSYARATAN_CONFIG` maps each `JenisSarpras` to its document requirements array. New documents registered include:
* `KEMITRAAN`: "Perjanjian kerja sama kemitraan usaha"
* `KELAYAKAN_UPH`: "Surat pernyataan kelayakan usaha pendirian UPH"
* `SHM_HGU_HGB`: "SHM, HGU, atau HGB atas lahan UPH"
* `PERIZINAN_RISIKO`: "Perizinan berusaha berdasarkan tingkat risiko"
* `RENCANA_KERJA_UPH`: "Rencana Kerja aspek teknis, finansial, manajerial, dll."
* `PERNYATAAN_PRODUKSI`: "Pernyataan hasil produksi buah"
* `KESANGGUPAN_KELOLA`: "Pernyataan kesanggupan mengelola adm & manajerial"
* `WILAYAH_SWADAYA`: "Pernyataan berada di wilayah swadaya belum ada UPH"
* `HASIL_RAT`: "Hasil RAT"
* `BIAYA_OPERASIONAL`: "Surat pernyataan kesanggupan membayar biaya operasional"

## 3. Package Validation Parameters (`PAKET_MINIMUM_REQUIREMENTS`)
Each package contains a `PaketMinimumRule`:
```typescript
export interface PaketMinimumRule {
  minimalPekebun: number | null;
  minimalLuasHa: number | null;
  jarakAntarKebunKm: number | null;
  keterangan: string;
}
```

The validation rules are configured as follows:
* `EKSTENSIFIKASI`: 20 pekebun, 3 Ha (OR condition)
* `INTENSIFIKASI`: 20 pekebun, 3 Ha (OR condition)
* `ALAT_PASCAPANEN`: 20 pekebun, 3 Ha (OR condition)
* `UPH_1_JENIS`: 20 pekebun, 5 Ha (OR condition)
* `UPH_MULTI_JENIS`: 40 pekebun, 10 Ha (OR condition)
* `JALAN_KEBUN`: 20 pekebun, 10 Ha (OR condition)
* `ALAT_ANGKUT_LANGSIR`: 20 pekebun, 3 Ha (OR condition)
* `GEROBAK_BERMOTOR`: 20 pekebun, 5 Ha (OR condition)
* `PIKAP`: 25 pekebun, 10 Ha (OR condition)
* `TRUK`: 25 pekebun, 10 Ha (OR condition)
* `MESIN_PERTANIAN`: 20 pekebun, 10 Ha (OR condition)
* `INFRASTRUKTUR_PASAR`: 40 pekebun, 10 Ha (OR condition)
* `VERIFIKASI_TEKNIS`: No minimums (null rule)

## 4. Minimum Compliance Check Validation Logic
In `src/stores/pengusulanDraft.ts`, validation checks whether either the selected farmer count OR selected land acreage meets the requirement:
```typescript
const totalPek = step3TotalPekebun.value;
const totalLuas = step3TotalLuasHa.value;
const minPek = rule.minimalPekebun ?? 0;
const minLuas = rule.minimalLuasHa ?? 0;

// OR Validation condition (20 pekebun dan/atau 3 Ha)
const pekebunCukup = totalPek >= minPek;
const luasCukup = totalLuas >= minLuas;
const isValid = pekebunCukup || luasCukup;
```
If both checks fail, the deficient quantity is calculated as the difference:
* `pekebunDefisit = Math.max(0, minPek - totalPek)`
* `luasDefisit = Math.max(0, minLuas - totalLuas)`
And the reactive message displays: `"Belum memenuhi syarat minimum: kurang {pekebunDefisit} pekebun dan kurang {luasDefisit} Ha."`
