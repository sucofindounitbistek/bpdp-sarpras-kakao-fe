# API Contract: Get Proposal Queue

## Endpoint

- **Method**: `GET`
- **Path**: `/api/v1/proposals`
- **Authorization**: `Bearer <token>`

## Request Parameters

| Parameter | Type | Required | Value / Description |
|---|---|---|---|
| `status` | `string` | Yes | `"SUBMITTED"` |

## Response Body

### Success (`200 OK`)

```json
{
  "data": [
    {
      "id": 1,
      "nomor_proposal": "SPKA108260001",
      "kelembagaan_id": 12,
      "paket_sarpras": "Paket 1 - Peremajaan Kelapa Sawit/Kelapa Dalam",
      "detail_usulan": "Usulan bantuan...",
      "total_anggaran": 150000000,
      "no_rekomtek": "REK/2026/08/001",
      "bentuk_bantuan": "Barang",
      "status": "SUBMITTED",
      "created_at": "2026-08-24T09:00:00+07:00",
      "updated_at": "2026-08-24T09:30:00+07:00",
      "lembaga": {
        "namaLembaga": "Koperasi Tani Kelapa Sejahtera"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```
