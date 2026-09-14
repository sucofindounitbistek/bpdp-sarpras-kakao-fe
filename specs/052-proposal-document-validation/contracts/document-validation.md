# Interface Contract: Proposal Document Validation

## Contract Overview

This document specifies the validation behavior inside `validateAndProceed()` in `StepVerifikasiPekebunDanDokumenProposal.vue`.

## Validation Algorithm Contract

```typescript
function validateAndProceed() {
  const unfulfilledMandatory = currentPersyaratan.value.filter((p) => {
    if (!p.wajib) return false;
    const doc = getDokumen(p.id);
    const v = getVerification(p.id);
    return !doc || v.status !== 'APPROVED';
  });

  if (unfulfilledMandatory.length > 0) {
    const names = unfulfilledMandatory.map((p) => p.nama).join(', ');
    toast.error(`Dokumen wajib berikut belum diunggah atau disetujui: ${names}`);
    return;
  }

  verifikasiStore.currentStep = 3;
}
```
