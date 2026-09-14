# Phase 1 Data Model: Storage Area Verification Notes

## Data Model & Interfaces

### VerificationItem

```typescript
type VerificationStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

interface VerificationItem {
  status: VerificationStatus;
  notes: string;
}
```

### Storage Area Verification Keys

| Key | Target Field | Label in Rejection Summary |
| :--- | :--- | :--- |
| `gudangAlamat` | Alamat Gudang Serah Terima | `Gudang (Alamat)` |
| `gudangKoordinat` | Koordinat Gudang Serah Terima | `Gudang (Koordinat)` |
| `fotoTampakDepan` | Foto Tampak Depan Gudang | `Gudang (Foto Tampak Depan)` |
| `fotoTampakDalam` | Foto Tampak Dalam Gudang | `Gudang (Foto Tampak Dalam)` |

### State Flow

1. **User Action**: Verifier clicks "Tolak" on a storage area item.
2. **State Transition**: `setVerificationStatus(key, 'REJECTED')` sets `status = 'REJECTED'`.
3. **UI Rendering**: Textarea renders bound to `getVerification(key).notes`.
4. **Validation**: `submitRejection()` verifies `notes.trim()` is non-empty for all rejected items.
5. **Payload Formatting**: Rejection summary compiles `Gudang (<item>): <notes>` into revision notes string sent to API.
