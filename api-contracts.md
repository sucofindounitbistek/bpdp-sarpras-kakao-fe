# BPDP Sarpras Kakao API Contracts

**Base URL:** `http://localhost:8080/api/v1`
**Swagger:** `http://localhost:8080/swagger/index.html`
**Auth:** Bearer JWT (`Authorization: Bearer <token>`)

---

## Common Response Formats

### Success
```json
{
  "data": { ... },
  "message": "success"
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "description"
  }
}
```

Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`

### Delete Response
```json
{
  "data": { "id": 1, "deleted": true },
  "message": "success"
}
```

---

## 1. Pekebun (Farmer Profile)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/pekebun` | Create profile |
| GET | `/pekebun` | List profiles (paginated) |
| GET | `/pekebun/:id` | Get by ID |
| PUT | `/pekebun/:id` | Update profile |
| DELETE | `/pekebun/:id` | Delete profile |

### POST /pekebun — Create
**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| nik | string | yes | 16-char NIK |
| name | string | no | |
| nomor_kk | string | no | 16-char |
| marriage_status | string | no | |
| place_of_birth | string | no | |
| date_of_birth | string | no | YYYY-MM-DD |
| address | string | yes | |
| postcode | string | yes | numeric |
| phone_number | string | yes | |
| kelembagaan_id | string | yes | Institution ID |
| is_draft | bool | no | |
| scan_ktp | file | yes | JPG/PNG, max 5MB |
| scan_kk | file | yes | JPG/PNG, max 5MB |
| swafoto | file | yes | JPG/PNG, max 5MB |
| surat_kuasa | file | yes | PDF, max 5MB |

**Response 201:**
```json
{
  "data": {
    "id": 1,
    "kelembagaan_id": "INS001",
    "nik": "3201234567890123",
    "name": "John Doe",
    "nomor_kk": "3201234567890123",
    "marriage_status": "married",
    "place_of_birth": "Bandung",
    "date_of_birth": "1980-01-15",
    "address": "Jl. Merdeka No.1",
    "postcode": "40123",
    "phone_number": "081234567890",
    "is_draft": false,
    "created_at": "2026-08-16T10:00:00+07:00",
    "updated_at": "2026-08-16T10:00:00+07:00",
    "documents": [
      {
        "id": 1,
        "document_type": "scan_ktp",
        "file_name": "ktp.jpg",
        "file_url": "https://storage.example.com/files/abc.jpg",
        "file_size": "204800",
        "file_extension": "jpg",
        "created_at": "2026-08-16T10:00:00+07:00"
      }
    ]
  },
  "message": "success"
}
```

### GET /pekebun — List
**Query Params:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| page | int | 1 | |
| limit | int | 10 | |
| search | string | "" | Search by name or NIK |
| kelembagaan_id | string | "" | Filter by institution |

**Response 200:**
```json
{
  "data": [ /* PekebunResponse[] */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

### GET /pekebun/:id — Get by ID
**Response 200:** Same as `PekebunResponse` wrapped in `{ "data": ..., "message": "success" }`

### PUT /pekebun/:id — Update
**Content-Type:** `multipart/form-data` (optional, can be JSON-like form)

All fields optional. Only send fields to update. Documents replace individually.

| Field | Type | Required |
|-------|------|----------|
| nik | string | no |
| name | string | no |
| nomor_kk | string | no |
| marriage_status | string | no |
| place_of_birth | string | no |
| date_of_birth | string | no |
| address | string | no |
| postcode | string | no |
| phone_number | string | no |
| kelembagaan_id | string | no |
| is_draft | bool | no |
| scan_ktp | file | no |
| scan_kk | file | no |
| swafoto | file | no |
| surat_kuasa | file | no |

**Response 200:** Same as `PekebunResponse`

### DELETE /pekebun/:id — Delete
**Response 200:** `{ "data": { "id": 1, "deleted": true }, "message": "success" }`

---

## 2. Lahan (Land Plot)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/lahan` | Create land plot |
| GET | `/lahan?pekebun_id=` | List by farmer |
| GET | `/lahan/:id` | Get by ID |
| PUT | `/lahan/:id` | Update land plot |
| DELETE | `/lahan/:id` | Delete land plot |

### POST /lahan — Create
**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| pekebun_id | int | yes | Farmer profile ID |
| jenis_legalitas | string | yes | `"SHM"` or `"Non SHM"` |
| nomor_legalitas | string | yes | |
| tanggal_penerbitan_legalitas | string | yes | YYYY-MM-DD |
| luas_lahan | number | yes | m², decimal(12,2) |
| kode_provinsi | string | yes | |
| kode_kabupaten | string | yes | |
| kode_kecamatan | string | yes | |
| kode_desa | string | yes | |
| alamat_kebun | string | yes | |
| tahun_tanam | int | yes | |
| jenis_bibit | string | yes | |
| nomor_surat_beda_nama | string | no | |
| coordinates | string | yes | JSON array of `{lat, lng}`, 3-500 points, closed polygon |
| scan_legalitas | file | yes | JPG/PNG, max 5MB |
| surat_keterangan_beda_nama | file | no | PDF, max 5MB |

**coordinates format:**
```json
[{"lat": -6.2, "lng": 106.8}, {"lat": -6.21, "lng": 106.81}, {"lat": -6.2, "lng": 106.81}]
```

**Response 201:**
```json
{
  "data": {
    "id": 1,
    "pekebun_id": 1,
    "jenis_legalitas": "SHM",
    "nomor_legalitas": "SHM-001",
    "tanggal_penerbitan_legalitas": "2020-01-15",
    "luas_lahan": 2500.50,
    "kode_provinsi": "32",
    "kode_kabupaten": "3201",
    "kode_kecamatan": "320101",
    "kode_desa": "3201010001",
    "alamat_kebun": "Blok A No.3",
    "tahun_tanam": 2020,
    "jenis_bibit": "Kakao Mulia",
    "nomor_surat_beda_nama": null,
    "coordinates": [
      {"lat": -6.2, "lng": 106.8},
      {"lat": -6.21, "lng": 106.81}
    ],
    "documents": [
      {
        "id": 1,
        "document_type": "scan_legalitas",
        "mime_type": "image/jpeg",
        "created_at": "2026-08-16T10:00:00+07:00"
      }
    ],
    "created_at": "2026-08-16T10:00:00+07:00",
    "updated_at": "2026-08-16T10:00:00+07:00"
  },
  "message": "success"
}
```

### GET /lahan?pekebun_id= — List by Farmer
| Param | Type | Required |
|-------|------|----------|
| pekebun_id | int | yes |

**Response 200:**
```json
{
  "data": [ /* LahanResponse[] */ ]
}
```
Note: This endpoint returns `{ "data": [...] }` directly (no `message` wrapper per handler code).

### GET /lahan/:id — Get by ID
**Response 200:** Same as `LahanResponse` wrapped in `{ "data": ..., "message": "success" }`

### PUT /lahan/:id — Update
**Content-Type:** `multipart/form-data` (optional)

All fields optional. Only send fields to update.

| Field | Type | Required |
|-------|------|----------|
| jenis_legalitas | string | no |
| nomor_legalitas | string | no |
| tanggal_penerbitan_legalitas | string | no |
| luas_lahan | number | no |
| kode_provinsi | string | no |
| kode_kabupaten | string | no |
| kode_kecamatan | string | no |
| kode_desa | string | no |
| alamat_kebun | string | no |
| tahun_tanam | int | no |
| jenis_bibit | string | no |
| nomor_surat_beda_nama | string | no |
| coordinates | string | no |
| scan_legalitas | file | no |
| surat_keterangan_beda_nama | file | no |

**Response 200:** Same as `LahanResponse`

### DELETE /lahan/:id — Delete
**Response 200:** `{ "data": { "id": 1, "deleted": true }, "message": "success" }`

---

## Data Types Summary

### PekebunResponse
| Field | Type | Nullable |
|-------|------|----------|
| id | uint | |
| kelembagaan_id | string | |
| nik | string | |
| name | string | yes |
| nomor_kk | string | yes |
| marriage_status | string | yes |
| place_of_birth | string | yes |
| date_of_birth | string | yes |
| address | string | |
| postcode | string | |
| phone_number | string | |
| is_draft | bool | yes |
| created_at | string (ISO8601) | |
| updated_at | string (ISO8601) | |
| documents | DocumentResponse[] | |

### PekebunDocumentResponse
| Field | Type |
|-------|------|
| id | uint |
| document_type | string |
| file_name | string |
| file_url | string |
| file_size | string |
| file_extension | string |
| created_at | string (ISO8601) |

### LahanResponse
| Field | Type | Nullable |
|-------|------|----------|
| id | uint | |
| pekebun_id | uint | |
| jenis_legalitas | string | |
| nomor_legalitas | string | |
| tanggal_penerbitan_legalitas | string (YYYY-MM-DD) | |
| luas_lahan | float64 | |
| kode_provinsi | string | |
| kode_kabupaten | string | |
| kode_kecamatan | string | |
| kode_desa | string | |
| alamat_kebun | string | |
| tahun_tanam | int | |
| jenis_bibit | string | |
| nomor_surat_beda_nama | string | yes |
| coordinates | `{lat: number, lng: number}[]` | |
| documents | LahanDocumentResponse[] | |
| created_at | string (ISO8601) | |
| updated_at | string (ISO8601) | |

### LahanDocumentResponse
| Field | Type |
|-------|------|
| id | uint |
| document_type | string |
| mime_type | string |
| created_at | string (ISO8601) |

### PaginationMeta
| Field | Type |
|-------|------|
| page | int |
| limit | int |
| total | int64 |

---

## Notes
- JWT middleware commented out in main.go — auth not enforced yet.
- All timestamps: ISO8601 format (`2006-01-02T15:04:05+07:00`).
- All dates: `YYYY-MM-DD`.
- All numeric IDs: unsigned integers.
- Document types (pekebun): `scan_ktp`, `scan_kk`, `swafoto`, `surat_kuasa`.
- Document types (lahan): `scan_legalitas`, `surat_keterangan_beda_nama`.
- Create/Update always use `multipart/form-data` (even for text-only updates).