# UI Component & API Contracts: Verifikasi Rekomtek & SK Dirut

## Reusable UI Components Contract

### 1. `ChecklistDokumen.vue`
Komponen checkbox dinamis untuk menilai kelengkapan berkas usulan secara interaktif.
* **Props**:
  * `items`: `{ key: string; label: string; checked: boolean }[]` — Daftar dokumen yang diverifikasi.
  * `readonly`: `boolean` (default: `false`) — Jika true, input checkbox tidak aktif (hanya tampil status).
* **Events**:
  * `update:items`: `(updated: { key: string; label: string; checked: boolean }[]) => void` — Dilepas ketika status checklist berubah.

### 2. `FormPengembalianModal.vue`
Dialog modal melayang (modal popup) untuk memproses pengembalian proposal yang tidak sesuai ke dinas terkait.
* **Props**:
  * `isOpen`: `boolean` — Visibilitas modal.
* **Events**:
  * `close`: `() => void` — Ditrigger saat modal ditutup.
  * `submit`: `(payload: { tujuan: 'PERBAIKAN_DINAS_KAB' | 'PERBAIKAN_DINAS_PROV'; alasan: string }) => void` — Ditrigger saat formulir disubmit dan tervalidasi.

---

## Backend API Endpoints Contract

Frontend akan berinteraksi dengan API menggunakan Axios. Jika backend belum mengimplementasikan endpoint berikut, Pinia Store akan menyimulasikan respon dengan data statis lokal yang presisi.

### 1. Antrean Usulan
* **Endpoint**: `GET /api/rekomtek/usulan`
* **Query Params**: `role` (`DITJENBUN_VERIFIKATOR` | `DITJENBUN_APPROVAL` | `BPDP_VERIFIKATOR` | `BPDP_APPROVAL`)
* **Response**: `200 OK`
```json
[
  {
    "id": "usl-001",
    "nomorUsulan": "USL/2026/07/005",
    "namaKelompokTani": "Maju Bersama Kakao",
    "komoditas": "Kakao",
    "status": "VERIFIKASI_DITJENBUN",
    "createdAt": "2026-07-30T10:00:00Z"
  }
]
```

### 2. Kirim Perintah Perbaikan Usulan (Ditjenbun)
* **Endpoint**: `POST /api/rekomtek/usulan/:id/kembalikan`
* **Payload**:
```json
{
  "tujuan": "PERBAIKAN_DINAS_KAB", 
  "alasan": "SK CPCL tidak mencantumkan tanda tangan basah Kepala Dinas Daerah."
}
```
* **Response**: `200 OK`

### 3. Pemilihan Bantuan & Generate Rekomtek (Ditjenbun)
* **Endpoint**: `POST /api/rekomtek/usulan/:id/generate-rekomtek`
* **Payload**:
```json
{
  "bantuanType": "BARANG"
}
```
* **Response**: `201 Created`
```json
{
  "draftUrl": "/files/draft-rekomtek-usl-001.pdf"
}
```

### 4. Upload Rekomtek Signed (Ditjenbun)
* **Endpoint**: `POST /api/rekomtek/usulan/:id/upload-rekomtek`
* **Payload (Multipart Form-Data)**:
  * `file`: `Binary PDF File`
  * `nomorRekomtek`: `"505/DITJENBUN/REKOMTEK/2026"`
* **Response**: `200 OK`

### 5. Ajukan ke Ditjenbun Approval / BPDP
* **Endpoint**: `POST /api/rekomtek/usulan/:id/status`
* **Payload**:
```json
{
  "status": "APPROVAL_DITJENBUN",
  "actorRole": "DITJENBUN_VERIFIKATOR"
}
```
* **Response**: `200 OK`

### 6. Keputusan Kelayakan oleh Kadiv BPDP (Approval BPDP)
* **Endpoint**: `POST /api/rekomtek/usulan/:id/bpdp-approval`
* **Payload**:
```json
{
  "action": "APPROVE", 
  "actorRole": "BPDP_APPROVAL",
  "note": "Kelayakan rekomtek disetujui, siap terbit SK Dirut."
}
```
* **Response**: `200 OK`
