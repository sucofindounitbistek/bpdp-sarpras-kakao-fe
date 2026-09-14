# Interface Contract: Authority Sections UI Contract

**Feature**: `076-bpdp-document-authority-sections`
**Date**: 2026-09-08

## 1. Scope & Component Signature

Modul ini mendefinisikan kontrak tampilan UI untuk pengelompokan dokumen berdasarkan instansi penerbit pada alur verifikasi dan persetujuan BPDP.

### Component Signature: `AuthorityDocumentSectionCard.vue`

```typescript
// Props
interface Props {
  tier: AuthoritySectionMeta;
  documents: DocumentValidationItem[];
  mode?: 'inspect' | 'verify' | 'summary';
  readonly?: boolean;
}

// Emits
interface Emits {
  (e: 'preview', doc: DocumentValidationItem): void;
  (e: 'toggleReject', key: string): void;
  (e: 'updateNote', key: string, note: string): void;
  (e: 'updateValid', key: string, valid: boolean | null): void;
}
```

## 2. Slots Specification

- `default`: Slot opsional untuk konten kustom di dalam section.
- `header-action`: Slot untuk menaruh indikator status kustom di sisi kanan header section.
- `doc-action`: Slot untuk menambahkan tombol aksi khusus pada baris dokumen (misal: tombol tolak, pratinjau, unduh).

## 3. Backward Compatibility & Data Safety

- Kontrak payload API backend `submitToBPDPApproval`, `submitForRevision`, dan `getProposalDocumentValidations` tidak mengalami perubahan format.
- Struktur state `bpdpValidations` dipertahankan sehingga computed properties seperti `isKabupatenRejected`, `isProvinsiRejected`, `isDitjenbunVerifRejected`, dan `isBpdpVerifRejected` tetap berjalan 100% sinkron.
