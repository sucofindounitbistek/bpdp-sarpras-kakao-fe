# UI Contract: SK CPCL Document Upload & Removal Interface

## Overview

This contract defines the component events, props, and UI state expectations for document management components in the Regency Verification flow (`/dinas/verifikasi/kabupaten/:id`).

---

## Component Interfaces

### 1. `StepDataCPCL.vue`

#### Inputs & Dependencies
- `useVerifikasiKabDraftStore`: Reads `skCpcl`, `skCpclRemoved`, `beritaAcaraDokumen`, `beritaAcaraDokumenRemoved`, `beritaAcaraLapangan`, `beritaAcaraLapanganRemoved`.
- `usePengusulanStore`: Reads active proposal entity (`pengajuan`) for fallback documents via `getExistingDoc()`.

#### State Actions Triggered
- `handleRemoveSkCpcl()`: Triggers `verifikasiStore.removeSkCpcl()`, sets toast message.
- `handleSkCpclUpload(file)`: Encodes file to Base64/DataURL `DokumenUpload`, calls `verifikasiStore.setSkCpcl(doc)`, sets success toast message.

#### DOM Contract Expectations
- When `activeSkCpcl` is `null`:
  - Upload container `div#skCpclUploadContainer` renders `<FileUpload id="skCpclUpload" />`.
  - Preview card `div#skCpclInfoCard` is NOT rendered.
- When `activeSkCpcl` is truthy:
  - Upload container `<FileUpload />` is NOT rendered.
  - Preview card `div#skCpclInfoCard` renders file name, size, preview button (`Eye`), and removal button (`button:contains("Hapus")`).

---

### 2. `FileUpload.vue`

#### Inputs & Emits
- `props.id`: string identifier (e.g. `"skCpclUpload"`).
- `props.accept`: file extension filter (e.g. `".pdf,.jpg,.jpeg,.png"`).
- `emits('file-selected', file: File)`: Fired when user selects or drops a valid file.

#### Reset Behavior
- When parent component clears document state, the input control element MUST reset `input.value = ''` so selecting the same file triggers change listener.

---

### 3. Submission Payload Contract (`StepSummaryDanSubmit.vue`)

#### Request Data Packaging
When submitting Step 4, documents to be updated are packaged into the verification submission payload:

```json
{
  "pengajuan_id": 24,
  "documents": [
    {
      "document_type": "SK_CPCL",
      "file_name": "SK_CPCL_Signed_2026.pdf",
      "mime_type": "application/pdf",
      "file_size": 245120,
      "data_url": "data:application/pdf;base64,..."
    }
  ]
}
```
