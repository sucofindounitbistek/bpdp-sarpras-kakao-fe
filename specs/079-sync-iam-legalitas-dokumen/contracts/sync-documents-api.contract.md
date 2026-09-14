# API Contract: Sinkronisasi Dua Arah Dokumen Legalitas KP dan Surat Penunjukan Ketua

**Feature**: `079-sync-iam-legalitas-dokumen`  
**Date**: 2026-09-09  
**Version**: 1.0.0

---

## 1. IAM Internal API (Provided by `bpdp-iam-be`)

### Endpoint 1.1: Ambil Metadata Dokumen Kelembagaan (Forward Sync)
* **Method**: `GET`
* **Path**: `/api/v1/internal/kelembagaan/{id}/documents`
* **Headers**:
  * `X-Internal-Secret`: `<BPDP_SERVICE_INTERNAL_SECRET>` (Wajib)
  * `Accept`: `application/json`

#### Response Success (`200 OK`)
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "kelembagaan_id": 105,
    "institution_name": "Koperasi Produsen Kelapa Makmur Jaya",
    "documents": [
      {
        "upload_name": "legalitas_kp",
        "file_id": 412,
        "object_key": "iam/kelembagaan/105/legalitas_kp_uuid123.pdf",
        "original_name": "Akta_Pendirian_Koperasi_Makmur.pdf",
        "filesize": "2450120",
        "content_type": "application/pdf"
      },
      {
        "upload_name": "penunjukan_ketua",
        "file_id": 413,
        "object_key": "iam/kelembagaan/105/penunjukan_ketua_uuid456.pdf",
        "original_name": "SK_Penunjukan_Ketua_2026.pdf",
        "filesize": "1120400",
        "content_type": "application/pdf"
      }
    ]
  }
}
```

#### Response Error (`401 Unauthorized`)
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing X-Internal-Secret"
  }
}
```

---

### Endpoint 1.2: Perbarui Dokumen Master dari Sarpras (Reverse Sync)
* **Method**: `PATCH`
* **Path**: `/api/v1/internal/kelembagaan/{id}/documents`
* **Headers**:
  * `X-Internal-Secret`: `<BPDP_SERVICE_INTERNAL_SECRET>` (Wajib)
  * `Content-Type`: `application/json`

#### Request Body
```json
{
  "source_service": "SARPRAS_KELAPA",
  "trigger_event": "PROPOSAL_REVISION",
  "proposal_number": "SPKA109260001",
  "submitted_by": "ketua_makmur_jaya",
  "documents": [
    {
      "upload_name": "legalitas_kp",
      "object_key": "sarpras/proposals/SPKA109260001/akta_perubahan_2026.pdf",
      "original_name": "Akta-Lembaga_SPKA109260001_Koperasi-Makmur.pdf",
      "filesize": "2850000",
      "content_type": "application/pdf"
    },
    {
      "upload_name": "penunjukan_ketua",
      "object_key": "sarpras/proposals/SPKA109260001/sk_ketua_baru_2026.pdf",
      "original_name": "Penunjukan-Ketua_SPKA109260001_Koperasi-Makmur.pdf",
      "filesize": "1250000",
      "content_type": "application/pdf"
    }
  ],
  "timestamp": "2026-09-09T10:00:00Z"
}
```

#### Response Success (`200 OK`)
```json
{
  "code": 200,
  "message": "Dokumen profil kelembagaan berhasil diperbarui dari Sarpras",
  "data": {
    "kelembagaan_id": 105,
    "updated_documents": ["legalitas_kp", "penunjukan_ketua"],
    "synced_at": "2026-09-09T10:00:01Z"
  }
}
```

---

## 2. Sarpras Backend API (Provided by `bpdp-sarpras-kelapa-be`)

### Endpoint 2.1: Inisialisasi Dokumen Usulan Baru dari IAM
* **Method**: `GET`
* **Path**: `/api/v1/proposals/initial-documents?kelembagaan_id={id}`
* **Headers**:
  * `Authorization`: `Bearer <JWT_TOKEN_PEMOHON>`

#### Response Success (`200 OK`)
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "kelembagaan_id": 105,
    "documents": [
      {
        "document_type": "AKTA_LEMBAGA",
        "source": "IAM_SYNC",
        "file_name": "Akta-Lembaga_DRAFT_Koperasi-Makmur.pdf",
        "file_url": "https://storage.domain/presigned/iam/kelembagaan/105/legalitas_kp_uuid123.pdf?...",
        "file_size": "2.4 MB",
        "content_type": "application/pdf",
        "is_available": true
      },
      {
        "document_type": "PENUNJUKAN_KETUA",
        "source": "IAM_SYNC",
        "file_name": "Penunjukan-Ketua_DRAFT_Koperasi-Makmur.pdf",
        "file_url": "https://storage.domain/presigned/iam/kelembagaan/105/penunjukan_ketua_uuid456.pdf?...",
        "file_size": "1.1 MB",
        "content_type": "application/pdf",
        "is_available": true
      }
    ]
  }
}
```

---

### Endpoint 2.2: Pemicu Sinkronisasi Ulang dari IAM saat Revisi
* **Method**: `POST`
* **Path**: `/api/v1/proposals/{id}/re-sync-iam`
* **Headers**:
  * `Authorization`: `Bearer <JWT_TOKEN_PEMOHON>`

#### Response Success (`200 OK`)
```json
{
  "code": 200,
  "message": "Pemeriksaan pembaruan berkas dari IAM berhasil",
  "data": {
    "proposal_id": 88,
    "has_changes": true,
    "changed_documents": [
      {
        "document_type": "PENUNJUKAN_KETUA",
        "old_file_name": "SK_Ketua_Lama.pdf",
        "new_file_name": "SK_Pengurus_2026_2029.pdf",
        "version": 2
      }
    ]
  }
}
```
