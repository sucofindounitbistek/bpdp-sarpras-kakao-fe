# Proposal API Contract: sarpras-package-rules

This document outlines the API contracts for the Sarpras proposal requirements and submissions. Since this application operates in a client-simulated environment (FE mock data), this schema defines the simulated contract structures.

## 1. GET /api/v1/pengusulan/persyaratan
Returns the configuration for all selectable packages, their required documents, and minimum parameters.

* **Response Status**: `200 OK`
* **Response Body**:
```json
[
  {
    "id": "EKSTENSIFIKASI",
    "label": "Ekstensifikasi (Benih, Pupuk, Pestisida)",
    "icon": "🌱",
    "description": "Pengadaan benih kakao hibrida unggul, pupuk, dan pestisida untuk perluasan area.",
    "isPupuk": true,
    "minRule": {
      "minimalPekebun": 20,
      "minimalLuasHa": 3,
      "jarakAntarKebunKm": null,
      "keterangan": ""
    },
    "persyaratan": [
      {
        "id": "LEGALITAS_KP",
        "nama": "Legalitas KP",
        "formatDownloadUrl": null,
        "wajib": true
      },
      {
        "id": "SIMLUHTAN",
        "nama": "Keterangan Simluhtan (Poktan/Gapoktan)",
        "formatDownloadUrl": null,
        "wajib": true
      },
      {
        "id": "GAMBAR_LAHAN",
        "nama": "Gambar Lahan/Kebun Berkoordinat",
        "formatDownloadUrl": null,
        "wajib": true
      },
      {
        "id": "RAB_RK",
        "nama": "Rencana Kerja",
        "formatDownloadUrl": null,
        "wajib": true
      },
      {
        "id": "PERNYATAAN_LUAS",
        "nama": "Pernyataan luas lahan dan umur tanaman",
        "formatDownloadUrl": "/templates/pernyataan-luas.docx",
        "wajib": true
      },
      {
        "id": "REFERENSI_HARGA",
        "nama": "Referensi harga dari penyedia",
        "formatDownloadUrl": null,
        "wajib": true
      },
      {
        "id": "PERNYATAAN_TANPA_BAKAR",
        "nama": "Pernyataan pembukaan lahan tanpa bakar",
        "formatDownloadUrl": "/templates/pernyataan-tanpa-bakar.docx",
        "wajib": true
      },
      {
        "id": "DETAIL_PEKEBUN",
        "nama": "Detail RAB Masing-Masing Pekebun",
        "formatDownloadUrl": "/templates/detail-pekebun.xlsx",
        "wajib": true
      }
    ]
  }
]
```

## 2. POST /api/v1/pengusulan
Submits a new proposal for validation and processing.

* **Request Body**:
```json
{
  "jenisSarpras": "EKSTENSIFIKASI",
  "detailUsulan": "Usulan Ekstensifikasi Kakao 2026",
  "totalAnggaranPengajuan": 150000000,
  "daftarCPCL": [
    {
      "id": "CPCL-PKB-001-0",
      "namaPekebun": "Ahmad",
      "nik": "3201020304050607",
      "nomorKK": "3201020304050608",
      "luasLahanHektar": 1.5,
      "jenisHakLahan": "SHM",
      "nomorSuratLahan": "SHM-12345",
      "koordinatPoligon": "[[-6.2, 106.8], [-6.21, 106.81], [-6.22, 106.8]]"
    }
  ],
  "dokumen": [
    {
      "id": "DOC-NEW-0-12345",
      "tipeDokumen": "LEGALITAS_KP",
      "namaFile": "legalitas_kp.pdf",
      "urlFile": "data:application/pdf;base64,...",
      "ukuranBytes": 125000,
      "uploadedAt": "2026-08-07",
      "isValid": true
    }
  ],
  "lembaga": {
    "id": "LEM-DRAFT",
    "namaLembaga": "Koperasi Makmur Sejahtera",
    "jenisLembaga": "KOPERASI",
    "nomorAkta": "AKTA-888",
    "nikKetua": "3201010101010101",
    "namaKetua": "Budi Santoso",
    "telepon": "08123456789",
    "alamatLengkap": "Jl. Merdeka No. 1",
    "kabupatenKode": "7322",
    "provinsiKode": "73",
    "namaBank": "Bank BRI",
    "nomorRekening": "1234567890",
    "nomorRekeningPemilik": "Koperasi Makmur Sejahtera"
  }
}
```

* **Response Status**: `201 Created`
* **Response Body**:
```json
{
  "status": "success",
  "message": "Proposal successfully submitted",
  "data": {
    "id": "usl-100",
    "nomorResi": "PROP-20260807-001",
    "createdAt": "2026-08-07T08:55:00Z"
  }
}
```
