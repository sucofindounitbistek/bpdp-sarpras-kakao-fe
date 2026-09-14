# Interface Contract: Fix Proposal Detail Documents Mapping

## Document Mapping Contract in `getProposalDetail()`

```typescript
const mappedDocuments: DokumenPersyaratan[] = (item.documents || []).map((d: any) => ({
  id: String(d.id),
  persyaratanId: d.document_type || '',
  tipeDokumen: d.document_type || '',
  namaFile: d.file_name || '',
  urlFile: d.file_url || '',
  ukuranBytes: parseInt(d.file_size) || 0,
  uploadedAt: d.created_at || '',
  isValid: true,
}));

const mapped: Proposal = {
  ...item,
  id: String(item.id),
  nomor_proposal: item.nomor_proposal || item.nomorProposal || '',
  nomorProposal: item.nomor_proposal || item.nomorProposal || '',
  currentStatus: item.status || item.currentStatus,
  totalAnggaranPengajuan: item.total_anggaran ?? item.totalAnggaranPengajuan ?? 0,
  detailUsulan: item.detail_usulan || item.detailUsulan || '',
  gudangSerahTerima: item.storage_area || item.gudangSerahTerima,
  storage_area: item.storage_area || item.gudangSerahTerima,
  jenisSarpras: (item.paket_sarpras || item.jenisSarpras) as any,
  documents: item.documents || [],
  dokumen: mappedDocuments,
};
```
