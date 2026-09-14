# Data Model & Interfaces: Remove Generate SK Step

## Entities

### `skDirut` (SK Director Utama Metadata)
Holds the metadata for the SK finalization.

| Field | Type | Description |
|-------|------|-------------|
| `nomorSk` | `string` | The official SK Decision number inputted by the user |
| `draftUrl` | `string` | The download URL for the draft PDF. Automatically populated on load if missing. |
| `signedUrl` | `string` | The URL of the uploaded signed PDF |
| `uploadedAt` | `string` | ISO timestamp of the signed SK upload |
