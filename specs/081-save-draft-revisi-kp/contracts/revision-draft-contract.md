# API & Service Contract: Simpan Draf Revisi Proposal

## 1. Backend Endpoint: `PUT /proposals/:id/revisi`

### Request Body (JSON)
```json
{
  "is_draft": true,
  "updated_documents": [
    {
      "dokumen_proposal_id": 12,
      "file_id": 841
    }
  ],
  "updated_farmer_data": [
    {
      "farmer_id": 45,
      "name": "Budi Santoso",
      "address": "Desa Makmur RT 02"
    }
  ],
  "updated_farmer_documents": [
    {
      "pekebun_id": 45,
      "document_type": "KTP",
      "file_id": 842
    }
  ],
  "storage_area": {
    "address": "Gudang Utama RT 01",
    "coordinate": "-0.1234, 101.4567"
  }
}
```

### Response (200 OK)
```json
{
  "data": {
    "id": 105,
    "nomor_proposal": "SPKA10926001",
    "status": "REV_FROM_KAB",
    "is_draft": true,
    "message": "Draf revisi berhasil disimpan"
  },
  "message": "success"
}
```

## 2. Frontend Service Contract: `proposalService.resubmitProposal`

```typescript
async resubmitProposal(
  proposalId: string | number,
  updatedDocuments: Array<{ dokumen_proposal_id: number; file_id: number }>,
  storageArea?: {
    address?: string;
    coordinate?: string;
    exterior_photo_file_id?: number;
    interior_photo_file_id?: number;
  },
  updatedFarmerDocuments?: Array<{ farmer_document_id?: number; pekebun_id?: number; document_type?: string; file_id: number }>,
  updatedLandDocuments?: Array<{ land_document_id?: number; lahan_id?: number; document_type?: string; file_id: number }>,
  updatedRabDocument?: { rab_proposal_id: number; file_id: number },
  updatedRabItems?: Array<{ rab_item_id: number; uraian?: string; volume?: number; unit?: string; price_per_unit?: number }>,
  updatedFarmerData?: Array<{ farmer_id: number; name?: string; nik?: string; nomor_kk?: string; address?: string }>,
  updatedLandData?: Array<{ land_id: number; luas_lahan?: number; jenis_legalitas?: string; nomor_legalitas?: string; nomor_surat_beda_nama?: string }>,
  isDraft?: boolean
): Promise<any>
```
