# Data Model: Revisi Data dan Dokumen Pekebun pada Proposal Usulan

**Feature**: `069-revisi-data-dokumen-pekebun`
**Date**: 2026-09-03

## 1. Entities & Schema

### A. Master Farmer Profile (`pekebuns`)
```sql
TABLE pekebuns (
    id BIGSERIAL PRIMARY KEY,
    kelembagaan_id VARCHAR(255) NOT NULL,
    nik VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(255),
    nomor_kk VARCHAR(16),
    marriage_status VARCHAR(50),
    place_of_birth VARCHAR(255),
    date_of_birth DATE,
    address TEXT NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_draft BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

### B. Master Farmer Document (`dokumen_pekebuns`)
```sql
TABLE dokumen_pekebuns (
    id BIGSERIAL PRIMARY KEY,
    pekebun_id BIGINT NOT NULL REFERENCES pekebuns(id) ON DELETE CASCADE,
    document_type VARCHAR(255) NOT NULL,
    file_id BIGINT NOT NULL REFERENCES file_uploads(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(pekebun_id, document_type)
);
```

### C. Master Land Plot (`lahans`)
```sql
TABLE lahans (
    id BIGSERIAL PRIMARY KEY,
    pekebun_id BIGINT NOT NULL REFERENCES pekebuns(id) ON DELETE CASCADE,
    jenis_legalitas VARCHAR(20) NOT NULL,
    nomor_legalitas VARCHAR(100) NOT NULL,
    tanggal_penerbitan_legalitas DATE NOT NULL,
    luas_lahan DECIMAL(12,2) NOT NULL,
    kode_provinsi VARCHAR(10) NOT NULL,
    kode_kabupaten VARCHAR(10) NOT NULL,
    kode_kecamatan VARCHAR(10) NOT NULL,
    kode_desa VARCHAR(15) NOT NULL,
    alamat_kebun TEXT NOT NULL,
    tahun_tanam INT NOT NULL,
    jenis_bibit VARCHAR(100) NOT NULL,
    nomor_surat_beda_nama VARCHAR(100),
    coordinates GEOMETRY NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

### D. Master Land Document (`dokumen_lahans`)
```sql
TABLE dokumen_lahans (
    id BIGSERIAL PRIMARY KEY,
    lahan_id BIGINT NOT NULL REFERENCES lahans(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_id BIGINT NOT NULL REFERENCES file_uploads(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(lahan_id, document_type)
);
```

---

## 2. API DTOs (Data Transfer Objects)

### A. Extended Rejection Item (`CategorizedRejectionItemResponse`)
```go
type CategorizedRejectionItemResponse struct {
    Category     string  `json:"category"`                // "PROPOSAL_DOC" | "GUDANG" | "RAB" | "PEKEBUN"
    TargetID     uint    `json:"target_id"`               // Pekebun ID or Document ID
    TargetKey    string  `json:"target_key"`              // Unique key e.g. "farmer-201-field-namaLengkap"
    ItemLabel    string  `json:"item_label"`              // e.g. "Nama Lengkap" / "Scan KK"
    Notes        string  `json:"notes"`                   // Verifikator rejection note
    IsResolved   bool    `json:"is_resolved"`             // Frontend resolution flag
    FarmerID     *uint   `json:"farmer_id,omitempty"`     // Associated Farmer Profile ID
    FarmerName   *string `json:"farmer_name,omitempty"`   // Associated Farmer Name
    FarmerNIK    *string `json:"farmer_nik,omitempty"`    // Associated Farmer NIK
    LahanID      *uint   `json:"lahan_id,omitempty"`      // Associated Land Plot ID (if land item)
    FieldName    *string `json:"field_name,omitempty"`    // Text field rejected (e.g. "nik", "namaLengkap")
    DocumentType *string `json:"document_type,omitempty"` // Document type rejected (e.g. "SCAN_KTP")
    CurrentValue *string `json:"current_value,omitempty"` // Current textual value in DB
}
```

### B. Resubmit Revision Request (`ResubmitProposalRevisionRequest`)
```go
type ResubmitProposalRevisionRequest struct {
    UpdatedDocuments       []UpdatedProposalDocumentItem       `json:"updated_documents"`
    StorageArea            *UpdateProposalStorageAreaRequest   `json:"storage_area"`
    UpdatedFarmers         []UpdateFarmerRevisionItem          `json:"updated_farmers"`
    UpdatedFarmerDocuments []UpdateFarmerDocumentRevisionItem  `json:"updated_farmer_documents"`
    UpdatedLands           []UpdateLandRevisionItem            `json:"updated_lands"`
    UpdatedLandDocuments   []UpdateLandDocumentRevisionItem    `json:"updated_land_documents"`
}

type UpdateFarmerRevisionItem struct {
    ID          uint    `json:"id"`
    Name        *string `json:"name"`
    NIK         *string `json:"nik"`
    NomorKK     *string `json:"nomor_kk"`
    Address     *string `json:"address"`
    PhoneNumber *string `json:"phone_number"`
}

type UpdateFarmerDocumentRevisionItem struct {
    PekebunID    uint   `json:"pekebun_id"`
    DocumentType string `json:"document_type"`
    FileID       uint   `json:"file_id"`
}

type UpdateLandRevisionItem struct {
    ID                 uint     `json:"id"`
    LuasLahan          *float64 `json:"luas_lahan"`
    JenisLegalitas     *string  `json:"jenis_legalitas"`
    NomorLegalitas     *string  `json:"nomor_legalitas"`
    NomorSuratBedaNama *string  `json:"nomor_surat_beda_nama"`
}

type UpdateLandDocumentRevisionItem struct {
    LahanID      uint   `json:"lahan_id"`
    DocumentType string `json:"document_type"`
    FileID       uint   `json:"file_id"`
}
```

---

## 3. Frontend Store State (`proposalRevisionStore.ts`)

```typescript
export interface FarmerRejectionGroup {
  farmerId: number;
  farmerName: string;
  farmerNik: string;
  rejectedFields: {
    fieldName: string;
    label: string;
    notes: string;
    currentValue: string;
  }[];
  rejectedDocuments: {
    documentType: string;
    label: string;
    notes: string;
    fileUrl?: string;
  }[];
  rejectedLands: {
    lahanId: number;
    lahanLabel: string;
    rejectedFields: {
      fieldName: string;
      label: string;
      notes: string;
      currentValue: string | number;
    }[];
    rejectedDocuments: {
      documentType: string;
      label: string;
      notes: string;
      fileUrl?: string;
    }[];
  }[];
}

export interface FarmerRevisionFormState {
  name?: string;
  nik?: string;
  nomor_kk?: string;
  address?: string;
  phone_number?: string;
  files: Record<string, number>; // documentType -> file_id
}

export interface LandRevisionFormState {
  luas_lahan?: number;
  jenis_legalitas?: string;
  nomor_legalitas?: string;
  nomor_surat_beda_nama?: string;
  files: Record<string, number>; // documentType -> file_id
}
```
