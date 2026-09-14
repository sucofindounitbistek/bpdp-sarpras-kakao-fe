# API Contract: Kabupaten Verification Details & Actions

## Endpoints

### 1. Get Proposal Detail
- **Method**: `GET`
- **Path**: `/api/v1/proposals/:id`
- **Response**: Details of the proposal aggregate (Nomor proposal, Lembaga info, CPCL list, documents).

### 2. Return for Revision
- **Method**: `POST`
- **Path**: `/api/v1/verifikasi-kab/:id/revisi`
- **Body**:
  ```json
  {
    "catatanRevisi": "Mohon perbarui berkas yang tidak valid."
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Proposal dikembalikan ke Pemohon untuk revisi",
    "data": {
      "id": "prop-10293",
      "currentStatus": "REVISION_ADMIN"
    }
  }
  ```

### 3. Submit SK CPCL & Approve
- **Method**: `POST`
- **Path**: `/api/v1/verifikasi-kab/:id/sk-cpcl`
- **Body**:
  ```json
  {
    "nomorSkCpcl": "SK-CPCL/14.01/2026/088",
    "tglSkCpcl": "2026-08-14",
    "fileSkCpclUrl": "https://storage.bpdp.go.id/sk/sk_cpcl_kampar.pdf",
    "catatanVerifikasi": "Administrasi lengkap",
    "statusVerifikasi": "APPROVED"
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Verifikasi Kabupaten selesai",
    "data": {
      "id": "prop-10293",
      "currentStatus": "REKOMTEK_KAB_ISSUED"
    }
  }
  ```
