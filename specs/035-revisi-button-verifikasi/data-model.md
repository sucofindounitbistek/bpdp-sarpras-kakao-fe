# Data Model: Dynamic Verification Action Button for Rejection & Revision (035-revisi-button-verifikasi)

## Component Reactive State Specifications

### Verification Rejection State

```typescript
// Computed property evaluating rejection status across all verified items
const hasRejectedItems = computed<boolean>(() => {
  // Checks document verification map & pekebun document verifications
  const hasDokumenRejections = allVerificationKeys.value.some(
    (key) => getVerification(key).status === 'REJECTED'
  );
  
  const hasPekebunRejections = pekebunList.value.some((p) => {
    const docs = p.enriched?.dokumen ?? [];
    return docs.some((doc) =>
      getDocVerificationKeys(p.cpcl.id, doc).some((key) =>
        verifikasiStore.getVerification(key).status === 'REJECTED'
      )
    );
  });

  return hasDokumenRejections || hasPekebunRejections;
});
```

## Button State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> AllApprovedOrPending: Initial Load / Items Approved
    AllApprovedOrPending --> ItemRejected: Officer clicks "Tolak" on any item
    ItemRejected --> AllApprovedOrPending: Officer changes item back to "Setuju" / Unverified
    
    state AllApprovedOrPending {
        ButtonLabel: "Simpan & Lanjut" / "Kirim"
        ButtonVariant: Primary Green (#066C2A)
        Action: validateAndProceed() -> Next Step
    }

    state ItemRejected {
        ButtonLabel: "Kembalikan Untuk Revisi"
        ButtonVariant: Rose Red (bg-rose-600)
        Action: submitRejection() -> Open Rejection Confirmation Modal
    }
```
