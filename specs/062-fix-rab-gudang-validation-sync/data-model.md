# Data Model: Sync Existing RAB and Storage Area Validation Statuses

## Alias Map Specification in Store

```typescript
const aliasMap: Record<string, string> = {
  'SK_CPCL': 'sk-cpcl',
  'BERITA_ACARA_DOKUMEN': 'berita-acara-dokumen',
  'BERITA_ACARA_LAPANGAN': 'berita-acara-lapangan',
  'sk-cpcl': 'SK_CPCL',
  'berita-acara-dokumen': 'BERITA_ACARA_DOKUMEN',
  'berita-acara-lapangan': 'BERITA_ACARA_LAPANGAN',
  'RAB_RK': 'rabDocument',
  'RAB_PROPOSAL': 'rabDocument',
  'RAB': 'rabDocument',
  'rabDocument': 'RAB_RK',
};
```

---

## Storage Area Sync Specification

```typescript
function syncStorageAreaValidations(storageArea: any) {
  if (!storageArea) return;
  if (storageArea.address_is_valid !== null && storageArea.address_is_valid !== undefined) {
    setVerificationStatus('gudangAlamat', storageArea.address_is_valid ? 'APPROVED' : 'REJECTED');
    if (storageArea.address_notes && verifications.value['gudangAlamat']) {
      verifications.value['gudangAlamat'].notes = storageArea.address_notes;
    }
  }
  if (storageArea.coordinate_is_valid !== null && storageArea.coordinate_is_valid !== undefined) {
    setVerificationStatus('gudangKoordinat', storageArea.coordinate_is_valid ? 'APPROVED' : 'REJECTED');
    if (storageArea.coordinate_notes && verifications.value['gudangKoordinat']) {
      verifications.value['gudangKoordinat'].notes = storageArea.coordinate_notes;
    }
  }
  if (storageArea.exterior_photo_is_valid !== null && storageArea.exterior_photo_is_valid !== undefined) {
    setVerificationStatus('fotoTampakDepan', storageArea.exterior_photo_is_valid ? 'APPROVED' : 'REJECTED');
    if (storageArea.exterior_photo_notes && verifications.value['fotoTampakDepan']) {
      verifications.value['fotoTampakDepan'].notes = storageArea.exterior_photo_notes;
    }
  }
  if (storageArea.interior_photo_is_valid !== null && storageArea.interior_photo_is_valid !== undefined) {
    setVerificationStatus('fotoTampakDalam', storageArea.interior_photo_is_valid ? 'APPROVED' : 'REJECTED');
    if (storageArea.interior_photo_notes && verifications.value['fotoTampakDalam']) {
      verifications.value['fotoTampakDalam'].notes = storageArea.interior_photo_notes;
    }
  }
}
```
