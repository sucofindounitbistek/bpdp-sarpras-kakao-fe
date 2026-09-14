# API Contract Reference: Storage Area Alignment

No backend changes are required. The proposal payload includes `storage_area` in the response of `GET /api/v1/proposals/:id` and list endpoints:

```json
{
  "data": {
    "id": 22,
    "nomor_proposal": "SPKA108260009",
    "kelembagaan_id": 1,
    "paket_sarpras": "EKSTENSIFIKASI",
    "storage_area": {
      "id": 17,
      "address": "Desa Bone Nomor 1",
      "coordinate": "-2.58, 120.35",
      "interior_photo_file_id": null,
      "exterior_photo_file_id": 119,
      "exterior_photo_file_url": "https://bpdp-minio-api.scitechnology.id/bpdp/sarpras-kelapa/storage_area/d2af299b-fb36-4f2b-877f-27a214314cbc...",
      "coordinate_is_valid": null,
      "address_is_valid": null,
      "interior_photo_is_valid": null,
      "exterior_photo_is_valid": null
    }
  }
}
```

The frontend maps this to:
```typescript
{
  alamat: "Desa Bone Nomor 1",
  koordinat: "-2.58, 120.35",
  fotoTampakDepan: {
    persyaratanId: "gudang-depan",
    namaFile: "foto_tampak_depan_gudang.jpg",
    mimeType: "image/jpeg",
    ukuranBytes: 0,
    dataUrl: "https://bpdp-minio-api.scitechnology.id/bpdp/sarpras-kelapa/storage_area/d2af299b-fb36-4f2b-877f-27a214314cbc...",
    uploadedAt: "",
    fileId: 119
  },
  fotoTampakDalam: null
}
```
