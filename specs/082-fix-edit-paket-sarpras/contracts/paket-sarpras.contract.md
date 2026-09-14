# API Contract: Master Paket Sarpras & Dokumen Persyaratan

**Feature**: `082-fix-edit-paket-sarpras`  
**Date**: 2026-09-12  
**Status**: Verified  

---

## 1. Detail Paket Sarpras

### `GET /api/v1/master/paket-sarpras/:code`

- **Auth**: Public / Bearer Token
- **Path Param**: `code` (string, contoh: `EKSTENSIFIKASI`)

#### Response Success (200 OK)
```json
{
  "data": {
    "id": 1,
    "kategori_id": 1,
    "kategori_code": "EKSTENSIFIKASI",
    "code": "EKSTENSIFIKASI",
    "name": "Ekstensifikasi (Benih, Pupuk, Pestisida)",
    "label": "Ekstensifikasi (Benih, Pupuk, Pestisida)",
    "description": "Perluasan areal tutupan kelapa",
    "icon": "🌱",
    "is_pupuk": true,
    "jumlah_tahap": 2,
    "kode_penomoran": "1",
    "sort_order": 1,
    "is_active": true,
    "syarat_minimum": {
      "minimal_pekebun": 20,
      "minimal_luas_ha": 50,
      "jarak_antar_kebun_km": 10,
      "kondisi_validasi": "OR",
      "keterangan": "Atau luas minimal 50 ha"
    },
    "dokumen_persyaratan": [
      {
        "id": 1,
        "dokumen_code": "LEGALITAS_KP",
        "is_wajib": true,
        "sort_order": 1,
        "keterangan": null,
        "dokumen": {
          "id": 1,
          "code": "LEGALITAS_KP",
          "name": "Legalitas KP",
          "description": "",
          "format_download_url": "",
          "allowed_mime_types": "application/pdf",
          "max_size_bytes": 5242880,
          "is_active": true,
          "is_wajib": true
        }
      }
    ],
    "kategori": {
      "id": 1,
      "code": "EKSTENSIFIKASI",
      "name": "Ekstensifikasi",
      "description": "",
      "icon": "🌱",
      "sort_order": 1,
      "is_active": true
    }
  },
  "message": "success"
}
```

---

## 2. Update Paket Sarpras

### `PUT /api/v1/master/paket-sarpras/:code`

- **Auth**: Bearer Token (Superadmin / Admin BPDPKS)
- **Path Param**: `code` (string, contoh: `EKSTENSIFIKASI`)
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "kategori_code": "EKSTENSIFIKASI",
  "name": "Ekstensifikasi (Benih, Pupuk, Pestisida)",
  "label": "Ekstensifikasi (Benih, Pupuk, Pestisida)",
  "description": "Perluasan areal tutupan kelapa",
  "icon": "🌱",
  "is_pupuk": true,
  "jumlah_tahap": 2,
  "kode_penomoran": "1",
  "minimal_pekebun": 20,
  "minimal_luas_ha": 50,
  "keterangan": "Atau luas minimal 50 ha",
  "dokumen_codes": [
    "LEGALITAS_KP",
    "SIMLUHTAN",
    "GAMBAR_LAHAN",
    "RAB_RK",
    "PERNYATAAN_LUAS"
  ]
}
```

---

## 3. Dokumen Persyaratan Catalog API

### `POST /api/v1/master/dokumen-persyaratan` & `PUT /api/v1/master/dokumen-persyaratan/:code`

- **Auth**: Bearer Token
- **Body**:
```json
{
  "code": "LEGALITAS_KP",
  "name": "Legalitas KP",
  "description": "Dokumen legalitas kelembagaan pekebun",
  "format_download_url": "https://...",
  "allowed_mime_types": "application/pdf",
  "max_size_bytes": 5242880,
  "is_active": true,
  "is_wajib": true
}
```
