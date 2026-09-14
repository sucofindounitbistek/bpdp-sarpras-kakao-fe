# Research: Modal Konfirmasi Pengiriman Approval

**Feature**: 022-approval-confirmation-modal
**Date**: 2026-08-06

## Decision 1: Base Modal Component

**Decision**: Gunakan `Modal.vue` (`src/components/ui/Modal.vue`) sebagai base wrapper.

**Rationale**:
- Komponen `Modal.vue` sudah ada dan digunakan oleh `DocumentPreviewModal.vue` dan `ModalRevisiBerkas.vue`
- Menyediakan overlay, Teleport, Transition, close-on-overlay, dan slot `#footer` standar
- Memastikan konsistensi visual dan perilaku dengan modal lain di aplikasi

**Alternatives considered**:
- Build standalone modal from scratch: Rejected - violates Principle V (YAGNI), duplikasi kode overlay/transition
- Use `FormPengembalianModal` pattern: Rejected - base `Modal.vue` lebih bersih dan sudah teruji

## Decision 2: Component Location

**Decision**: Taruh di `src/components/approval/ApprovalConfirmationModal.vue`.

**Rationale**:
- Mengikuti konvensi organisasi per modul: `src/components/rekomtek/`, `src/components/dinas/`, `src/components/pengusulan/`
- Mudah ditemukan oleh developer yang bekerja di modul approval

**Alternatives considered**:
- `src/components/ui/`: Rejected - modal ini spesifik untuk domain approval, bukan UI generik
- Inline di setiap view: Rejected - melanggar Principle I (reusable components)

## Decision 3: Integration Pattern

**Decision**: Modal dikontrol oleh `ref<boolean>` di setiap view, di-trigger dalam handler aksi yang sudah ada sebelum memanggil store action.

**Rationale**:
- Pattern "intercept & confirm" lebih sederhana daripada pattern Promise-based karena tidak perlu mengubah signature store action
- Setiap view sudah memiliki `isSubmitting` ref dan handler `handleApprove`/`handleReject` yang bisa di-intercept
- Modal receive `@confirm` emit yang melanjutkan eksekusi ke store action

**Alternatives considered**:
- Promise-based composable `useConfirmApproval()`: Rejected - Pattern terlalu abstrak untuk 4 view, over-engineering (Principle V)
- Modal sebagai navigation guard: Rejected - tidak applicable karena approval action adalah button click, bukan route navigation

## Decision 4: Double-Submission Prevention

**Decision**: Disable tombol konfirmasi dengan `isConfirming` ref di dalam modal setelah klik pertama, re-enable jika error.

**Rationale**:
- Cukup dengan local state di komponen modal, tidak perlu Pinia store
- `@confirm` emit hanya bisa di-trigger sekali sebelum state di-reset

**Alternatives considered**:
- Debounce/throttle: Rejected - tidak mencegah double-submission, hanya delay
- AbortController: Rejected - over-engineering untuk use case ini

## Decision 5: Wording Externalization

**Decision**: Tambah section `confirmationModal` di `src/config/localization.ts`.

**Rationale**:
- Sesuai Konstitusi XV: semua user-facing copy harus di `localization.ts`
- Section khusus untuk modal konfirmasi memudahkan pencarian dan perubahan wording

**Alternatives considered**:
- Hardcode di template: Rejected - melanggar Konstitusi XV
- File terpisah: Rejected - project convention adalah single file `localization.ts`

## Decision 6: Error Handling

**Decision**: Modal tetap terbuka saat error, tampilkan pesan error di dalam modal (bukan toast).

**Rationale**:
- FR-007 mensyaratkan modal tetap terbuka dan menampilkan pesan error
- User dapat mencoba kembali tanpa harus membuka ulang modal
- Error message di dalam modal lebih kontekstual daripada toast yang auto-dismiss

**Alternatives considered**:
- Tutup modal + toast error: Rejected - bertentangan dengan FR-007
- Toast error + modal tetap terbuka: Rejected - redundan, membingungkan user