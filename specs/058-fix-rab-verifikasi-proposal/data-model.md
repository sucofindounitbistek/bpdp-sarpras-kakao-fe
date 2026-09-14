# Data Model: RAB Normalization and Sync State

## Entity Definitions

### 1. RabItem (Frontend Normalized Entity)

Defined in `@/types/rab`:

```typescript
export interface RabItem {
  id: string;
  tahap: string;            // e.g., 'Tahap 1 & 2', 'Semua Tahap'
  uraian: string;           // Barang/material description
  volume: number;           // Total volume quantity
  satuan: string;           // Unit (e.g., 'Kg', 'Batang', 'Paket')
  hargaSatuan: number;      // Price per unit (IDR)
  subTotal: number;         // Total item cost (IDR)
  jenis?: string;           // Category/Type of RAB item
  jumlahTahap1?: number | null;
  jumlahTahap2?: number | null;
  jumlahTahap3?: number | null;
  jumlahTahap4?: number | null;
  jumlahTotal?: number;
  unit?: string;            // Alias for satuan
  price_per_unit?: number;  // Alias for hargaSatuan
  total_price?: number;     // Alias for subTotal
}
```

### 2. Backend DTO Variants Normalized in `getProposalDetail()`

| Backend Field | DTO Key Alternatives | Target Normalized `RabItem` Property |
|---|---|---|
| ID | `id` | `id: String(id)` |
| Item Name / Description | `uraian`, `item_name`, `name`, `nama_barang` | `uraian` |
| Category | `jenis`, `item_type`, `category`, `details.jenis` | `jenis` |
| Volume / Total | `volume`, `jumlah_total`, `jumlahTotal` | `volume`, `jumlahTotal` |
| Unit | `satuan`, `unit` | `satuan`, `unit` |
| Unit Price | `hargaSatuan`, `harga_satuan`, `price_per_unit` | `hargaSatuan`, `price_per_unit` |
| Subtotal | `subTotal`, `sub_total`, `total_price` | `subTotal`, `total_price` |
| Stage Amounts | `jumlahTahap1..4`, `jumlah_tahap_1..4`, `details.jumlahTahap1..4` | `jumlahTahap1..4` |

### 3. Store State Mapping

- **`pengusulanStore.activePengajuan.rabItems`**: Array of normalized `RabItem`.
- **`verifikasiKabDraftStore.rabItems`**: Reactive copy used by Kabupaten verifier in `StepVerifikasiPekebunDanDokumenProposal.vue` and `RabTable.vue`.
