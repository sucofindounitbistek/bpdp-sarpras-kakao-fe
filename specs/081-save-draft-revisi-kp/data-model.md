# Data Model & Schema Changes: Simpan Sebagai Draft pada Proses Revisi Proposal

## 1. DTO Model Updates (`internal/proposal/dto.go`)

### `ResubmitProposalRequest`
Menambahkan field `is_draft` opsional (default `false` jika tidak dikirim):

```go
type ResubmitProposalRequest struct {
	IsDraft          *bool `json:"is_draft,omitempty"`
	UpdatedDocuments []struct {
		DokumenProposalID uint `json:"dokumen_proposal_id"`
		FileID            uint `json:"file_id"`
	} `json:"updated_documents"`
	StorageArea            *StorageAreaRequest            `json:"storage_area,omitempty"`
	UpdatedFarmerData      []UpdatedFarmerDataPayload     `json:"updated_farmer_data,omitempty"`
	UpdatedFarmerDocuments []UpdatedFarmerDocumentPayload `json:"updated_farmer_documents,omitempty"`
	UpdatedLandData        []UpdatedLandDataPayload       `json:"updated_land_data,omitempty"`
	UpdatedLandDocuments   []UpdatedLandDocumentPayload   `json:"updated_land_documents,omitempty"`
	UpdatedRabDocument     *UpdatedRabDocumentPayload     `json:"updated_rab_document,omitempty"`
	UpdatedRabItems        []UpdatedRabItemPayload        `json:"updated_rab_items,omitempty"`
}
```

## 2. State Transition Matrix

| Aksi | Status Proposal Sebelum | Parameter `is_draft` | Status Proposal Sesudah | Catatan Penolakan di DB | Notifikasi |
|------|------------------------|---------------------|------------------------|-------------------------|------------|
| **Simpan Draf** | `REV_FROM_KAB` | `true` | `REV_FROM_KAB` (Tetap) | Dipertahankan | Tidak Dikirim |
| **Simpan Draf** | `REV_FROM_PROV` | `true` | `REV_FROM_PROV` (Tetap) | Dipertahankan | Tidak Dikirim |
| **Kirim Ulang Revisi** | `REV_FROM_KAB` / `REV_FROM_PROV` | `false` / `nil` | `SUBMITTED` | Direset (Dihapus/Resolved) | Dikirim ke Verifikator |

## 3. Frontend Store State Updates (`proposalRevisionStore.ts`)

```typescript
// New Reactive State:
const isDrafting = ref<boolean>(false);

// New Action:
async function saveDraftRevision(storageAreaPayload?: any): Promise<boolean>
```
