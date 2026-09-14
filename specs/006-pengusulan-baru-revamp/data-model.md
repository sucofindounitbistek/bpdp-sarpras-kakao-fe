# Data Model: Revamp Pengusulan Baru — Multi-Step Wizard

**Feature**: `006-pengusulan-baru-revamp`
**Phase**: 1 — Design & Contracts
**Date**: 2026-07-31

---

## Extended Type Definitions (`src/types/pengusulan.ts`)

### JenisSarpras Enum — Extended

```typescript
export enum JenisSarpras {
  // ── Legacy values (preserved for backward compat with existing mock data) ──
  BENIH_PUPUK         = 'BENIH_PUPUK',
  ALSINTAN            = 'ALSINTAN',
  JALAN_PERKEBUNAN    = 'JALAN_PERKEBUNAN',
  DRAINASE            = 'DRAINASE',
  UPH_KAKAO           = 'UPH_KAKAO',

  // ── New canonical 9-paket values ──
  EKSTENSIFIKASI      = 'EKSTENSIFIKASI',      // Benih, Pupuk, Pestisida
  INTENSIFIKASI       = 'INTENSIFIKASI',        // Pupuk dan Pestisida
  ALAT_PASCAPANEN     = 'ALAT_PASCAPANEN',
  UPH                 = 'UPH',                 // Unit Pengolahan Hasil
  JALAN_KEBUN         = 'JALAN_KEBUN',         // Jalan kebun & akses
  ALAT_TRANSPORTASI   = 'ALAT_TRANSPORTASI',
  MESIN_PERTANIAN     = 'MESIN_PERTANIAN',
  INFRASTRUKTUR_PASAR = 'INFRASTRUKTUR_PASAR',
  VERIFIKASI_TEKNIS   = 'VERIFIKASI_TEKNIS',
}
```

### PaketSarprasOption Interface

Describes each selectable paket card in Step 1.

```typescript
export interface PaketSarprasOption {
  id: JenisSarpras;
  label: string;           // Full display name
  icon: string;            // Emoji or icon identifier
  description: string;     // Short description
  isPupuk: boolean;        // true → shows Gudang Serah Terima section
  persyaratan: PersyaratanDokumen[]; // Required document list for this paket
}
```

### PersyaratanDokumen Interface

Represents a single required document entry for a paket.

```typescript
export interface PersyaratanDokumen {
  id: string;              // e.g. 'PROPOSAL', 'KTP_KETUA'
  nama: string;            // Display label e.g. 'Proposal Usulan'
  formatDownloadUrl: string | null; // URL to template file; null if no template
  wajib: boolean;          // true = must be uploaded before advancing
}
```

### DokumenUpload Interface

Represents a file that has been uploaded by the user for a persyaratan slot.

```typescript
export interface DokumenUpload {
  persyaratanId: string;   // Links to PersyaratanDokumen.id
  namaFile: string;
  mimeType: string;        // 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp'
  ukuranBytes: number;
  dataUrl: string;         // Base64 or object URL for preview
  uploadedAt: string;      // ISO timestamp
}
```

### GudangSerahTerima Interface

Conditionally collected for EKSTENSIFIKASI and INTENSIFIKASI pakets.

```typescript
export interface GudangSerahTerima {
  alamat: string;
  koordinat: string;       // Free-text coordinate e.g. '-2.5831, 120.3121'
  fotoTampakDepan: DokumenUpload | null;
  fotoTampakDalam: DokumenUpload | null;
}
```

### RabItem Interface

Single row in the RAB (Rencana Anggaran Biaya) table.

```typescript
export interface RabItem {
  id: string;              // Unique row ID (auto-generated)
  tahap: string;           // e.g. 'I', 'II', 'III'
  uraian: string;          // Item description
  volume: number | null;
  satuan: string;          // e.g. 'unit', 'kg', 'ha', 'ls'
  hargaSatuan: number | null;
  subTotal: number;        // Computed: volume × hargaSatuan
}
```

### PengusulanDraftState Interface

Complete draft state for the 3-step wizard, managed by `usePengusulanDraftStore`.

```typescript
export interface PengusulanDraftState {
  // Step 1
  selectedPaket: JenisSarpras | null;
  dokumenUploads: DokumenUpload[];          // Documents uploaded per persyaratan slot
  gudangSerahTerima: GudangSerahTerima | null;

  // Step 2
  rabItems: RabItem[];
  rabDitandatangani: DokumenUpload | null;  // Uploaded signed RAB

  // Step 3
  selectedPekebunIds: string[];             // IDs from usePekebunStore
  selectedLahanIds: string[];               // Lahan IDs from selected pekebun

  // Meta
  currentStep: 1 | 2 | 3;
  stepValidation: {
    step1Valid: boolean;
    step2Valid: boolean;
  };
}
```

---

## Pinia Store: `usePengusulanDraftStore` (`src/stores/pengusulanDraft.ts`)

### State

| Field | Type | Description |
|-------|------|-------------|
| `selectedPaket` | `JenisSarpras \| null` | Currently selected paket |
| `dokumenUploads` | `DokumenUpload[]` | Uploaded docs per persyaratan slot |
| `gudangSerahTerima` | `GudangSerahTerima \| null` | Gudang data (pupuk pakets only) |
| `rabItems` | `RabItem[]` | RAB table rows |
| `rabDitandatangani` | `DokumenUpload \| null` | Signed RAB upload |
| `selectedPekebunIds` | `string[]` | Pekebun selected in Step 3 |
| `selectedLahanIds` | `string[]` | Lahan selected in Step 3 |
| `currentStep` | `1 \| 2 \| 3` | Active wizard step |
| `stepValidation` | `{ step1Valid, step2Valid }` | Per-step validity flags |

### Getters

| Getter | Returns | Description |
|--------|---------|-------------|
| `isPupukPaket` | `boolean` | true when EKSTENSIFIKASI or INTENSIFIKASI |
| `rabTotal` | `number` | Sum of all `rabItems[].subTotal` |
| `isStep1Valid` | `boolean` | All wajib persyaratan uploaded + gudang filled if pupuk |
| `isStep2Valid` | `boolean` | Min 1 RAB row + `rabDitandatangani` present |
| `isStep3Valid` | `boolean` | Min 1 pekebun + 1 lahan selected |

### Actions

| Action | Description |
|--------|-------------|
| `setPaket(paket)` | Set selected paket; reset gudang if switching away from pupuk paket |
| `addDokumenUpload(doc)` | Add or replace upload for a persyaratan slot |
| `removeDokumenUpload(persyaratanId)` | Remove upload for a slot |
| `setGudang(data)` | Set gudang serah terima data |
| `addRabItem()` | Add empty RAB row |
| `updateRabItem(id, patch)` | Update a RAB row; auto-recompute subTotal |
| `removeRabItem(id)` | Delete a RAB row |
| `setRabDitandatangani(doc)` | Set signed RAB upload |
| `setSelectedPekebun(ids)` | Set selected pekebun IDs |
| `setSelectedLahan(ids)` | Set selected lahan IDs |
| `resetDraft()` | Reset entire draft state to initial values |
| `submitProposal()` | Build PengajuanSarpras payload and call `usePengusulanStore().createPengajuan()` |

---

## Persyaratan Config (`PAKET_PERSYARATAN_CONFIG`)

Static config object mapping each `JenisSarpras` to its `PersyaratanDokumen[]`. Defined in `src/views/pengusulan/StepPaketSarpras.vue` or extracted to `src/lib/pengusulan-persyaratan.config.ts`.

```typescript
// Example entry
EKSTENSIFIKASI: [
  { id: 'PROPOSAL',      nama: 'Proposal Usulan',              formatDownloadUrl: '/templates/proposal.docx', wajib: true },
  { id: 'AKTA_LEMBAGA',  nama: 'Akta Pendirian Lembaga',       formatDownloadUrl: null,                       wajib: true },
  { id: 'KTP_KETUA',     nama: 'KTP Ketua Lembaga',            formatDownloadUrl: null,                       wajib: true },
  { id: 'SK_KEMENKUMHAM',nama: 'SK Kemenkumham / NIB',         formatDownloadUrl: null,                       wajib: true },
  { id: 'STDB',          nama: 'STDB Pekebun',                 formatDownloadUrl: '/templates/stdb.pdf',      wajib: true },
  { id: 'PETA_LAHAN',    nama: 'Peta / Sketsa Lokasi Lahan',   formatDownloadUrl: '/templates/peta.pdf',      wajib: false },
  { id: 'FOTO_KEBUN',    nama: 'Foto Kondisi Kebun',           formatDownloadUrl: null,                       wajib: false },
]
```

---

## Key Entity Relationships

```
PengusulanDraftState
  ├── selectedPaket → JenisSarpras (1-of-9)
  ├── dokumenUploads[] → DokumenUpload (linked to PersyaratanDokumen.id)
  ├── gudangSerahTerima? → GudangSerahTerima
  │     ├── fotoTampakDepan → DokumenUpload
  │     └── fotoTampakDalam → DokumenUpload
  ├── rabItems[] → RabItem (editable rows, subTotal computed)
  ├── rabDitandatangani? → DokumenUpload
  ├── selectedPekebunIds[] → ref Pekebun.id (from usePekebunStore)
  └── selectedLahanIds[] → ref Lahan.id (from Pekebun.daftarLahan[])

On submit:
PengusulanDraftState → PengajuanSarpras (via usePengusulanStore.createPengajuan)
```

---

## Validation Rules

### Step 1 Validation Gate

- `selectedPaket` must be non-null
- All `wajib: true` persyaratan for the selected paket must have a corresponding `DokumenUpload`
- If `isPupukPaket`:
  - `gudangSerahTerima.alamat` must be non-empty
  - `gudangSerahTerima.koordinat` must be non-empty
  - `gudangSerahTerima.fotoTampakDepan` must be present
  - `gudangSerahTerima.fotoTampakDalam` must be present

### Step 2 Validation Gate

- `rabItems.length >= 1`
- Every rabItem must have non-null `uraian`, `volume > 0`, `satuan`, `hargaSatuan > 0`
- `rabDitandatangani` must be present (non-null)

### Step 3 Validation Gate (Submit)

- `selectedPekebunIds.length >= 1`
- `selectedLahanIds.length >= 1`

### File Upload Constraints

| Type | Accepted Formats | Max Size |
|------|-----------------|----------|
| Dokumen persyaratan | PDF, JPG, PNG | 10 MB |
| Foto gudang | JPG, PNG, WebP | 5 MB |
| RAB bertandatangan | PDF | 10 MB |
