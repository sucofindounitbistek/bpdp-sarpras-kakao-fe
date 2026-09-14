# Data Model: Storage Area Alignment

## Entities

### StorageArea / GudangSerahTerima (Aligned Model)

Represents the warehouse/storage area data payload after mapping from the backend response.

| Property Name | Type | Source Field (Backend API) | Description |
|---|---|---|---|
| `id` | `number` (optional) | `id` | Unique identifier. |
| `address` | `string` (optional) | `address` | Backend address string. |
| `coordinate` | `string` (optional) | `coordinate` | Backend coordinate coordinates string. |
| `alamat` | `string` | `address` | Aligned frontend address field. |
| `koordinat` | `string` | `coordinate` | Aligned frontend coordinate field. |
| `fotoTampakDepan` | `DokumenUpload` (nullable) | Constructed from `exterior_photo_file_url` & `exterior_photo_file_id` | Aligned photo object for exterior preview. |
| `fotoTampakDalam` | `DokumenUpload` (nullable) | Constructed from `interior_photo_file_url` & `interior_photo_file_id` | Aligned photo object for interior preview. |

### DokumenUpload (Constructed for Photos)

Represents the metadata format required by the frontend document previewer.

| Property Name | Type | Value / Source |
|---|---|---|
| `persyaratanId` | `string` | `'gudang-depan'` (for exterior) or `'gudang-dalam'` (for interior) |
| `namaFile` | `string` | `'foto_tampak_depan_gudang.jpg'` or `'foto_tampak_dalam_gudang.jpg'` |
| `mimeType` | `string` | `'image/jpeg'` (default fallback) |
| `ukuranBytes` | `number` | `0` |
| `dataUrl` | `string` | `exterior_photo_file_url` or `interior_photo_file_url` |
| `uploadedAt` | `string` | `''` |
| `fileId` | `number` (optional) | `exterior_photo_file_id` or `interior_photo_file_id` |
