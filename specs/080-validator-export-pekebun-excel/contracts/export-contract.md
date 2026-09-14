# UI & Function Contract: Export Pekebun Excel

## 1. Function Contract (`exportPekebunExcel.ts`)

```typescript
export interface ExportPekebunContext {
  proposal: any;
  pekebuns: any[];
  lahans: any[];
}

/**
 * Generates and triggers download of Laporan Titik Koordinat (.xlsx)
 */
export function exportLaporanTitikKoordinat(context: ExportPekebunContext): void;

/**
 * Generates and triggers download of Laporan Profil Pekebun (.xlsx)
 */
export function exportLaporanProfilPekebun(context: ExportPekebunContext): void;
```

## 2. UI Component Contract (`DropdownEksporPekebun.vue`)

- **Props**:
  - `proposal`: Data proposal aktif
  - `pekebuns`: Array pekebun yang terhubung
  - `lahans`: Array lahan yang terhubung
  - `disabled`: boolean (opsional, jika tidak ada data pekebun)
- **Visual**:
  - Tombol dengan ikon spreadsheet / download: `Ekspor Data Pekebun ▾`
  - Menu popover / dropdown:
    1. Opsi 1: `Laporan Titik Koordinat (.xlsx)`
    2. Opsi 2: `Laporan Profil Pekebun (.xlsx)`
