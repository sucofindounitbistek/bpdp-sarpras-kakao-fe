# Phase 1 Data Model: Fix RAB Items Synchronization and Display

## RabItem Interface Alignment

```typescript
export interface RabItem {
  id: string;
  tahap: string;
  uraian: string;
  volume: number | null;
  satuan: string;
  hargaSatuan: number | null;
  subTotal: number;
  jenis?: string;
  jumlahTahap1?: number | null;
  jumlahTahap2?: number | null;
  jumlahTahap3?: number | null;
  jumlahTahap4?: number | null;
  jumlahTotal?: number;
}
```

## Sync State Machine

```text
pengajuan.value.rabItems (from Store)
             │
             ▼
    Vue Watcher in Component
             │
             ▼
verifikasiStore.rabItems (synced)
             │
             ▼
     RabTable Component
```
