# UI Contract: Pengusulan Baru Revamp

**Feature**: `006-pengusulan-baru-revamp`
**Type**: Client-Simulated (No confirmed backend endpoint — per Constitution XIII)
**Date**: 2026-07-31

---

## Status

> **CLIENT-SIMULATED**: No backend API endpoints have been confirmed for this feature as of 2026-07-31.
> The frontend MUST implement this as a client-simulated flow using Pinia store mock data.
> This contract documents what the real backend integration would require once endpoints are available.

---

## Simulated Operations

### 1. Submit Proposal

**Simulated by**: `usePengusulanStore().createPengajuan(payload)` (existing store action)

**Real endpoint (future)**: `POST /api/v1/pengusulan`

**Request Body (expected shape)**:
```json
{
  "jenisSarpras": "EKSTENSIFIKASI",
  "dokumenIds": ["doc-uuid-1", "doc-uuid-2"],
  "gudangSerahTerima": {
    "alamat": "Jl. Raya Perkebunan No. 1",
    "koordinat": "-2.5831, 120.3121",
    "fotoDepanId": "foto-uuid-1",
    "fotoDalamId": "foto-uuid-2"
  },
  "rabItems": [
    {
      "tahap": "I",
      "uraian": "Pengadaan Benih Kakao",
      "volume": 100,
      "satuan": "batang",
      "hargaSatuan": 15000,
      "subTotal": 1500000
    }
  ],
  "rabDitandatanganiId": "rab-signed-uuid",
  "daftarPekebunId": ["pekebun-uuid-1"],
  "daftarLahanId": ["lahan-uuid-1"]
}
```

**Simulated Response**:
```json
{
  "nomorResi": "BPDP-KAKAO-202607-002",
  "status": "SUBMITTED",
  "createdAt": "2026-07-31T09:00:00Z"
}
```

---

### 2. Upload Dokumen Persyaratan

**Simulated by**: In-memory `dataUrl` stored in `PengusulanDraftStore.dokumenUploads[]`

**Real endpoint (future)**: `POST /api/v1/dokumen/upload`

**Request**: `multipart/form-data` — field `file`, metadata `persyaratanId`, `pengajuanId`

**Real Response**:
```json
{
  "id": "doc-uuid",
  "namaFile": "proposal.pdf",
  "urlFile": "https://storage.bpdp.go.id/sarpras/doc-uuid.pdf",
  "ukuranBytes": 2048000
}
```

---

### 3. Download RAB Template

**Simulated by**: `window.URL.createObjectURL` with a Blob generated from RAB table data (CSV format)

**Real endpoint (future)**: `GET /api/v1/pengusulan/rab-template?paket=EKSTENSIFIKASI`

**Real Response**: Binary PDF stream with `Content-Disposition: attachment; filename="RAB-Template.pdf"`

---

### 4. Fetch Persyaratan per Paket

**Simulated by**: Static config object `PAKET_PERSYARATAN_CONFIG` in `src/lib/pengusulan-persyaratan.config.ts`

**Real endpoint (future)**: `GET /api/v1/pengusulan/persyaratan/:jenisSarpras`

**Real Response**:
```json
{
  "jenisSarpras": "EKSTENSIFIKASI",
  "persyaratan": [
    {
      "id": "PROPOSAL",
      "nama": "Proposal Usulan",
      "wajib": true,
      "formatDownloadUrl": "https://storage.bpdp.go.id/templates/proposal.docx"
    }
  ]
}
```

---

## Component Contracts (Vue SFC interfaces)

### StepPaketSarpras.vue

**Emits**: None (writes directly to `usePengusulanDraftStore`)

**Props**:
```typescript
// No external props — reads/writes store directly
```

**Validation gate output**: `isStep1Valid` getter on store

---

### StepRAB.vue

**Emits**: None (writes directly to store)

**Internal computed**:
- `totalRAB = sum(rabItems.map(r => r.subTotal))`
- `subTotal(row) = (row.volume ?? 0) * (row.hargaSatuan ?? 0)`

---

### StepPilihPekebunLahan.vue

**Props**:
```typescript
// No external props
```

**Reads from**: `usePekebunStore().listPekebun` for available pekebun list

**Reads from**: Selected pekebun entry's `daftarLahan` for lahan list

---

### ProposalPreviewModal.vue

**Props**:
```typescript
{
  open: boolean;
  onClose: () => void;
}
```

**Reads from**: `usePengusulanDraftStore` for all proposal data

**Document viewer**: `<iframe>` for PDF `dataUrl`, `<img>` for image `dataUrl`

---

### RabTable.vue

**Props**:
```typescript
{
  items: RabItem[];
  readonly?: boolean;
}
```

**Emits**:
```typescript
{
  'add': () => void;
  'update': (id: string, patch: Partial<RabItem>) => void;
  'remove': (id: string) => void;
}
```
