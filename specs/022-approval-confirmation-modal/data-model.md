# Data Model: Modal Konfirmasi Pengiriman Approval

**Feature**: 022-approval-confirmation-modal
**Date**: 2026-08-06

## Entities

### ApprovalConfirmationModal (Component Props)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Kontrol visibilitas modal |
| `actionType` | `'approve' \| 'reject'` | Yes | Jenis tindakan: setujui/teruskan atau tolak/kembalikan |
| `destinationStage` | `string` | Yes | Nama tahap tujuan (mis. "BPDP Verifikator", "Verifikasi Dinas Kab/Kota") |
| `notes` | `string` | No | Catatan/alasan (hanya untuk reject) |

### ApprovalConfirmationModal (Emits)

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | `void` | User membatalkan konfirmasi (Batal / X / overlay click) |
| `confirm` | `void` | User menekan tombol konfirmasi |

### ApprovalConfirmationModal (Internal State)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isConfirming` | `boolean` | `false` | Loading state; disable tombol setelah klik pertama |
| `errorMessage` | `string` | `''` | Pesan error dari backend jika gagal |

### Localization Additions

```typescript
// src/config/localization.ts - new section
confirmationModal: {
  approveTitle: 'Konfirmasi Persetujuan',
  approveDescription: 'Anda akan meneruskan proposal ke tahap:',
  rejectTitle: 'Konfirmasi Pengembalian',
  rejectDescription: 'Anda akan mengembalikan proposal ke tahap:',
  notesLabel: 'Catatan:',
  confirmApprove: 'Ya, Setujui',
  confirmReject: 'Ya, Kembalikan',
  cancel: 'Batal',
  close: 'Tutup',
  errorDefault: 'Terjadi kesalahan. Silakan coba lagi.',
}
```

## State Transitions

```
[User clicks approve/reject button]
        |
        v
[Modal opens: isOpen=true, isConfirming=false, errorMessage='']
        |
   +----+----+
   |         |
[Batal]   [Konfirmasi]
   |         |
   v         v
[Modal     [isConfirming=true]
 closes]      |
   |          v
   |     [Panggil store action]
   |          |
   |     +----+----+
   |     |         |
   |  [Sukses]  [Error]
   |     |         |
   |     v         v
   |  [Modal    [isConfirming=false,
   |   closes]   errorMessage='...']
   |     |         |
   |     v         v
   |  [Toast    [Modal tetap
   |   sukses]   terbuka, user
   |             bisa coba lagi]
```