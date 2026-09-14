# API Contracts: Tolak Dokumen RAB Dinas Kabupaten & Alur Revisi Dokumen RAB Kelembagaan Pekebun

## 1. Get Revision Detail
Mengambil detail usulan proposal yang dikembalikan beserta daftar dokumen yang ditolak dan dikategorikan per-tab.

- **Method / Endpoint**: `GET /api/v1/proposals/:id/revisi-detail`
- **Auth**: Bearer Token (Kelembagaan Pekebun / Pemohon)

### Response Payload (200 OK)
```json
{
  "data": {
    "id": 105,
    "nomor_proposal": "SPKA109260001",
    "kelembagaan_id": 12,
    "paket_sarpras": "PAKET_1",
    "total_anggaran": 150000000,
    "status": "REV_FROM_KAB",
    "notes": "[RAB Ditandatangani]: Stempel basah kelembagaan belum tertera pada dokumen.",
    "documents": [
      {
        "id": 201,
        "proposal_id": 105,
        "file_id": 501,
        "document_type": "RAB_PROPOSAL",
        "file_name": "Dokumen_RAB_SPKA109260001.pdf",
        "file_url": "https://storage.example.com/files/501",
        "file_size": "2048000",
        "file_extension": "pdf",
        "mime_type": "application/pdf"
      }
    ],
    "categorized_rejections": [
      {
        "category": "RAB",
        "target_id": 201,
        "target_key": "rab-signed",
        "item_label": "Dokumen RAB Ditandatangani",
        "notes": "Stempel basah kelembagaan belum tertera pada dokumen.",
        "is_resolved": false
      }
    ],
    "rabs": [
      {
        "id": 45,
        "proposal_id": 105,
        "flag": "PROPOSAL",
        "items": [
          {
            "id": 101,
            "rab_proposal_id": 45,
            "uraian": "Benih Kelapa Bersertifikat",
            "volume": 500,
            "unit": "batang",
            "price_per_unit": 250000,
            "total_price": 125000000,
            "item_type": "BARANG",
            "details": {
              "jenis": "Benih",
              "spesifikasi": "Varietas Unggul Lokal"
            }
          }
        ]
      }
    ]
  },
  "message": "success"
}
```

---

## 2. Bulk Proposal Document Validations (Dinas Kabupaten)
Menyimpan hasil verifikasi dan penolakan dokumen proposal dari verifikator Dinas Kabupaten.

- **Method / Endpoint**: `POST /api/v1/proposal-document-validations/bulk`
- **Auth**: Bearer Token (Dinas Kabupaten)

### Request Payload
```json
[
  {
    "dokumen_proposal_id": 201,
    "is_valid": false,
    "notes": "Stempel basah kelembagaan belum tertera pada dokumen.",
    "validated_by_role": "DINAS_KABUPATEN"
  }
]
```

### Response Payload (200 OK)
```json
{
  "data": [
    {
      "id": 301,
      "dokumen_proposal_id": 201,
      "is_valid": false,
      "notes": "Stempel basah kelembagaan belum tertera pada dokumen.",
      "validated_by_role": "DINAS_KABUPATEN"
    }
  ],
  "message": "success"
}
```

---

## 3. Resubmit Proposal Revision
Mengirimkan kembali usulan proposal setelah seluruh dokumen yang ditolak (termasuk Dokumen RAB) diperbarui.

- **Method / Endpoint**: `POST /api/v1/proposals/:id/resubmit`
- **Auth**: Bearer Token (Kelembagaan Pekebun / Pemohon)

### Request Payload
```json
{
  "updated_documents": [
    {
      "dokumen_proposal_id": 201,
      "file_id": 502
    }
  ]
}
```

### Response Payload (200 OK)
```json
{
  "data": {
    "id": 105,
    "nomor_proposal": "SPKA109260001",
    "status": "SUBMITTED",
    "updated_at": "2026-09-02T10:30:00Z"
  },
  "message": "success"
}
```
