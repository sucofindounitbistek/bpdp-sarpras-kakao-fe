# Data Model: Standarisasi Auto-Rename Upload File

**Feature**: `078-auto-rename-upload-file`  
**Date**: 2026-09-09  
**Status**: Complete  

## 1. Entities & Types

### 1.1 `FileNamingContext` (TypeScript Interface)

Struktur konteks yang dibutuhkan untuk merumuskan nama berkas standar:

```typescript
export interface FileNamingContext {
  /**
   * Label atau kategori dokumen standar (misal: "Proposal Usulan", "RAB", "KTP", "SK CPCL")
   */
  documentLabel: string;

  /**
   * Sub-label opsional untuk kategori yang memiliki banyak berkas (misal: "Depan", "Dalam", "Bidang 1")
   */
  subLabel?: string;

  /**
   * Nomor proposal usulan (misal: "SPKA109260001").
   * Jika tidak ada atau masih dalam tahap draf sebelum submit, otomatis bernilai "DRAFT".
   */
  proposalNumber?: string | null;

  /**
   * Nama lembaga pekebun pemohon (misal: "Koperasi Tani Makmur").
   * Jika tidak tersedia (misal di luar konteks kelembagaan), menggunakan fallback nama pengguna/peran.
   */
  institutionName?: string | null;

  /**
   * Nama asli berkas dari perangkat klien untuk mengekstrak ekstensi berkas.
   */
  originalFileName: string;
}
```

### 1.2 `StandardizedFileResult`

Hasil dari pemrosesan standarisasi berkas:

```typescript
export interface StandardizedFileResult {
  /**
   * Objek File baru yang sudah memiliki nama standar
   */
  file: File;

  /**
   * Nama lengkap berkas standar termasuk ekstensi (misal: "Proposal-Usulan_SPKA109260001_Koperasi-Tani-Makmur.pdf")
   */
  fileName: string;

  /**
   * Ekstensi berkas dalam huruf kecil (misal: "pdf", "jpg", "png")
   */
  extension: string;
}
```

---

## 2. Token Normalization Rules

| Token | Input Asli | Aturan Normalisasi | Hasil Standar |
|---|---|---|---|
| `[Nama File]` | `"Proposal Usulan"` | Trim, hilangkan simbol non-alfanumerik, ganti spasi dengan `-` | `"Proposal-Usulan"` |
| `[Nama File + Sub-Label]` | `"Foto Gudang"`, subLabel: `"Depan"` | Gabungkan label dan subLabel dengan tanda `-` | `"Foto-Gudang-Depan"` |
| `[No Proposal]` (Aktif) | `"SPKA109260001"` | Trim, huruf besar, hilangkan karakter ilegal | `"SPKA109260001"` |
| `[No Proposal]` (Draf) | `""` / `null` / `undefined` | Fallback tetap | `"DRAFT"` |
| `[Nama Kelembagaan]` | `"Koperasi \"Tani Makmur\" Jaya"` | Hilangkan tanda kutip/simbol, ganti spasi dengan `-`, max 60 char | `"Koperasi-Tani-Makmur-Jaya"` |
| `[Extension]` | `"MyDocument.PDF"` | Ekstrak setelah titik terakhir, jadikan huruf kecil | `".pdf"` |

---

## 3. Data Flow & Lifecycle

```
User selects file (e.g. "scan123.pdf")
        │
        ▼
FileUpload.vue / File Handler (event: change)
        │
        ▼
Call formatStandardFileName(originalFile, { documentLabel, proposalNumber, institutionName, subLabel })
        │
        ▼
Construct standardized filename:
"[Nama-File]_[No-Proposal]_[Nama-Kelembagaan].[ext]"
        │
        ▼
Instantiate new File:
new File([originalFile], standardizedName, { type: originalFile.type, lastModified: originalFile.lastModified })
        │
        ├── Update UI Preview: display standardizedName (<100ms)
        └── Emit 'file-selected' with renamed File
        │
        ▼
Payload Assembly:
formData.append('file', renamedFile)
        │
        ▼
HTTP POST to Backend (/files/upload or proposal endpoint)
        │
        ▼
Backend processes multipart header Content-Disposition (filename = standardizedName)
        │
        ▼
Saved into Database: file_uploads (filename & original_name = standardizedName)
```
