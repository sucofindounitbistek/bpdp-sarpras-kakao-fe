# Data Model: Sync Farmer & Land Document Validations from Backend

## Farmer Validation Item Schema
```json
{
  "id": 1,
  "dokumen_pekebun_id": 37,
  "pengajuan_id": 22,
  "is_valid": true,
  "notes": "Valid KTP",
  "details": [
    { "field_name": "namaLengkap", "is_valid": true },
    { "field_name": "nik", "is_valid": true }
  ]
}
```

## Land Validation Item Schema
```json
{
  "id": 1,
  "dokumen_lahan_id": 22,
  "pengajuan_id": 22,
  "is_valid": true,
  "notes": "Valid Land Certificate"
}
```
