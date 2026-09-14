# UI Contract: Master Data Pekebun

**Branch**: `004-master-data-pekebun` | **Date**: 2026-07-30

## Overview

This contract defines the interfaces for the Master Data Pekebun feature from a frontend perspective. Since all backend integrations are simulated (mockup), contracts focus on Pinia store public APIs, component props/emits, and mock service interfaces.

---

## 1. Pekebun Store API (`usePekebunStore`)

### State

| Property | Type | Description |
|----------|------|-------------|
| `listPekebun` | `Ref<PekebunRecord[]>` | All registered Pekebun records |
| `isLoading` | `Ref<boolean>` | Loading state for async operations |

### Actions

| Action | Params | Returns | Description |
|--------|--------|---------|-------------|
| `addPekebun` | `payload: PekebunFormData` | `PekebunRecord` | Validate uniqueness of NIK, then add new Pekebun with lahan and documents |
| `getPekebunByNik` | `nik: string` | `PekebunRecord \| undefined` | Find existing Pekebun by NIK |
| `isNikRegistered` | `nik: string` | `boolean` | Check if NIK already exists in the list |
| `lookupDukcapil` | `nik: string` | `Promise<DukcapilResult \| null>` | Simulate Dukcapil lookup with 500ms delay. Returns identity data or null if not found |
| `getWilayahByParent` | `parentKode: string \| null, level: WilayahLevel` | `WilayahItem[]` | Get child regions filtered by parent code |

---

## 2. Dukcapil Lookup Mock Interface

### Request
```typescript
interface DukcapilLookupRequest {
  nik: string; // 16-digit NIK
}
```

### Response (Success)
```typescript
interface DukcapilResult {
  nama: string;
  nomorKK: string;
  statusPernikahan: 'BELUM_MENIKAH' | 'MENIKAH' | 'CERAI_HIDUP' | 'CERAI_MATI';
  tempatLahir: string;
  tanggalLahir: string; // ISO date
}
```

### Response (Not Found)
Returns `null` — UI shows error toast "Data Dukcapil tidak ditemukan".

### Behavior
- Simulated 500ms network delay via `setTimeout`
- Only known mock NIKs return data; unknown NIKs return null
- Known mock NIKs: 3-5 hardcoded entries in the store

---

## 3. Component Contracts

### `PekebunListView.vue` (Page)
- **Route**: `/master-data/pekebun`
- **Props**: None (page-level component)
- **Store deps**: `usePekebunStore` for list data
- **Emits**: None
- **Features**: Table with search (Nama/NIK), filter (Wilayah), "Detail" action button, "+ Tambah Pekebun" button

### `FormPekebunView.vue` (Page)
- **Route**: `/master-data/pekebun/tambah`
- **Props**: None (page-level component)
- **Store deps**: `usePekebunStore` for Dukcapil lookup, NIK validation, wilayah data, and addPekebun
- **Emits**: None
- **Features**: 3-step wizard using `useFormWizard(3)`

### `StepIdentitasPekebun.vue` (Step 1)
- **Props**: `modelValue: IdentitasFormData`, `dukcapilData: DukcapilResult | null`
- **Emits**: `update:modelValue`, `lookup-nik`
- **Fields**: NIK (input), Nama (readonly), Nomor KK (readonly), Status Pernikahan (readonly), Tempat & Tanggal Lahir (readonly), Alamat (input), Kodepos (input), Nomor HP (input)

### `StepUploadDokumenPekebun.vue` (Step 2)
- **Props**: `modelValue: DokumenFormData`
- **Emits**: `update:modelValue`
- **Fields**: 4 FileUpload areas (Scan KTP, Scan KK, Swafoto, Surat Kuasa)

### `StepDataLahanPekebun.vue` (Step 3)
- **Props**: `modelValue: LahanFormData`
- **Emits**: `update:modelValue`
- **Fields**: Jenis Legalitas (select), Nomor Legalitas (input), Tanggal Penerbitan (date), Luas Lahan (number), Provinsi/Kabupaten/Kecamatan/Desa (cascading selects), Alamat Kebun (input), Tahun Tanam (number), Jenis Bibit (input), Upload Scan Legalitas (FileUpload)

### `DetailPekebunModal.vue` (Modal)
- **Props**: `pekebun: PekebunRecord | null`, `isOpen: boolean`
- **Emits**: `close`
- **Features**: Read-only summary of identitas, dokumen list, and lahan data in tabbed or sectioned layout

---

## 4. Zod Validation Schemas

### `identitasPekebunSchema`
```typescript
z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  nama: z.string().min(2),          // from Dukcapil
  nomorKK: z.string().length(16),   // from Dukcapil
  statusPernikahan: z.enum([...]),   // from Dukcapil
  tempatLahir: z.string().min(2),   // from Dukcapil
  tanggalLahir: z.string(),         // from Dukcapil
  alamat: z.string().min(10, 'Alamat minimal 10 karakter'),
  kodepos: z.string().length(5, 'Kodepos harus 5 digit'),
  nomorHP: z.string().min(10, 'Nomor HP minimal 10 digit'),
})
```

### `lahanPekebunSchema`
```typescript
z.object({
  jenisLegalitas: z.enum(['SHM', 'NON_SHM']),
  nomorLegalitas: z.string().min(3),
  tanggalPenerbitanLegalitas: z.string().min(1),
  luasLahan: z.number().positive(),
  provinsiKode: z.string().min(1),
  kabupatenKode: z.string().min(1),
  kecamatanKode: z.string().min(1),
  desaKode: z.string().min(1),
  alamatKebun: z.string().min(5),
  tahunTanam: z.number().int().min(1950).max(currentYear),
  jenisBibit: z.string().min(2),
})
```

---

## 5. Route Registration

| Path | Name | Component | Guard |
|------|------|-----------|-------|
| `/master-data/pekebun` | `master-data-pekebun` | `PekebunListView.vue` | Role: PEMOHON |
| `/master-data/pekebun/tambah` | `master-data-pekebun-tambah` | `FormPekebunView.vue` | Role: PEMOHON |

---

## 6. Sidebar Menu Integration

Add new section under `LEMBAGA PEKEBUN` or create a new `MASTER DATA` section:

```typescript
{
  title: 'MASTER DATA',
  role: 'PEMOHON',
  items: [
    { label: 'Pekebun', to: '/master-data/pekebun', icon: Users },
  ],
}
```
