# Contract Definition: Kabupaten Rejection Status Update

## Interface Contract

### Rejection Payload (Frontend -> Backend / Store)

```typescript
export interface UpdateProposalStatusPayload {
  status: 'REV_FROM_KAB';
  notes: string;
}
```

### Action Invocation in `StepVerifikasiPekebunDanDokumenProposal.vue`

```typescript
async function submitRejection() {
  // ... accumulate notes ...
  pendingConfirmAction.value = async () => {
    await syncBulkProposalDocumentValidations();
    if (pengajuan.value) {
      await pengusulanStore.updateProposal(pengajuan.value.id, {
        status: 'REV_FROM_KAB',
      });
      pengusulanStore.updateStatus(pengajuan.value.id, PengajuanStatus.REV_FROM_KAB, notes);
    }
    toast.warning('Proposal dikembalikan ke Pemohon untuk perbaikan.', 'Revisi Dikirim');
    showConfirmModal.value = false;
    router.push('/dinas/verifikasi');
  };
  showConfirmModal.value = true;
}
```
