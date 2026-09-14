# Contracts: Pekebun & Lahan API

**Date**: 2026-08-16
**Reference**: `api-contracts.md` at project root

## Service Interfaces

### pekebun.service.ts

```ts
import api from './api';

export interface PekebunListParams {
  page?: number;
  limit?: number;
  search?: string;
  kelembagaan_id?: string;
}

export const pekebunService = {
  getList(params?: PekebunListParams): Promise<{ data: any[]; meta: any } | null>,
  getById(id: string | number): Promise<{ data: any } | null>,
  create(formData: FormData): Promise<{ data: any } | null>,
  update(id: string | number, formData: FormData): Promise<{ data: any } | null>,
  delete(id: string | number): Promise<{ data: { id: number; deleted: boolean } } | null>,
};
```

### lahan.service.ts

```ts
import api from './api';

export const lahanService = {
  getByPekebunId(pekebunId: string | number): Promise<{ data: any[] } | null>,
  getById(id: string | number): Promise<{ data: any } | null>,
  create(formData: FormData): Promise<{ data: any } | null>,
  update(id: string | number, formData: FormData): Promise<{ data: any } | null>,
  delete(id: string | number): Promise<{ data: { id: number; deleted: boolean } } | null>,
};
```

## API Endpoints Used

| Service Method | HTTP | Endpoint | Content-Type |
|---------------|------|----------|--------------|
| pekebunService.getList | GET | `/pekebun?page=&limit=&search=&kelembagaan_id=` | application/json |
| pekebunService.getById | GET | `/pekebun/:id` | application/json |
| pekebunService.create | POST | `/pekebun` | multipart/form-data |
| pekebunService.update | PUT | `/pekebun/:id` | multipart/form-data |
| pekebunService.delete | DELETE | `/pekebun/:id` | application/json |
| lahanService.getByPekebunId | GET | `/lahan?pekebun_id=` | application/json |
| lahanService.getById | GET | `/lahan/:id` | application/json |
| lahanService.create | POST | `/lahan` | multipart/form-data |
| lahanService.update | PUT | `/lahan/:id` | multipart/form-data |
| lahanService.delete | DELETE | `/lahan/:id` | application/json |

## Response Shapes

### Success
```json
{ "data": { ... }, "message": "success" }
```

### Paginated List
```json
{ "data": [ ... ], "meta": { "page": 1, "limit": 10, "total": 42 } }
```

### Error
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "description" } }
```

### Delete
```json
{ "data": { "id": 1, "deleted": true }, "message": "success" }
```

## Axios Interceptor Adjustment

The error interceptor in `src/services/api.ts` must be updated to read the nested error format:

```ts
// Current (line 30):
const message = error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan';

// Adjusted:
const message = error.response?.data?.error?.message 
  || error.response?.data?.message 
  || error.message 
  || 'Terjadi kesalahan jaringan';
```

## Store Contract

### usePekebunStore (adjusted)

```ts
// State
listPekebun: Ref<Pekebun[]>      // API-fetched list
isLoading: Ref<boolean>           // Loading state
pagination: Ref<{ page: number; limit: number; total: number }>

// Actions (API-backed)
fetchPekebunList(params?: { page?: number; limit?: number; search?: string; kelembagaan_id?: string }): Promise<void>
fetchPekebunById(id: string): Promise<Pekebun | null>
createPekebun(identitas: IdentitasFormData, dokumen: DokumenFormData): Promise<Pekebun | null>
updatePekebun(id: string, identitas: IdentitasFormData, dokumen: DokumenFormData): Promise<Pekebun | null>
deletePekebun(id: string): Promise<boolean>

// Mock actions (unchanged)
lookupDukcapil(nik: string): Promise<DukcapilResult | null>
getWilayahByParent(parentKode: string | null, level: WilayahLevel): WilayahItem[]
getWilayahNama(kode: string): string
isNikRegistered(nik: string): boolean
```

### useLahanStore (new)

```ts
// State
lahanList: Ref<Lahan[]>
isLoading: Ref<boolean>

// Actions
fetchLahanByPekebunId(pekebunId: string): Promise<Lahan[]>
fetchLahanById(id: string): Promise<Lahan | null>
createLahan(pekebunId: string, formData: LahanFormData): Promise<Lahan | null>
updateLahan(id: string, formData: LahanFormData): Promise<Lahan | null>
deleteLahan(id: string): Promise<boolean>
synchronizeLahan(pekebunId: string, lahanList: LahanFormData[], existingLahanIds: string[]): Promise<Lahan[]>
```