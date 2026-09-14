# Data Model: Submit Storage Area & Proposal Document Validations to Backend

## Storage Area Payload Structure

```typescript
const storageAreaPayload = {
  address_is_valid: mapVerificationStatusToBoolean(verifikasiStore.getVerification('gudangAlamat').status),
  address_notes: verifikasiStore.getVerification('gudangAlamat').notes || null,
  coordinate_is_valid: mapVerificationStatusToBoolean(verifikasiStore.getVerification('gudangKoordinat').status),
  coordinate_notes: verifikasiStore.getVerification('gudangKoordinat').notes || null,
  exterior_photo_is_valid: mapVerificationStatusToBoolean(verifikasiStore.getVerification('fotoTampakDepan').status),
  exterior_photo_notes: verifikasiStore.getVerification('fotoTampakDepan').notes || null,
  interior_photo_is_valid: mapVerificationStatusToBoolean(verifikasiStore.getVerification('fotoTampakDalam').status),
  interior_photo_notes: verifikasiStore.getVerification('fotoTampakDalam').notes || null,
};
```

---

## Proposal Document Validation Payload Structure

```typescript
const proposalDocPayload: {
  dokumen_proposal_id: number;
  is_valid: boolean;
  notes?: string;
}[] = [];
```
