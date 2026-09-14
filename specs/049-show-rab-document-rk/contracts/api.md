# API Contract Reference: Show RAB Document using RAB_RK

No backend changes are required. The proposal's document array payload returns the `RAB_RK` document as part of the `dokumen` array of the GET `/api/v1/proposals/:id` response:

```json
{
  "id": "prop-123",
  "dokumen": [
    {
      "id": "doc-999",
      "tipeDokumen": "RAB_RK",
      "namaFile": "rencana_kerja_final.pdf",
      "urlFile": "https://storage.bpdp.go.id/docs/rencana_kerja_final.pdf",
      "ukuranBytes": 102456,
      "isValid": false
    }
  ]
}
```
