# Research: Revamp Pengusulan Baru — Multi-Step Wizard

**Feature**: `006-pengusulan-baru-revamp`
**Phase**: 0 — Outline & Research
**Date**: 2026-07-31

---

## Existing Codebase Findings

### Current Wizard Architecture (`FormPengusulanView.vue`)

- **5-step structure** (Profil Lembaga → Data CPCL → Paket Sarpras → Upload Dokumen → Review & Kirim)
- Steps are rendered via `v-if/v-else-if` on `currentStep` ref
- Step data is held in local `ref` variables within `FormPengusulanView.vue` (not in Pinia store)
- Navigation via `handleNext()` / `handlePrev()` with no per-step validation gate
- Submit calls `pengusulanStore.createPengajuan(payload)` and routes to `/pengusulan/tracking`

### Current StepPaketSarpras.vue

- Only 4 paket options (mapped from `JenisSarpras` enum: `BENIH_PUPUK`, `ALSINTAN`, `JALAN_PERKEBUNAN`, `UPH_KAKAO`)
- No per-paket persyaratan display, no document upload, no Gudang Serah Terima section
- Has a free-text `detailUsulan` field and a numeric `totalAnggaranPengajuan` field

### JenisSarpras Enum (current)

```typescript
export enum JenisSarpras {
  BENIH_PUPUK = 'BENIH_PUPUK',       // → maps to Ekstensifikasi
  ALSINTAN = 'ALSINTAN',              // → maps to Mesin Pertanian
  JALAN_PERKEBUNAN = 'JALAN_PERKEBUNAN',
  DRAINASE = 'DRAINASE',
  UPH_KAKAO = 'UPH_KAKAO'
}
```

**Decision**: Extend `JenisSarpras` to cover all 9 new options (add missing values; keep backward compatibility for existing mock data that references `BENIH_PUPUK`).

### Pekebun Store

- `usePekebunStore` in `src/stores/pekebun.ts` contains mock pekebun list with NIK, nama, lahan data
- Pekebun entries include `daftarLahan` arrays — ready to be consumed by Step 3 lahan selection
- No dedicated composable; accessed directly via `usePekebunStore()` inside components (consistent with constitution III)

### Existing UI Components Available for Reuse

| Component | Path | Usage in new feature |
|-----------|------|---------------------|
| `Card.vue` | `src/components/ui/Card.vue` | Step content containers |
| `Button.vue` | `src/components/ui/Button.vue` | Navigation, download, submit |
| `FileUpload.vue` | `src/components/ui/FileUpload.vue` | Document + photo uploads |
| `Modal.vue` | `src/components/ui/Modal.vue` | Document preview + proposal preview |
| `Input.vue` | `src/components/ui/Input.vue` | RAB text/number fields |
| `Badge.vue` | `src/components/ui/Badge.vue` | Status indicators |
| `Skeleton.vue` | `src/components/ui/Skeleton.vue` | Loading states |
| `StepIndicator.vue` | `src/components/ui/StepIndicator.vue` | Already exists for step progress |

### Router

- Route `/pengusulan/baru` → `FormPengusulanView.vue` — **no route change needed**
- Route `/pengusulan/tracking` → `TrackingPengusulanView.vue` — redirect target after submit

---

## Design Decisions

### 1. Step Count: 3 vs 5

- **Decision**: Collapse to 3 steps as specified
- **Rationale**: New flow removes Profil Lembaga and Data CPCL from the wizard (those are handled by existing Master Data / CPCL modules). The new wizard focuses on: Paket + Dokumen → RAB → Pekebun/Lahan + Submit
- **Alternative rejected**: Keeping 5 steps would add scope; Master Data Pekebun module already covers Profil + CPCL registration

### 2. Draft State: Local refs vs Pinia store

- **Decision**: Dedicated Pinia store `usePengusulanDraftStore` (in `src/stores/pengusulanDraft.ts`) with `persist: false` (session draft only)
- **Rationale**: Constitution III requires all persistent domain state in Pinia; cross-step data preservation requires shared state. `persist: false` keeps drafts ephemeral (cleared on page reload)
- **Alternative rejected**: Local `ref` in parent — loses data if component is unmounted; session storage manual management violates constitution III

### 3. JenisSarpras: New Enum Values

- **Decision**: Add 7 new values to `JenisSarpras` enum to cover all 9 official paket names:
  1. `EKSTENSIFIKASI` — Ekstensifikasi (Benih, Pupuk, Pestisida)
  2. `INTENSIFIKASI` — Intensifikasi (Pupuk dan Pestisida)
  3. `ALAT_PASCAPANEN` — Alat pascapanen
  4. `UPH` — Unit Pengolahan Hasil
  5. `JALAN_KEBUN` — Jalan kebun dan jalan akses ke jalan umum dan/atau ke pelabuhan
  6. `ALAT_TRANSPORTASI` — Alat transportasi
  7. `MESIN_PERTANIAN` — Mesin pertanian
  8. `INFRASTRUKTUR_PASAR` — Infrastruktur pasar
  9. `VERIFIKASI_TEKNIS` — Verifikasi atau penelusuran teknis
- Old values (`BENIH_PUPUK`, `ALSINTAN`, `JALAN_PERKEBUNAN`, `DRAINASE`, `UPH_KAKAO`) kept for backward compat with existing mock data

### 4. Per-Paket Persyaratan: Static Config vs API

- **Decision**: Static configuration object in `StepPaketSarpras.vue` (or a dedicated `persyaratan.config.ts`)
- **Rationale**: No confirmed backend endpoint for fetching persyaratan per paket (per constitution XIII); static config reflects real-world known requirements; easily swappable once backend exposes endpoint
- **Alternatives considered**: Fetch from backend (no endpoint confirmed), hardcode in template (harder to maintain)

### 5. Document Preview: iframe vs PDF.js vs native embed

- **Decision**: Use `<iframe src="...">` inside existing `Modal.vue` for PDF preview; `<img>` for image files
- **Rationale**: Zero new dependencies (YAGNI, constitution V); works for PDF and image files; sufficient for mock/simulation data
- **Alternative rejected**: PDF.js — heavy dependency not currently in project

### 6. RAB Download: Client-side generation vs backend PDF

- **Decision**: Client-simulated download — generate CSV or trigger a mock download with `window.URL.createObjectURL` using a Blob constructed from RAB table data
- **Rationale**: No backend endpoint confirmed (constitution XIII); client CSV generation uses no new dependency
- **Alternative rejected**: jsPDF / xlsx libraries — new dependencies not justified (constitution V)

### 7. Gudang Serah Terima: Conditional rendering

- **Decision**: Conditionally rendered via `v-if` within `StepPaketSarpras.vue` when selected paket is `EKSTENSIFIKASI` or `INTENSIFIKASI`
- **Rationale**: Clean reactive binding; switching paket triggers confirmation dialog before clearing Gudang data

---

## Persyaratan Dokumen per Paket (Static Config Research)

Based on standard BPDP SARPRAS requirements:

| Paket | Dokumen Wajib |
|-------|---------------|
| Ekstensifikasi | Proposal, Akta Lembaga, KTP Ketua, SK Kemenkumham, STDB Pekebun, Peta Lahan, Foto Kebun |
| Intensifikasi | Proposal, Akta Lembaga, KTP Ketua, STDB Pekebun, Foto Kebun |
| Alat Pascapanen | Proposal, Akta Lembaga, KTP Ketua, Surat Pernyataan Penggunaan |
| Unit Pengolahan Hasil | Proposal, Akta Lembaga, KTP Ketua, IMB/PBG Gudang, Foto Lokasi UPH |
| Jalan Kebun | Proposal, Akta Lembaga, KTP Ketua, Gambar Teknis Jalan, Bukti Kepemilikan Lahan Jalur |
| Alat Transportasi | Proposal, Akta Lembaga, KTP Ketua, Surat Pernyataan Penggunaan |
| Mesin Pertanian | Proposal, Akta Lembaga, KTP Ketua, Spesifikasi Teknis Mesin |
| Infrastruktur Pasar | Proposal, Akta Lembaga, KTP Ketua, IMB/PBG, Surat Kepemilikan/HGU |
| Verifikasi/Penelusuran Teknis | Proposal, Akta Lembaga, KTP Ketua, Surat Pernyataan Kesiapan Verifikasi |

---

## Backend Contract Status

No backend endpoints confirmed for:
- `POST /pengusulan` — submit proposal
- `GET /pengusulan/persyaratan/:paket` — fetch persyaratan per paket
- `POST /pengusulan/upload` — upload document
- `GET /pengusulan/rab/download` — download RAB template

**Approach**: All operations client-simulated per Constitution XIII. Contract document created in `contracts/pengusulan-baru-ui-contract.md`.

---

## NEEDS CLARIFICATION: All Resolved

No unresolved clarifications. All design decisions above address potential ambiguities.
