# API & Interface Contract: Auto-Rename File Upload

**Feature**: `078-auto-rename-upload-file`  
**Date**: 2026-09-09  
**Status**: Complete  

## 1. Utility Contract (`src/utils/fileNaming.ts`)

### 1.1 `formatStandardFileName`

```typescript
/**
 * Menstandarisasi nama berkas menjadi:
 * [Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[ext]
 *
 * @param file Objek File asli dari input berkas
 * @param context Konteks penamaan (label dokumen, nomor proposal, nama lembaga, dsb.)
 * @returns StandardizedFileResult berisi objek File baru yang telah di-rename dan rincian namanya
 */
export function formatStandardFileName(
  file: File,
  context: Omit<FileNamingContext, 'originalFileName'>
): StandardizedFileResult;
```

### 1.2 `sanitizeToken`

```typescript
/**
 * Membersihkan string token dari karakter berbahaya, spasi, dan memotong panjang string secara aman.
 *
 * @param token Teks yang akan disanitasi
 * @param maxLength Panjang maksimal yang diperbolehkan (default 60 karakter)
 * @returns Teks bersih dengan pemisah tanda hubung (-)
 */
export function sanitizeToken(token: string, maxLength?: number): string;
```

---

## 2. Component Contract: `FileUpload.vue`

Tambahan props pada `src/components/ui/FileUpload.vue`:

```typescript
interface Props {
  id?: string;
  label?: string;
  placeholder?: string;
  accept?: string;
  required?: boolean;
  hint?: string;
  initialFileName?: string;

  // --- Props Tambahan untuk Standarisasi Penamaan ---
  /**
   * Label dokumen standar (misal: "Proposal Usulan", "RAB", "KTP", "SK CPCL")
   */
  documentLabel?: string;

  /**
   * Sub-label opsional (misal: "Depan", "Dalam", "Bidang 1")
   */
  subLabel?: string;

  /**
   * Nomor proposal (misal: "SPKA109260001"). Fallback otomatis ke "DRAFT" jika kosong.
   */
  proposalNumber?: string | null;

  /**
   * Nama kelembagaan pekebun (misal: "Koperasi Tani Makmur").
   */
  institutionName?: string | null;

  /**
   * Mengaktifkan auto-rename berkas secara otomatis (default: true)
   */
  autoRename?: boolean;
}
```

Event Emits:
```typescript
const emit = defineEmits<{
  (e: 'file-selected', file: File): void;
}>();
```
*Catatan: Objek `file` yang dipancarkan (`emitted`) sudah merupakan instance `File` yang memiliki `file.name` standar.*

---

## 3. Backend HTTP Contract Verification (`POST /files/upload`)

Berdasarkan inspeksi langsung pada `bpdp-sarpras-kelapa-be/internal/file/service.go` dan `bpdp-sarpras-kelapa-be/internal/model/file.go`:

### Request
- **Endpoint**: `POST /api/v1/files/upload` (atau melalui `/files/upload`)
- **Headers**:
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <jwt_token>`
- **Body**:
  - `file`: binary file part dengan header:
    ```http
    Content-Disposition: form-data; name="file"; filename="Proposal-Usulan_SPKA109260001_Koperasi-Tani-Makmur.pdf"
    Content-Type: application/pdf
    ```
  - `folder`: string (misal `"sarpras-kelapa/proposal"`)

### Response (Status 200 OK / 201 Created)
```json
{
  "data": {
    "id": 105,
    "filename": "sarpras-kelapa/proposal/abc123xyz_Proposal-Usulan_SPKA109260001_Koperasi-Tani-Makmur.pdf",
    "original_name": "Proposal-Usulan_SPKA109260001_Koperasi-Tani-Makmur.pdf",
    "url": "https://storage.idsurvey.id/sarpras-kelapa/...",
    "filesize": "1048576",
    "extension": "pdf",
    "content_type": "application/pdf"
  },
  "message": "success"
}
```
*Konfirmasi: Backend secara bawaan memelihara `original_name` dari nama berkas multipart client. Tidak diperlukan modifikasi skema database backend.*
