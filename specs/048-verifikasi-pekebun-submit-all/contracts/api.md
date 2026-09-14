# API Contract Reference: Verifikasi Pekebun Submit All at End

## Endpoints Called During Submit

The following endpoints are triggered sequentially on final submission in Step 4:

### 1. Bulk Farmer Document Validations
- **Method**: `POST`
- **Path**: `/api/v1/farmer-document-validations/bulk`
- **Body**: Array of farmer document validations.

### 2. Bulk Land Document Validations
- **Method**: `POST`
- **Path**: `/api/v1/land-document-validations/bulk`
- **Body**: Array of land document validations.

### 3. Bulk Create Proposal Documents
- **Method**: `POST`
- **Path**: `/api/v1/proposals/:id/documents/bulk`
- **Body**: Uploaded SK CPCL and Berita Acara document IDs.

### 4. Update Proposal Status
- **Method**: `PATCH`
- **Path**: `/api/v1/proposals/:id`
- **Body**: `{ "status": "KAB_SUBMITTED" }` or `{ "status": "REV_FROM_KAB" }`
