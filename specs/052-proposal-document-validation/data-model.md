# Phase 1 Data Model: Proposal Document Validation

## Validation Model

```typescript
interface DocumentRequirement {
  id: string;
  nama: string;
  wajib: boolean;
}

interface VerificationStatus {
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  notes: string;
}
```

## Validation Matrix

| Condition | Action | Result |
| :--- | :--- | :--- |
| `wajib = true` & File missing | `validateAndProceed()` | Block step + Toast: `'Dokumen [Nama] wajib diunggah.'` |
| `wajib = true` & Status != `APPROVED` | `validateAndProceed()` | Block step + Toast: `'Dokumen [Nama] belum disetujui.'` |
| Uploaded file & Status == `PENDING` | `validateAndProceed()` | Block step + Toast: `'Dokumen [Nama] belum diverifikasi.'` |
| All `wajib` files approved & no pending | `validateAndProceed()` | Advance `verifikasiStore.currentStep = 3` |
| Any file status == `REJECTED` & `notes` empty | `submitRejection()` | Block rejection + Toast: `'Harap berikan catatan alasan penolakan.'` |
