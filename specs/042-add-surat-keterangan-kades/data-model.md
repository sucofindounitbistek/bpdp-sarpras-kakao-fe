# Data Model & Interfaces: Surat Keterangan Kades in Proposal

## Types & Interfaces

### `DokumenPersyaratan` (in `src/types/pengusulan.ts`)
Add key:
- `SURAT_KET_KADES` to the union type.

### Mock Proposal Documents (in `src/stores/rekomtek.ts` and `src/stores/pengusulan.ts`)
Add items to proposal `dokumen` lists:

```typescript
{ 
  id: 'prs-kades-{idx}', 
  pengajuanId: 'usl-{idx}', 
  tipeDokumen: 'SURAT_KET_KADES', 
  namaFile: 'surat-keterangan-kades.pdf', 
  urlFile: '/templates/stdb-template.pdf', 
  ukuranBytes: 350000, 
  uploadedAt: '2026-07-28T09:00:00Z', 
  isValid: true 
}
```
