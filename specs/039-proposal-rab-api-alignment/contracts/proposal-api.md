# Contract: Proposal & Proposal Documents API

**Base URL**: `/api/v1`  
**Contract Source**: [PROPOSAL_API_CONTRACT.md](../../../PROPOSAL_API_CONTRACT.md)

---

## 1. Proposal Endpoints

### 1.1 Create Proposal
- **Method**: `POST`
- **Path**: `/proposals`
- **Payload**:
```json
{
  "kelembagaan_id": 12,
  "paket_sarpras": "Paket 1 - Peremajaan Kelapa Sawit/Kelapa Dalam",
  "detail_usulan": "Usulan bantuan bibit kelompok tani",
  "no_rekomtek": "REK/2026/08/001",
  "bentuk_bantuan": "Barang",
  "lahan_ids": [101, 102],
  "storage_area": {
    "address": "Jl. Raya Kebun No. 12",
    "coordinate": "-0.589123, 109.342111",
    "interior_photo_file_id": 501,
    "exterior_photo_file_id": 502
  }
}
```
- **Response (`201 Created`)**:
```json
{
  "data": {
    "id": 1,
    "nomor_proposal": "SPKA108260001",
    "status": "DRAFT"
  },
  "message": "success"
}
```

---

### 1.2 List Proposals
- **Method**: `GET`
- **Path**: `/proposals`
- **Query Params**: `page`, `limit`, `search`, `status`, `start_date`, `end_date`, `sort_by`, `sort_order`
- **Response (`200 OK`)**:
```json
{
  "data": [
    {
      "id": 1,
      "nomor_proposal": "SPKA108260001",
      "kelembagaan_id": 12,
      "paket_sarpras": "Paket 1 - Peremajaan Kelapa Sawit/Kelapa Dalam",
      "detail_usulan": "Usulan bantuan bibit kelompok tani",
      "total_anggaran": 150000000,
      "status": "SUBMITTED",
      "created_at": "2026-08-24T09:00:00+07:00",
      "updated_at": "2026-08-24T09:30:00+07:00"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

### 1.3 Get Proposal Detail
- **Method**: `GET`
- **Path**: `/proposals/:id`
- **Response (`200 OK`)**: Full aggregate with `storage_area`, `pekebuns`, `documents`, `rabs`.

---

### 1.4 Update Proposal
- **Method**: `PATCH`
- **Path**: `/proposals/:id`
- **Payload**: Partial update of proposal fields, `lahan_ids`, and `storage_area`.

---

### 1.5 Delete Proposal
- **Method**: `DELETE`
- **Path**: `/proposals/:id`

---

## 2. Proposal Documents Endpoints

### 2.1 Bulk Create Proposal Documents
- **Method**: `POST`
- **Path**: `/proposals/:proposal_id/documents/bulk`
- **Payload**:
```json
{
  "documents": [
    { "file_id": 601, "document_type": "SURAT_PERMOHONAN" },
    { "file_id": 602, "document_type": "DOKUMEN_LEGALITAS_KELEMBAGAAN" },
    { "file_id": 603, "document_type": "SPTJM" }
  ]
}
```
- **Response (`201 Created`)**:
```json
{
  "data": { "inserted": 3 },
  "message": "success"
}
```

---

### 2.2 Bulk Sync Proposal Documents
- **Method**: `PUT`
- **Path**: `/proposals/:proposal_id/documents`
- **Payload**: Full replacement list of documents.
