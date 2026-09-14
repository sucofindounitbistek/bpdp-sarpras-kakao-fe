# Data Models: Multi-Lahan Pekebun

We update the interfaces and schemas to support a list of lands per farmer.

## 1. Interface Updates (`src/types/pekebun.ts`)

We add `daftarLahan` to `Pekebun` while keeping `lahan` for legacy compatibility:

```typescript
export interface Pekebun {
  id: string;
  nik: string;
  nama: string;
  nomorKK: string;
  statusPernikahan: StatusPernikahan;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  kodepos: string;
  nomorHP: string;
  dokumen: DokumenPekebun[];
  lahan: LahanPekebun;           // First land (for backward compatibility)
  daftarLahan?: LahanPekebun[];  // Array of all lands
  createdAt: string;
}
```

## 2. Schema Updates (`src/schemas/pekebun.schema.ts`)

We define a list schema to validate arrays of land records:

```typescript
export const lahanPekebunListSchema = z.array(lahanPekebunSchema).min(1, 'Minimal harus mengisi 1 data lahan');
```

## 3. Form Wizard Model Binding

The step component `StepDataLahanPekebun.vue` will bind to an array:

```typescript
const props = defineProps<{
  modelValue: LahanFormData[];
  errors?: Record<string, string>;
}>();
```
- Each validation error for land `i` field `f` is indexed in `errors` using syntax `lahan.[i].[f]` (e.g. `lahan.0.luasLahan`).
