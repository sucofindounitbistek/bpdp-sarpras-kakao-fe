# API Contracts: Penyaluran Barang

## 1. Permohonan Penyaluran Barang

### `POST /api/v1/penyaluran-barang`
Create a new permohonan penyaluran barang.

**Request (Multipart/Form-Data)**:
- `proposal_id` (optional string)
- `kategori_paket` (string: "Ekstensifikasi" | "Intensifikasi")
- `items_rab` (JSON string array of items)
- `surat_permohonan` (File: PDF, max 5MB)

**Response 201 Created**:
```json
{
  "data": {
    "id": "PB-2026-001",
    "nomor_permohonan": "SRPR-KLPA/EKS/2026/001",
    "status": "MENUNGGU_VERIFIKASI_TEKNIS",
    "created_at": "2026-08-31T16:00:00Z"
  },
  "message": "success"
}
```

---

### `POST /api/v1/penyaluran-barang/{id}/verifikasi-teknis`
BPDP Teknis verification decision.

**Request JSON**:
```json
{
  "is_approved": true,
  "catatan": "Dokumen dan rincian varietas bibit telah sesuai spesifikasi teknis."
}
```

---

### `POST /api/v1/penyaluran-barang/{id}/disposisi-ppk`
BPDP PPK disposition to ULP or Pengadaan Langsung.

**Request JSON**:
```json
{
  "jalur_pengadaan": "ULP_TENDER",
  "catatan": "Diteruskan ke ULP untuk proses tender e-catalog."
}
```

---

### `POST /api/v1/penyaluran-barang/{id}/selesai-tender-ulp`
BPDP ULP tender winner announcement.

**Request JSON**:
```json
{
  "vendor_name": "PT Agro Sarana Nusantara",
  "nilai_tender": 147000000,
  "catatan": "Pemenang tender e-catalog paket ekstensifikasi kelapa."
}
```

---

### `POST /api/v1/penyaluran-barang/{id}/dokumen-kontrak`
BPDP Teknis input and upload Dokumen Kontrak "A".

**Request (Multipart/Form-Data)**:
- `nomor_kontrak`: "KTRK/BPDP-SARPRAS/EKS/2026/001"
- `nama_penyedia`: "PT Agro Sarana Nusantara"
- `jenis_barang`: "Benih & Pupuk"
- `jumlah_barang`: 1200
- `satuan_barang`: "Batang"
- `harga_satuan`: 85000
- `total_nilai_kontrak`: 147000000
- `termin_pembayaran`: "Termin 1: 30%, Termin 2: 70%"
- `termin_penyaluran`: "Tahap 1: 50%, Tahap 2: 50%"
- `jangka_waktu_hari`: 60
- `tanggal_mulai`: "2026-09-01"
- `tanggal_selesai`: "2026-10-31"
- `file_kontrak`: (PDF file, max 5MB)

---

### `POST /api/v1/penyaluran-barang/{id}/surat-tugas-surveyor`
BPDP Teknis assign surveyor.

**Request JSON**:
```json
{
  "nomor_surat": "ST-SRV/BPDP/2026/088",
  "nama_lembaga_surveyor": "PT Sucofindo (Persero)",
  "lingkup_tugas": "Sampling Mutu Fisik Barang & Pengawasan Titik Distribusi"
}
```
