# Contract Specification: RAB Synchronization

## Component & Store Synchronization Contract

### Reactive Watcher Contract in `StepVerifikasiPekebunDanDokumenProposal.vue`

```typescript
// Watch active proposal rabItems and mirror to verifikasiKabDraftStore
watch(
  () => pengajuan.value?.rabItems,
  (items) => {
    if (items && Array.isArray(items) && items.length > 0) {
      verifikasiStore.rabItems = items.map((r) => ({ ...r }));
    }
  },
  { immediate: true, deep: true },
);
```

### Store Mapping Contract in `src/stores/pengusulan.ts`

`getProposalDetail(id)` MUST map all raw RAB item payloads into normalized `RabItem` format:

```typescript
const rawRabs = item.rabs || item.rab_items || item.rabItems || item.rab_proposals || item.rab || [];
return rawRabs.flatMap((r: any) => {
  const items = r.items || (Array.isArray(r) ? r : [r]);
  return items.map((it: any) => ({
    id: String(it.id),
    tahap: r.flag || it.tahap || 'Semua Tahap',
    uraian: it.uraian || it.item_name || it.nama_barang || '',
    volume: Number(it.volume || it.jumlah_total || it.jumlahTotal || 0),
    satuan: it.unit || it.satuan || '',
    hargaSatuan: Number(it.price_per_unit || it.harga_satuan || it.hargaSatuan || 0),
    subTotal: Number(it.total_price || it.sub_total || it.subTotal || 0),
    jenis: it.details?.jenis || it.item_type || it.jenis || '',
    jumlahTahap1: it.details?.jumlahTahap1 ?? it.jumlah_tahap_1 ?? it.jumlahTahap1 ?? null,
    jumlahTahap2: it.details?.jumlahTahap2 ?? it.jumlah_tahap_2 ?? it.jumlahTahap2 ?? null,
    jumlahTahap3: it.details?.jumlahTahap3 ?? it.jumlah_tahap_3 ?? it.jumlahTahap3 ?? null,
    jumlahTahap4: it.details?.jumlahTahap4 ?? it.jumlah_tahap_4 ?? it.jumlahTahap4 ?? null,
    jumlahTotal: Number(it.volume || it.jumlah_total || it.jumlahTotal || 0),
  }));
});
```
