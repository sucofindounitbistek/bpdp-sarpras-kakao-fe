# UI & API Contract: Direct Multi-Tier Pushback

**Feature**: `066-direct-multi-tier-pushback-sk-dirut`

## 1. Proposal Status Update Payload (`PATCH /proposals/{id}`)
```json
{
  "status": "REV_FROM_PROV",
  "notes": "[Catatan Penolakan Hasil Audit BPDP]:\n- SK Penetapan CPCL (Dinas Kabupaten/Kota): Data nomor SK tidak sesuai dengan lampiran.\n- RAB Final (Dinas Kabupaten/Kota): Harga satuan bibit melebihi standar harga daerah."
}
```

## 2. Bulk Proposal Document Validations Payload (`POST /proposal-document-validations/bulk`)
```json
[
  {
    "dokumen_proposal_id": 102,
    "proposal_document_id": 102,
    "pengajuan_id": 45,
    "proposal_id": 45,
    "document_type": "SK_CPCL",
    "is_valid": false,
    "notes": "Data nomor SK tidak sesuai dengan lampiran.",
    "validated_by_role": "BPDP_VERIFIKATOR"
  },
  {
    "dokumen_proposal_id": 105,
    "proposal_document_id": 105,
    "pengajuan_id": 45,
    "proposal_id": 45,
    "document_type": "RAB_FINAL",
    "is_valid": false,
    "notes": "Harga satuan bibit melebihi standar harga daerah.",
    "validated_by_role": "BPDP_VERIFIKATOR"
  }
]
```
