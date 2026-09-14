# Data Model: Master Data Pekebun

**Branch**: `004-master-data-pekebun` | **Date**: 2026-07-30

## Entities

### 1. Pekebun (Core Entity)

Represents an individual cocoa farmer registered in the Master Data system.

| Field | Type | Required | Constraints | Source |
|-------|------|----------|-------------|--------|
| `id` | `string` | Yes | Auto-generated (e.g., `PKB-001`) | System |
| `nik` | `string` | Yes | Exactly 16 digits, unique across all Pekebun records | User input |
| `nama` | `string` | Yes | Min 2 chars | Dukcapil lookup |
| `nomorKK` | `string` | Yes | Exactly 16 digits | Dukcapil lookup |
| `statusPernikahan` | `'BELUM_MENIKAH' \| 'MENIKAH' \| 'CERAI_HIDUP' \| 'CERAI_MATI'` | Yes | Enum | Dukcapil lookup |
| `tempatLahir` | `string` | Yes | — | Dukcapil lookup |
| `tanggalLahir` | `string` | Yes | ISO date format (YYYY-MM-DD) | Dukcapil lookup |
| `alamat` | `string` | Yes | Min 10 chars | User input |
| `kodepos` | `string` | Yes | 5 digits | User input |
| `nomorHP` | `string` | Yes | Min 10 digits, Indonesian phone format | User input |
| `createdAt` | `string` | Yes | ISO datetime | System |

**Identity & Uniqueness**: `nik` is the natural key. No two Pekebun records may share the same NIK.

---

### 2. DokumenPekebun (Upload Documents)

Represents identity documents uploaded during Pekebun registration (Step 2).

| Field | Type | Required | Constraints | Source |
|-------|------|----------|-------------|--------|
| `id` | `string` | Yes | Auto-generated | System |
| `pekebunId` | `string` | Yes | References Pekebun.id | System |
| `tipeDokumen` | `'SCAN_KTP' \| 'SCAN_KK' \| 'SWAFOTO' \| 'SURAT_KUASA'` | Yes | Enum (4 types) | User selection |
| `namaFile` | `string` | Yes | Original filename | User upload |
| `fileUrl` | `string` | Yes | Object URL (mockup) or server URL (production) | System |
| `ukuranBytes` | `number` | Yes | Max 5MB for images, 10MB for PDF | Computed |
| `mimeType` | `string` | Yes | `image/jpeg`, `image/png` for images; `application/pdf` for Surat Kuasa | Validated |

**Validation Rules**:
- SCAN_KTP, SCAN_KK, SWAFOTO: Accept `image/jpeg`, `image/png`. Max 5MB.
- SURAT_KUASA: Accept `application/pdf`. Max 10MB.
- All 4 documents are mandatory before proceeding to Step 3.

---

### 3. LahanPekebun (Land Data)

Represents the single cocoa land parcel linked to a Pekebun (Step 3). One-to-one relationship with Pekebun at registration time.

| Field | Type | Required | Constraints | Source |
|-------|------|----------|-------------|--------|
| `id` | `string` | Yes | Auto-generated | System |
| `pekebunId` | `string` | Yes | References Pekebun.id | System |
| `jenisLegalitas` | `'SHM' \| 'NON_SHM'` | Yes | Enum | User selection |
| `nomorLegalitas` | `string` | Yes | Min 3 chars | User input |
| `tanggalPenerbitanLegalitas` | `string` | Yes | ISO date format | User input |
| `luasLahan` | `number` | Yes | Positive number (in hectares) | User input |
| `provinsiKode` | `string` | Yes | Code from wilayah data | User selection |
| `provinsiNama` | `string` | Yes | Display name | Derived |
| `kabupatenKode` | `string` | Yes | Code from wilayah data | User selection |
| `kabupatenNama` | `string` | Yes | Display name | Derived |
| `kecamatanKode` | `string` | Yes | Code from wilayah data | User selection |
| `kecamatanNama` | `string` | Yes | Display name | Derived |
| `desaKode` | `string` | Yes | Code from wilayah data | User selection |
| `desaNama` | `string` | Yes | Display name | Derived |
| `alamatKebun` | `string` | Yes | Min 5 chars | User input |
| `tahunTanam` | `number` | Yes | 4-digit year, >= 1950, <= current year | User input |
| `jenisBibit` | `string` | Yes | Min 2 chars | User input |
| `scanLegalitasUrl` | `string` | Yes | Object URL (mockup) or server URL (production) | User upload |

**Validation Rules**:
- If `jenisLegalitas` is `NON_SHM`, system provides download link for Sporadik format (.docx).
- Cascading wilayah: kabupaten filtered by selected provinsi, kecamatan by kabupaten, desa by kecamatan.

---

### 4. WilayahData (Reference Data — Mockup)

Static reference data for cascading dropdown. Not a persisted entity — loaded as constant.

| Field | Type | Description |
|-------|------|-------------|
| `kode` | `string` | Unique region code |
| `nama` | `string` | Region display name |
| `parentKode` | `string \| null` | Parent region code (null for Provinsi) |
| `level` | `'PROVINSI' \| 'KABUPATEN' \| 'KECAMATAN' \| 'DESA'` | Hierarchy level |

---

## Entity Relationships

```
Pekebun (1) ──── (1) LahanPekebun
    │
    └──── (4) DokumenPekebun
              [SCAN_KTP, SCAN_KK, SWAFOTO, SURAT_KUASA]
```

- **Pekebun → LahanPekebun**: One-to-one at registration. Each Pekebun has exactly one Lahan.
- **Pekebun → DokumenPekebun**: One-to-four. Each Pekebun has exactly 4 mandatory documents.

## State / Lifecycle

Pekebun records in this mockup have no explicit status lifecycle (no approval workflow). Once submitted through the 3-step form, the record is simply added to the Master Data list.

Future consideration: A status field (`DRAFT`, `ACTIVE`, `SUSPENDED`) could be added when backend integration is implemented.
