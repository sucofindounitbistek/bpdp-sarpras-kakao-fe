# Contract: Budget Plan (RAB) API

**Base URL**: `/api/v1`  
**Contract Source**: [PROPOSAL_API_CONTRACT.md](../../../PROPOSAL_API_CONTRACT.md)

---

## 1. RAB Endpoints

### 1.1 Create Budget Plan (RAB)
- **Method**: `POST`
- **Path**: `/rabs`
- **Payload**:
```json
{
  "proposal_id": 1,
  "flag": "PROPOSAL",
  "items": [
    {
      "uraian": "Pengadaan Bibit Kelapa Dalam Unggul",
      "volume": 1000,
      "unit": "Batang",
      "price_per_unit": 75000,
      "item_type": "BARANG",
      "details": {
        "jenis": "Bibit",
        "jumlahTahap1": 600,
        "jumlahTahap2": 400,
        "spesifikasi": "Sertifikasi Unggul Balit Palma"
      }
    }
  ]
}
```
- **Response (`201 Created`)**:
```json
{
  "data": {
    "id": 1,
    "proposal_id": 1,
    "flag": "PROPOSAL",
    "items": [
      {
        "id": 1,
        "rab_proposal_id": 1,
        "uraian": "Pengadaan Bibit Kelapa Dalam Unggul",
        "volume": 1000,
        "unit": "Batang",
        "price_per_unit": 75000,
        "item_type": "BARANG",
        "total_price": 75000000,
        "details": {
          "jenis": "Bibit",
          "jumlahTahap1": 600,
          "jumlahTahap2": 400,
          "spesifikasi": "Sertifikasi Unggul Balit Palma"
        }
      }
    ],
    "created_at": "2026-08-24T09:30:00+07:00",
    "updated_at": "2026-08-24T09:30:00+07:00"
  },
  "message": "success"
}
```

---

### 1.2 Get RAB by Proposal ID
- **Method**: `GET`
- **Path**: `/rabs/proposal/:proposal_id`
- **Response (`200 OK`)**: Returns `RabProposal` object.

---

### 1.3 Update Budget Plan (RAB)
- **Method**: `PUT`
- **Path**: `/rabs/:id`
- **Payload**:
```json
{
  "flag": "PROPOSAL_REVISI",
  "items": [
    {
      "uraian": "Pengadaan Bibit Kelapa Dalam Unggul (Penyesuaian)",
      "volume": 1200,
      "unit": "Batang",
      "price_per_unit": 75000,
      "item_type": "BARANG",
      "details": {
        "jenis": "Bibit",
        "jumlahTahap1": 700,
        "jumlahTahap2": 500,
        "spesifikasi": "Sertifikasi Unggul Balit Palma"
      }
    }
  ]
}
```

---

### 1.4 Delete Budget Plan (RAB)
- **Method**: `DELETE`
- **Path**: `/rabs/:id`
- **Response (`200 OK`)**: `{ "data": { "id": 1, "deleted": true }, "message": "success" }`
