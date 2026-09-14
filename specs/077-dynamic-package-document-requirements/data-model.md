# Data Model & Interfaces: Dokumen Persyaratan Dinamis Master Paket

**Feature**: `077-dynamic-package-document-requirements`

## 1. Unified Proposal Document Item Interface

```ts
export interface UnifiedProposalDocItem {
  id: string;                    // e.g. "SIMLUHTAN", "GAMBAR_LAHAN", or doc ID
  code: string;                  // e.g. "SIMLUHTAN"
  nama: string;                  // Display title
  isWajib: boolean;              // Mandatory requirement
  isFromMaster: boolean;         // True if present in active package master, false if legacy/extra attached doc
  downloadFormatUrl?: string;    // Template download URL if available
  
  // Upload status & file detail
  isUploaded: boolean;
  uploadedDocId?: number;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;

  // Validation status
  isValid?: boolean | null;
  validationNote?: string;
}
```

## 2. Dynamic Requirement Mapping Logic

```ts
export function matchDocumentCode(docCode: string, targetType: string): boolean {
  const norm1 = docCode.toUpperCase().replace(/[-_]/g, '');
  const norm2 = targetType.toUpperCase().replace(/[-_]/g, '');
  return norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1);
}
```
