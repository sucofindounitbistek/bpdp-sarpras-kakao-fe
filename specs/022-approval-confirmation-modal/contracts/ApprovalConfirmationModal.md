# Component Contract: ApprovalConfirmationModal

**Feature**: 022-approval-confirmation-modal
**Date**: 2026-08-06

## Interface

```typescript
// Props
interface ApprovalConfirmationModalProps {
  isOpen: boolean;
  actionType: 'approve' | 'reject';
  destinationStage: string;
  notes?: string;
}

// Emits
interface ApprovalConfirmationModalEmits {
  (e: 'close'): void;
  (e: 'confirm'): void;
}
```

## Usage Contract

```vue
<!-- Parent View -->
<ApprovalConfirmationModal
  :is-open="showConfirmModal"
  :action-type="confirmActionType"
  :destination-stage="confirmDestination"
  :notes="confirmNotes"
  @close="showConfirmModal = false"
  @confirm="executeApproval"
/>
```

## Behavior Contract

| Scenario | Expected Behavior |
|----------|-------------------|
| Modal opens | `isOpen=true` → modal tampil dengan overlay, judul sesuai `actionType`, deskripsi menampilkan `destinationStage` |
| User clicks "Batal" | Emit `close`, modal hilang, tidak ada side effect |
| User clicks overlay / X | Emit `close`, modal hilang, tidak ada side effect |
| User presses Escape | Emit `close`, modal hilang, tidak ada side effect |
| User clicks "Konfirmasi" | Emit `confirm`, tombol disabled, tampilkan spinner |
| Confirm sukses (parent handles) | Parent menutup modal (`isOpen=false`), tampilkan toast sukses |
| Confirm error (parent handles) | Parent set `isOpen` tetap true, modal tampilkan error dari parent? |
| Double-click konfirmasi | Tombol disabled setelah klik pertama, tidak ada duplikasi emit |

## Styling Contract

- Wrapper: base `Modal.vue` dari `src/components/ui/Modal.vue`
- Warna konfirmasi approve: `bg-[#066C2A]` (primary green)
- Warna konfirmasi reject: `bg-rose-600` (danger red)
- Warna batal: `variant="outline"` dari `Button.vue`
- Dark mode: inherit dari `Modal.vue` yang sudah mendukung dark mode
- Font: `font-medium` untuk judul, `font-semibold` untuk tombol (Konstitusi X)
- Responsive: `p-4` pada mobile, `max-w-md` untuk modal width

## Integration Points

| Halaman | Lokasi Integrasi | Target Handler |
|---------|-----------------|----------------|
| `ApprovalDitjenbunView.vue` | Sebelum `handleApprove()` / `handleReject()` | `store.approveDitjenbun()` / `store.rejectDitjenbun()` |
| `ApprovalBpdpView.vue` | Sebelum `handleApprove()` / `handleReject()` | `store.approveBpdpKadiv()` / `store.rejectBpdpKadiv()` / `store.returnRekomtekToDitjenbun()` |
| `CekiBpdpView.vue` | Sebelum aksi verifikasi | Store verifikasi BPDP |
| `CekiDitjenbunView.vue` | Sebelum aksi verifikasi | Store verifikasi Ditjenbun |