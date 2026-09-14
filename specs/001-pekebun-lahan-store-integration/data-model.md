# Data Model: Pekebun & Lahan

**Date**: 2026-08-16

## Entity: Pekebun (Farmer Profile)

API contract fields (snake_case) → TypeScript interface (camelCase):

| API Field | Type | TS Interface Field | Type | Notes |
|-----------|------|--------------------|------|-------|
| id | uint | id | string | Converted to string for consistency |
| kelembagaan_id | string | kelembagaanId | string | Institution ID |
| nik | string | nik | string | 16-char |
| name | string \| null | nama | string | Nullable in API |
| nomor_kk | string \| null | nomorKK | string | Nullable |
| marriage_status | string \| null | statusPernikahan | StatusPernikahan | Enum mapping |
| place_of_birth | string \| null | tempatLahir | string | |
| date_of_birth | string \| null | tanggalLahir | string | YYYY-MM-DD |
| address | string | alamat | string | Required |
| postcode | string | kodepos | string | Required |
| phone_number | string | nomorHP | string | Required |
| is_draft | bool \| null | isDraft | boolean | |
| created_at | string (ISO8601) | createdAt | string | |
| updated_at | string (ISO8601) | updatedAt | string | Optional |
| documents | DocumentResponse[] | dokumen | DokumenPekebun[] | See below |

**State transitions**: None (CRUD entity, no workflow).

**Validation rules** (from Zod schemas, client-side):
- NIK: 16 digits, required
- Address: required
- Postcode: numeric, required
- Phone: required, min 10 digits
- Date of birth: valid date, not future
- Documents: 4 files required (scan_ktp, scan_kk, swafoto, surat_kuasa)

## Entity: Lahan (Land Plot)

| API Field | Type | TS Interface Field | Type | Notes |
|-----------|------|--------------------|------|-------|
| id | uint | id | string | |
| pekebun_id | uint | pekebunId | string | FK to Pekebun |
| jenis_legalitas | string | jenisLegalitas | JenisLegalitas | "SHM" or "Non SHM" |
| nomor_legalitas | string | nomorLegalitas | string | |
| tanggal_penerbitan_legalitas | string | tanggalPenerbitanLegalitas | string | YYYY-MM-DD |
| luas_lahan | float64 | luasLahan | number | m², decimal(12,2) |
| kode_provinsi | string | provinsiKode | string | Wilayah code |
| kode_kabupaten | string | kabupatenKode | string | |
| kode_kecamatan | string | kecamatanKode | string | |
| kode_desa | string | desaKode | string | |
| alamat_kebun | string | alamatKebun | string | |
| tahun_tanam | int | tahunTanam | number | |
| jenis_bibit | string | jenisBibit | string | |
| nomor_surat_beda_nama | string \| null | nomorSuratBedaNama | string | Optional |
| coordinates | `{lat, lng}[]` | koordinatPoligon | string | JSON stringified |
| documents | LahanDocumentResponse[] | dokumen | LahanDocument[] | |
| created_at | string (ISO8601) | createdAt | string | |
| updated_at | string (ISO8601) | updatedAt | string | Optional |

**Validation rules**:
- jenis_legalitas: "SHM" or "Non SHM", required
- nomor_legalitas: required
- luas_lahan: > 0, required
- coordinates: 3-500 points, closed polygon, required
- tahun_tanam: valid year, required
- scan_legalitas: file required for new entries

## Entity: PekebunDocument

| API Field | Type | TS Interface Field | Type |
|-----------|------|--------------------|------|
| id | uint | id | string |
| document_type | string | tipeDokumen | TipeDokumenPekebun |
| file_name | string | namaFile | string |
| file_url | string | fileUrl | string |
| file_size | string | ukuranBytes | number |
| file_extension | string | mimeType | string |
| created_at | string | - | - |

## Entity: LahanDocument

| API Field | Type | TS Interface Field | Type |
|-----------|------|--------------------|------|
| id | uint | id | string |
| document_type | string | tipeDokumen | string |
| mime_type | string | mimeType | string |
| created_at | string | - | - |

## Pagination Meta

| API Field | Type | TS Interface Field | Type |
|-----------|------|--------------------|------|
| page | int | page | number |
| limit | int | limit | number |
| total | int64 | total | number |

## Relationships

```
Pekebun 1 ──── * Lahan        (pekebun_id FK)
Pekebun 1 ──── * PekebunDocument (embedded in response)
Lahan   1 ──── * LahanDocument   (embedded in response)
```

## Form Data Types (unchanged)

`IdentitasFormData`, `DokumenFormData`, `LahanFormData` remain as defined in `src/types/pekebun.ts`. These are UI-layer types distinct from the API response types. The store maps between form data and API payloads.