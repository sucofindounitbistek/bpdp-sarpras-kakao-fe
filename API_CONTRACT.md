# 📜 API Contract Specification — BPDP Sarpras Kelapa

Spesifikasi Kontrak API (REST API Contract Specification) untuk Sistem **BPDP Sarpras Kelapa** yang menghubungkan Pemohon (Kelembagaan Pekebun), Dinas Kabupaten/Kota, Dinas Provinsi, Ditjenbun Kementan, dan BPDPKS.

---

## 📌 1. General Information & Standards

- **Base URL**: `https://api.bpdp-sarpras.go.id/api/v1`
- **Authentication**: Bearer Token (HTTP Header `Authorization: Bearer <token>`)
- **Data Format**: `JSON` (Kecuali endpoint upload file menggunakan `multipart/form-data`)
- **Standard Date Format**: ISO 8601 (`YYYY-MM-DD` atau `YYYY-MM-DDTHH:mm:ss.sssZ`)

### Standard Response Envelopes

#### 🟢 Success Response Format (HTTP 200 / 201)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Deskripsi pesan sukses",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

#### 🔴 Error Response Format (HTTP 400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Pesan error spesifik",
  "errors": [
    {
      "field": "nik",
      "message": "NIK harus berjumlah 16 digit angka"
    }
  ]
}
```

---

## 🔑 2. Summary Matrix Modul & Endpoints

| Modul | Method | Endpoint | Deskripsi | Roles Allowed |
| :--- | :---: | :--- | :--- | :--- |
| **Wilayah** | `GET` | `/wilayah` | Get list wilayah admin (Prov/Kab/Kec/Desa) | Public / All |
| **Pekebun** | `POST` | `/pekebun/verify-dukcapil` | Verifikasi NIK ke server Dukcapil | PEMOHON, DINAS_KAB |
| **Pekebun** | `GET` | `/pekebun` | Get list master data pekebun | All Roles |
| **Pekebun** | `POST` | `/pekebun` | Tambah master data pekebun + lahan | PEMOHON, DINAS_KAB |
| **Pekebun** | `GET` | `/pekebun/:id` | Detail data pekebun & polygon lahan | All Roles |
| **Pekebun** | `PUT` | `/pekebun/:id` | Perbarui data pekebun & lahan | PEMOHON, DINAS_KAB |
| **Pekebun** | `DELETE`| `/pekebun/:id` | Hapus master data pekebun | PEMOHON, DINAS_KAB |
| **Pengusulan**| `GET` | `/pengusulan/persyaratan/:jenisSarpras` | Config dokumen & minimum rule paket | PEMOHON |
| **Pengusulan**| `POST` | `/pengusulan` | Simpan / buat draft usulan proposal | PEMOHON |
| **Pengusulan**| `POST` | `/pengusulan/:id/submit` | Submit proposal usulan ke Dinas Kab | PEMOHON |
| **Pengusulan**| `GET` | `/pengusulan` | List proposal pengajuan | All Roles |
| **Pengusulan**| `GET` | `/pengusulan/:id` | Detail lengkap proposal usulan | All Roles |
| **Verif Kab** | `POST` | `/farmer-document-validations/bulk` | Bulk create farmer document validations | DINAS_KAB |
| **Verif Kab** | `POST` | `/land-document-validations/bulk` | Bulk create land document validations | DINAS_KAB |
| **Verif Kab** | `POST` | `/proposal-document-validations` | Create or upsert proposal document validation | DINAS_KAB |
| **Verif Kab** | `POST` | `/proposal-document-validations/bulk` | Bulk create or upsert proposal document validations | DINAS_KAB |
| **Verif Kab** | `GET` | `/proposal-document-validations` | List proposal document validations with filters | DINAS_KAB, DINAS_PROV |
| **Verif Kab** | `GET` | `/proposal-document-validations/:id` | Get proposal document validation by ID | DINAS_KAB, DINAS_PROV |
| **Verif Kab** | `PUT` | `/proposal-document-validations/:id` | Update single proposal document validation | DINAS_KAB |
| **Verif Kab** | `PUT` | `/proposal-document-validations/bulk` | Bulk update proposal document validations | DINAS_KAB |
| **Verif Kab** | `DELETE`| `/proposal-document-validations/:id` | Soft delete proposal document validation | DINAS_KAB |
| **Verif Kab** | `GET` | `/proposals/:id/spatial-overlap` | Get spatial polygon overlap boundary datasets | DINAS_KAB |
| **Verif Prov**| `GET` | `/verifikasi-prov` | Queue antrean asistensi Dinas Prov | DINAS_PROV |
| **Verif Prov**| `POST` | `/verifikasi-prov/:id/validate` | Validasi usulan & kirim ke Ditjenbun | DINAS_PROV |
| **Ditjenbun** | `GET` | `/ditjenbun/antrean` | Queue antrean usulan Ditjenbun | DITJENBUN |
| **Ditjenbun** | `POST` | `/ditjenbun/usulan/:id/rekomtek` | Terbitkan Rekomtek Ditjenbun | DITJENBUN |
| **BPDPKS** | `GET` | `/bpdp/antrean` | Queue antrean verifikasi BPDPKS | BPDPKS |
| **BPDPKS** | `POST` | `/bpdp/usulan/:id/sk-dirut` | Terbitkan SK Dirut BPDPKS & TTD PKS | BPDPKS |
| **Tracking** | `GET` | `/tracking/:nomorResi` | Tracking publik status usulan | Public / All |

---

## 🛠️ 3. Detail Specification per Endpoint

### 3.1 Modul Master Data Wilayah

#### `GET /api/v1/wilayah`
Mengambil data hirarki wilayah administrative (Provinsi, Kabupaten, Kecamatan, Desa).

- **Query Parameters**:
  - `parentKode` *(optional, string)*: Kode parent wilayah (contoh: `14` untuk Riau).
  - `level` *(required, string)*: `PROVINSI` | `KABUPATEN` | `KECAMATAN` | `DESA`.

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data wilayah berhasil dimuat",
  "data": [
    {
      "kode": "14.01",
      "nama": "Kab. Kampar",
      "parentKode": "14",
      "level": "KABUPATEN"
    }
  ]
}
```

---

### 3.2 Modul Master Data Pekebun

#### `POST /api/v1/pekebun/verify-dukcapil`
Melakukan pengecekan validitas NIK ke Layanan API Dukcapil.

- **Request Body (`application/json`)**:
```json
{
  "nik": "1401021205850001"
}
```

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "NIK ditemukan pada database Dukcapil",
  "data": {
    "nik": "1401021205850001",
    "nama": "Budi Santoso",
    "nomorKK": "1401021205850002",
    "statusPernikahan": "MENIKAH",
    "tempatLahir": "Kampar",
    "tanggalLahir": "1985-05-12",
    "alamat": "Jl. Merdeka No. 12 Desa Bangkinang",
    "kodepos": "28411"
  }
}
```

#### `GET /api/v1/pekebun`
Mengambil daftar master data pekebun terdaftar dengan pencarian dan filter wilayah.

- **Query Parameters**:
  - `search` *(optional, string)*: Kata kunci nama atau NIK.
  - `provinsiKode` *(optional, string)*: Filter kode provinsi.
  - `kabupatenKode` *(optional, string)*: Filter kode kabupaten.
  - `page` *(optional, number)*: Halaman (default: 1).
  - `limit` *(optional, number)*: Jumlah per halaman (default: 10).

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Daftar pekebun berhasil dimuat",
  "data": [
    {
      "id": "pkb-99823",
      "nik": "1401021205850001",
      "nama": "Budi Santoso",
      "nomorKK": "1401021205850002",
      "statusPernikahan": "MENIKAH",
      "tempatLahir": "Kampar",
      "tanggalLahir": "1985-05-12",
      "alamat": "Jl. Merdeka No. 12 Desa Bangkinang",
      "kodepos": "28411",
      "nomorHP": "081234567890",
      "lahan": {
        "id": "lhn-8812",
        "jenisLegalitas": "SHM",
        "nomorLegalitas": "SHM-123456",
        "luasLahan": 2.5,
        "provinsiNama": "Riau",
        "kabupatenNama": "Kab. Kampar",
        "kecamatanNama": "Bangkinang",
        "desaNama": "Bangkinang",
        "koordinatPoligon": "[[-0.3456,101.0123],[-0.3460,101.0130],[-0.3465,101.0120]]"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

#### `POST /api/v1/pekebun`
Mendaftarkan data pekebun baru beserta data fisik lahan (termasuk koordinat poligon spasial) dan berkas identitas.

- **Request Body (`application/json`)**:
```json
{
  "nik": "1401021205850001",
  "nama": "Budi Santoso",
  "nomorKK": "1401021205850002",
  "statusPernikahan": "MENIKAH",
  "tempatLahir": "Kampar",
  "tanggalLahir": "1985-05-12",
  "alamat": "Jl. Merdeka No. 12 Desa Bangkinang",
  "kodepos": "28411",
  "nomorHP": "081234567890",
  "lahan": {
    "jenisLegalitas": "SHM",
    "nomorLegalitas": "SHM-123456",
    "tanggalPenerbitanLegalitas": "2018-04-10",
    "luasLahan": 2.5,
    "provinsiKode": "14",
    "kabupatenKode": "14.01",
    "kecamatanKode": "14.01.01",
    "desaKode": "14.01.01.2001",
    "alamatKebun": "Blok B3 Desa Bangkinang",
    "tahunTanam": 2016,
    "jenisBibit": "Kelapa Dalam",
    "koordinatPoligon": "[[-0.3456,101.0123],[-0.3460,101.0130],[-0.3465,101.0120]]"
  },
  "dokumen": [
    {
      "tipeDokumen": "SCAN_KTP",
      "namaFile": "ktp_budi.pdf",
      "fileUrl": "https://storage.bpdp.go.id/docs/ktp_budi.pdf",
      "ukuranBytes": 1048576,
      "mimeType": "application/pdf"
    }
  ]
}
```

- **Response 201 Created**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Data pekebun dan lahan berhasil disimpan",
  "data": {
    "id": "pkb-99823",
    "nik": "1401021205850001",
    "nama": "Budi Santoso",
    "createdAt": "2026-08-13T13:30:00Z"
  }
}
```

---

### 3.3 Modul Pengusulan Proposal (Pemohon)

#### `GET /api/v1/pengusulan/persyaratan/:jenisSarpras`
Mengambil konfigurasi dokumen persyaratan dan aturan minimum (luas/pekebun) untuk jenis paket sarpras tertentu.

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Konfigurasi persyaratan paket berhasil dimuat",
  "data": {
    "jenisSarpras": "EKSTENSIFIKASI",
    "minimumRule": {
      "minimalPekebun": 20,
      "minimalLuasHa": 3,
      "jarakAntarKebunKm": null,
      "keterangan": ""
    },
    "persyaratan": [
      {
        "id": "LEGALITAS_KP",
        "nama": "Legalitas Kelompok Tani / Koperasi",
        "wajib": true,
        "formatDownloadUrl": null
      },
      {
        "id": "SIMLUHTAN",
        "nama": "Keterangan Terdaftar Simluhtan",
        "wajib": true,
        "formatDownloadUrl": null
      }
    ]
  }
}
```

#### `POST /api/v1/pengusulan`
Membuat draft usulan proposal baru atau memperbarui draft yang ada.

- **Request Body (`application/json`)**:
```json
{
  "jenisSarpras": "EKSTENSIFIKASI",
  "detailUsulan": "Pengusulan Paket Ekstensifikasi Perkebunan Kelapa 50 Ha",
  "lembaga": {
    "namaLembaga": "Koperasi Tani Makmur",
    "jenisLembaga": "KOPERASI",
    "nomorAkta": "AHU-0012345.AH.01.2020",
    "nikKetua": "1401021205850001",
    "namaKetua": "Budi Santoso",
    "telepon": "081234567890",
    "alamatLengkap": "Jl. Raya Kampar No. 45",
    "provinsiKode": "14",
    "kabupatenKode": "14.01",
    "namaBank": "BRI",
    "nomorRekening": "123401000999501",
    "namaPemilikRekening": "Koperasi Tani Makmur"
  },
  "selectedPekebunIds": ["pkb-99823", "pkb-99824"],
  "selectedLahanIds": ["lhn-8812", "lhn-8813"],
  "gudangSerahTerima": {
    "alamat": "Jl. Gudang Tani No. 8 Bangkinang",
    "koordinat": "-0.3456, 101.0123",
    "fotoTampakDepanUrl": "https://storage.bpdp.go.id/gudang/depan.jpg",
    "fotoTampakDalamUrl": "https://storage.bpdp.go.id/gudang/dalam.jpg"
  }
}
```

- **Response 201 Created**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Draft proposal berhasil disimpan",
  "data": {
    "id": "prop-10293",
    "nomorResi": "PROP/2026/08/0012",
    "currentStatus": "DRAFT",
    "createdAt": "2026-08-13T13:32:00Z"
  }
}
```

#### `POST /api/v1/pengusulan/:id/submit`
Mengirimkan proposal dari Pemohon ke Dinas Kabupaten untuk proses verifikasi administrasi dan lapangan.

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Proposal usulan berhasil dikirimkan ke Dinas Kabupaten/Kota",
  "data": {
    "id": "prop-10293",
    "nomorResi": "PROP/2026/08/0012",
    "currentStatus": "SUBMITTED",
    "submittedAt": "2026-08-13T13:33:00Z"
  }
}
```

---

### 3.4 Modul Verifikasi Dinas Kabupaten/Kota

#### `POST /api/v1/farmer-document-validations/bulk`
Melakukan verifikasi secara bulk (banyak) untuk dokumen/identitas pekebun (CPCL) beserta detail field-level validation (seperti kesesuaian Nama Lengkap, NIK, Nomor KK).

- **Request Body (`application/json`)**:
```json
[
  {
    "dokumen_pekebun_id": 101,
    "pengajuan_id": 12,
    "is_valid": true,
    "notes": "Data KTP sesuai",
    "details": [
      {
        "field_name": "namaLengkap",
        "is_valid": true
      },
      {
        "field_name": "nik",
        "is_valid": true
      }
    ]
  },
  {
    "dokumen_pekebun_id": 102,
    "pengajuan_id": 12,
    "is_valid": false,
    "notes": "Nomor KK buram",
    "details": [
      {
        "field_name": "nomorKK",
        "is_valid": false,
        "notes": "Angka KK digit terakhir terpotong"
      }
    ]
  }
]
```

- **Response 201 Created**:
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "dokumen_pekebun_id": 101,
      "pengajuan_id": 12,
      "is_valid": true,
      "notes": "Data KTP sesuai",
      "validated_at": "2026-08-27T16:00:00Z"
    }
  ],
  "message": "success"
}
```

#### `POST /api/v1/land-document-validations/bulk`
Melakukan verifikasi secara bulk (banyak) untuk dokumen legalitas lahan pekebun.

- **Request Body (`application/json`)**:
```json
[
  {
    "dokumen_lahan_id": 201,
    "pengajuan_id": 12,
    "is_valid": true,
    "notes": ""
  }
]
```

- **Response 201 Created**:
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "dokumen_lahan_id": 201,
      "pengajuan_id": 12,
      "is_valid": true,
      "notes": "",
      "validated_at": "2026-08-27T16:00:00Z"
    }
  ],
  "message": "success"
}
```

#### `GET /api/v1/proposals/:id/spatial-overlap`
Mengambil data koordinat poligon lahan proposal aktif dan proposal lain dalam radius 50 km untuk mendeteksi tumpang tindih (overlap) batas wilayah lahan.

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data spasial overlap berhasil dimuat",
  "data": {
    "active_polygons": [
      {
        "coordinates": [
          [-6.200000, 106.800000],
          [-6.200000, 106.810000],
          [-6.210000, 106.810000],
          [-6.210000, 106.800000]
        ],
        "label": "Sutrisno"
      }
    ],
    "other_proposals": [
      {
        "proposalId": 2,
        "proposalNumber": "PROP/2026/08/0002",
        "proposalName": "Kelompok Tani Subur",
        "polygons": [
          {
            "coordinates": [
              [-6.220000, 106.820000],
              [-6.220000, 106.830000],
              [-6.230000, 106.830000],
              [-6.230000, 106.820000]
            ],
            "label": "Sukirman"
          }
        ]
      }
    ]
  }
}
```

---

### 3.5 Modul Verifikasi Dinas Provinsi

#### `POST /api/v1/verifikasi-prov/:id/validate`
Dinas Provinsi melakukan asistensi dokumen dan memvalidasi usulan untuk diteruskan ke Ditjenbun.

- **Request Body (`application/json`)**:
```json
{
  "nomorSuratPengantar": "525/DISBUN-PROV/2026/102",
  "fileSuratPengantarUrl": "https://storage.bpdp.go.id/prov/pengantar_riau.pdf",
  "catatanAsistensi": "Dokumen telah diasistensi dan dinyatakan lengkap sesuai regulasi."
}
```

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Usulan berhasil divalidasi dan diteruskan ke Ditjenbun",
  "data": {
    "id": "prop-10293",
    "currentStatus": "VALIDATED_PROV"
  }
}
```

---

### 3.6 Modul Rekomtek Ditjenbun Kementan

#### `POST /api/v1/ditjenbun/usulan/:id/rekomtek`
Ditjenbun menerbitkan Surat Rekomendasi Teknis (Rekomtek) resmi.

- **Request Body (`application/json`)**:
```json
{
  "nomorRekomtek": "REKOMTEK/DITJENBUN/2026/0541",
  "signedUrl": "https://storage.bpdp.go.id/rekomtek/signed_rekomtek_541.pdf"
}
```

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Surat Rekomtek Ditjenbun berhasil diterbitkan dan diajukan ke BPDPKS",
  "data": {
    "id": "prop-10293",
    "nomorRekomtek": "REKOMTEK/DITJENBUN/2026/0541",
    "currentStatus": "SK_DITJENBUN_ISSUED"
  }
}
```

---

### 3.7 Modul BPDPKS (SK Dirut & PKS)

#### `POST /api/v1/bpdp/usulan/:id/sk-dirut`
BPDPKS melakukan finalisasi penetapan SK Dirut dan Penandatanganan PKS.

- **Request Body (`application/json`)**:
```json
{
  "nomorSkDirut": "SK-DIRUT/BPDPKS/2026/0889",
  "nomorPks": "PKS/BPDPKS/KT-MAKMUR/2026/044",
  "filePksUrl": "https://storage.bpdp.go.id/pks/pks_signed_kt_makmur.pdf",
  "totalPencairan": 1250000000.00
}
```

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "SK Dirut & PKS BPDPKS berhasil ditetapkan. Siap dilakukan pencairan dana.",
  "data": {
    "id": "prop-10293",
    "nomorSkDirut": "SK-DIRUT/BPDPKS/2026/0889",
    "nomorPks": "PKS/BPDPKS/KT-MAKMUR/2026/044",
    "currentStatus": "PKS_BPDP_SIGNED"
  }
}
```

---

### 3.8 Modul Tracking Status Usulan

#### `GET /api/v1/tracking/:nomorResi`
Pengecekan posisi dan histori status usulan proposal secara publik.

- **Response 200 OK**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Status tracking ditemukan",
  "data": {
    "nomorResi": "PROP/2026/08/0012",
    "namaLembaga": "Koperasi Tani Makmur",
    "jenisSarpras": "EKSTENSIFIKASI",
    "currentStatus": "SK_DITJENBUN_ISSUED",
    "statusLabel": "SK Ditjenbun Diterbitkan",
    "timeline": [
      {
        "status": "SUBMITTED",
        "title": "Pengajuan Usulan",
        "actor": "Budi Santoso (Pemohon)",
        "timestamp": "2026-08-04T14:00:00Z"
      },
      {
        "status": "REKOMTEK_KAB_ISSUED",
        "title": "SK CPCL & Rekomtek Kab/Kota",
        "actor": "Dinas Perkebunan Kab. Kampar",
        "timestamp": "2026-08-06T13:22:00Z"
      },
      {
        "status": "VALIDATED_PROV",
        "title": "Asistensi Dinas Provinsi",
        "actor": "Dinas Perkebunan Prov. Riau",
        "timestamp": "2026-08-08T10:15:00Z"
      },
      {
        "status": "SK_DITJENBUN_ISSUED",
        "title": "Rekomtek Ditjenbun Diterbitkan",
        "actor": "Ditjenbun Kementan",
        "timestamp": "2026-08-11T16:45:00Z"
      }
    ]
  }
}
```

---

### 3.9 Modul Validasi Dokumen Proposal

#### `POST /api/v1/proposal-document-validations`
Membuat atau memperbarui (upsert) hasil validasi untuk satu dokumen proposal.

- **Request Body (`application/json`)**:
```json
{
  "dokumen_proposal_id": 1,
  "is_valid": true,
  "notes": "Dokumen lengkap dan sesuai"
}
```

- **Response 201 Created**:
```json
{
  "data": {
    "id": 1,
    "dokumen_proposal_id": 1,
    "is_valid": true,
    "notes": "Dokumen lengkap dan sesuai",
    "created_by": null,
    "validated_at": "2026-08-28T11:00:00Z",
    "created_at": "2026-08-28T11:00:00Z",
    "updated_at": "2026-08-28T11:00:00Z"
  },
  "message": "success"
}
```

---

#### `POST /api/v1/proposal-document-validations/bulk`
Membuat atau memperbarui (upsert) hasil validasi untuk beberapa dokumen proposal sekaligus secara atomik.

- **Request Body (`application/json`)**:
```json
[
  {
    "dokumen_proposal_id": 1,
    "is_valid": true,
    "notes": "Sesuai"
  },
  {
    "dokumen_proposal_id": 2,
    "is_valid": false,
    "notes": "Tanda tangan tidak lengkap"
  }
]
```

- **Response 201 Created**:
```json
{
  "data": [
    {
      "id": 1,
      "dokumen_proposal_id": 1,
      "is_valid": true,
      "notes": "Sesuai",
      "created_by": null,
      "validated_at": "2026-08-28T11:00:00Z",
      "created_at": "2026-08-28T11:00:00Z",
      "updated_at": "2026-08-28T11:00:00Z"
    },
    {
      "id": 2,
      "dokumen_proposal_id": 2,
      "is_valid": false,
      "notes": "Tanda tangan tidak lengkap",
      "created_by": null,
      "validated_at": "2026-08-28T11:00:00Z",
      "created_at": "2026-08-28T11:00:00Z",
      "updated_at": "2026-08-28T11:00:00Z"
    }
  ],
  "message": "success"
}
```

---

#### `GET /api/v1/proposal-document-validations`
Mengambil daftar hasil validasi dokumen proposal dengan filter dan paginasi.

- **Query Parameters**:
  - `page` *(optional, integer, default: 1)*
  - `limit` *(optional, integer, default: 10)*
  - `proposal_id` *(optional, integer)*: Filter berdasarkan ID proposal.
  - `dokumen_proposal_id` *(optional, integer)*: Filter berdasarkan ID dokumen proposal.
  - `is_valid` *(optional, boolean)*: Filter berdasarkan status validitas.

- **Response 200 OK**:
```json
{
  "data": [
    {
      "id": 1,
      "dokumen_proposal_id": 1,
      "is_valid": true,
      "notes": "Sesuai",
      "created_by": null,
      "validated_at": "2026-08-28T11:00:00Z",
      "created_at": "2026-08-28T11:00:00Z",
      "updated_at": "2026-08-28T11:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

#### `GET /api/v1/proposal-document-validations/:id`
Mengambil detail hasil validasi dokumen proposal berdasarkan ID.

- **Response 200 OK**:
```json
{
  "data": {
    "id": 1,
    "dokumen_proposal_id": 1,
    "is_valid": true,
    "notes": "Sesuai",
    "created_by": null,
    "validated_at": "2026-08-28T11:00:00Z",
    "created_at": "2026-08-28T11:00:00Z",
    "updated_at": "2026-08-28T11:00:00Z"
  },
  "message": "success"
}
```

---

#### `PUT /api/v1/proposal-document-validations/:id`
Memperbarui hasil validasi dokumen proposal tunggal.

- **Request Body (`application/json`)**:
```json
{
  "is_valid": true,
  "notes": "Diperbarui"
}
```

- **Response 200 OK**:
```json
{
  "data": {
    "id": 1,
    "dokumen_proposal_id": 1,
    "is_valid": true,
    "notes": "Diperbarui",
    "created_by": null,
    "validated_at": "2026-08-28T11:00:00Z",
    "created_at": "2026-08-28T11:00:00Z",
    "updated_at": "2026-08-28T11:00:00Z"
  },
  "message": "success"
}
```

---

#### `PUT /api/v1/proposal-document-validations/bulk`
Memperbarui beberapa hasil validasi dokumen proposal secara atomik.

- **Request Body (`application/json`)**:
```json
[
  {
    "id": 1,
    "is_valid": true,
    "notes": "Disetujui setelah perbaikan"
  }
]
```

- **Response 200 OK**:
```json
{
  "data": [
    {
      "id": 1,
      "dokumen_proposal_id": 1,
      "is_valid": true,
      "notes": "Disetujui setelah perbaikan",
      "created_by": null,
      "validated_at": "2026-08-28T11:00:00Z",
      "created_at": "2026-08-28T11:00:00Z",
      "updated_at": "2026-08-28T11:00:00Z"
    }
  ],
  "message": "success"
}
```

---

#### `DELETE /api/v1/proposal-document-validations/:id`
Menghapus hasil validasi dokumen proposal (soft delete).

- **Response 200 OK**:
```json
{
  "data": null,
  "message": "success"
}
```
