# Interface & Component Contract: Export Data Proposal Dinas Kabupaten Sesuai Wilayah Terkait

**Feature**: [`085-export-proposal-wilayah-kabupaten`](spec.md) | **Date**: 2026-09-14

---

## 1. Vue Component Invocation Contract

### Caller: `QueueVerifikasiKabView.vue`
```vue
<ExportProposalModal
  :is-open="showExportModal"
  page-title="Antrean Verifikasi Dinas Kabupaten"
  :default-statuses="KAB_MY_TASK_STATUSES"
  :available-statuses="filterStatusOptions"
  :search-query="search"
  :scope-region-name="activeRegencyName"
  :scope-regency-id="authStore.user?.regency_id"
  @close="showExportModal = false"
/>
```

### Contract Properties:
| Property | Type | Default | Deskripsi |
|---|---|---|---|
| `is-open` | `boolean` | `false` | Status buka/tutup modal ekspor |
| `page-title` | `string` | `'Daftar Proposal'` | Judul dokumen & acuan nama file |
| `default-statuses` | `string[]` | `[]` | Status usulan default tugas dinas kab (`['SUBMITTED', 'REV_FROM_PROV']`) |
| `available-statuses` | `StatusOption[]` | `[]` | Opsi dropdown filter status |
| `search-query` | `string` | `''` | Teks pencarian yang sedang aktif di antrean |
| `scope-region-name` | `string` | `undefined` | Nama kabupaten dinas aktif (misal: `"Kabupaten Luwu Utara"`) |
| `scope-regency-id` | `number \| string` | `undefined` | ID numerik kabupaten dari sesi dinas |

---

## 2. API Query Payload Contract

### Endpoint: `GET /api/v1/proposals/export`
Query parameters yang dikirim saat meminta dataset:
```typescript
{
  format: 'json',
  search?: string,
  status?: string | string[],
  start_date?: string,
  end_date?: string,
  paket_sarpras?: string,
  regency_id?: number | string,
  kabupaten?: string
}
```

---

## 3. Berkas Output Contract

### CSV Output (RFC-4180 dengan UTF-8 BOM)
- **Nama Berkas**: `export-antrean-verifikasi-dinas-kabupaten-[YYYY-MM-DD].csv`
- **Header Kolom**:
  ```text
  No.,Nomor Proposal,Nama Lembaga / Pemohon,Paket Sarpras,Total Anggaran,Status,No. Rekomtek,Tanggal Terbit Rekomtek,Tahun Terbit Rekomtek,Tanggal Pengajuan
  ```
- **Kondisi Integritas**: 100% baris proposal pada berkas harus memenuhi kriteria `matchesProposalRegion(row, scopeRegencyId, scopeRegionName)`.

### PDF Output (Printable A4 Landscape)
- **Header Laporan**:
  - Judul: `Antrean Verifikasi Dinas Kabupaten`
  - Subjudul Filter: Tanggal Mulai, Tanggal Selesai, Status Usulan, Paket Sarpras, dan **Cakupan Wilayah** (tercantum nama kabupaten aktif).
- **Tabel Data**: Seluruh baris terfilter khusus wilayah tugas dinas kabupaten terkait.
