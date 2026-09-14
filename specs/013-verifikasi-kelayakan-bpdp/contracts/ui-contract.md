# UI & Store Contract: Verifikasi Kelayakan BPDP

**Feature Branch**: `013-verifikasi-kelayakan-bpdp`  
**Date**: 2026-08-05  

## Store Action Contracts (`src/stores/rekomtek.ts`)

### 1. `submitBpdpChecklist(usulanId: string, checklist: BpdpChecklistState): Promise<void>`
- **Description**: Persists the document validation states and notes for `BPDP_VERIFIKATOR`.
- **Preconditions**: User active role is `BPDP_VERIFIKATOR`. Usulan status is `VERIFIKASI_BPDP`.
- **Behavior**: Updates `activeUsulan.bpdpChecklist` and auto-saves to store. Emits no modal, updates silently (<1s latency).

### 2. `kembalikanKeDitjenbun(usulanId: string, alasan: string, actorName: string): Promise<void>`
- **Description**: Returns usulan back to `APPROVAL_DITJENBUN` (Ketua Ditjenbun) when document validation fails.
- **Preconditions**: At least 1 document has `valid === false` and non-empty `note`.
- **Postconditions**: Usulan status transitions to `APPROVAL_DITJENBUN`. Log entry appended. User redirected to `/bpdp/antrean`.

---

## Component Interface (`VerifikasiDokumenItem.vue`)

### Component Location
`src/components/rekomtek/VerifikasiDokumenItem.vue`

### Inputs (Props)
- `title`: `string` (Required) — e.g. "Rekomendasi Teknis Ditjenbun"
- `subtitle`: `string` (Optional) — e.g. "Nomor: 412/DITJENBUN/REKOMTEK/2026"
- `valid`: `boolean | null` (Required) — `true` (Sesuai), `false` (Tidak Sesuai), `null` (Unchecked)
- `note`: `string` (Required) — Text note when invalid
- `fileUrl`: `string` (Optional) — Direct link for file download. Render download button only if truthy.
- `downloadLabel`: `string` (Optional, Default: "Download Dokumen")
- `readonly`: `boolean` (Optional, Default: `false`)

### Events (Emits)
- `update:valid`: `(val: boolean | null) => void`
- `update:note`: `(val: string) => void`
