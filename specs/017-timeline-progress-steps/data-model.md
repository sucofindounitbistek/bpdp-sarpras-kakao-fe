# Data Model: Pekebun Timeline Step View & Wording Refinement

## Reference Entities & Attributes

Fitur ini tidak memperkenalkan tabel basis data baru, melainkan mengonsumsi entitas yang sudah didefinisikan pada `src/types/pengusulan.ts`:

### PengajuanSarpras
Representasi usulan sarana prasarana yang diproses. Atribut yang relevan untuk tracking status adalah:
- `currentStatus`: `PengajuanStatus` (Enum) - Menentukan posisi usulan saat ini dalam alur workflow.

### PengajuanStatus (Enum)
Status-status yang memicu perubahan visual pada stepper:
- `DRAFT`: Usulan belum dikirim.
- `SUBMITTED`: Usulan diajukan pemohon.
- `REVISION_ADMIN`: Usulan perlu perbaikan administrasi oleh pemohon.
- `VERIFIED_ADMIN`: Usulan lolos verifikasi administrasi dinas kabupaten.
- `VERIFIED_FIELD`: Usulan lolos verifikasi lapangan dinas kabupaten.
- `REKOMTEK_KAB_ISSUED`: Rekomendasi teknis dinas kabupaten diterbitkan.
- `VALIDATED_PROV`: Validasi/asistensi dinas provinsi selesai.
- `SK_DITJENBUN_ISSUED`: Rekomendasi teknis Ditjenbun selesai (menunggu SK Dirut BPDP).
- `PKS_BPDP_SIGNED`: PKS BPDPKS ditandatangani.
- `DISBURSED`: Dana disalurkan.
- `COMPLETED`: Seluruh proses selesai.
- `REJECTED`: Usulan ditolak.

---

## Local Component Data Model (`TrackingPengusulanView.vue`)

Untuk merepresentasikan stepper secara dinamis, didefinisikan interface lokal untuk struktur data langkah (*step*):

```typescript
interface StepperStep {
  id: number;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
  isWarning?: boolean; // Khusus untuk status REVISION_ADMIN
  isError?: boolean;   // Khusus untuk status REJECTED
}
```

### Logic Evaluation Mapping

```typescript
const computedSteps = computed<StepperStep[]>(() => {
  if (!selectedProposal.value) return [];
  const status = selectedProposal.value.currentStatus;

  // 1. Submit Proposal
  const step1Completed = true; // Selalu true karena proposal sudah tersimpan/disubmit
  const step1Warning = status === PengajuanStatus.REVISION_ADMIN;

  // 2. Verifikasi Dinas Kab/Kota
  const step2Completed = [
    PengajuanStatus.REKOMTEK_KAB_ISSUED,
    PengajuanStatus.VALIDATED_PROV,
    PengajuanStatus.SK_DITJENBUN_ISSUED,
    PengajuanStatus.PKS_BPDP_SIGNED,
    PengajuanStatus.DISBURSED,
    PengajuanStatus.COMPLETED
  ].includes(status);
  const step2Active = [
    PengajuanStatus.SUBMITTED,
    PengajuanStatus.VERIFIED_ADMIN,
    PengajuanStatus.VERIFIED_FIELD
  ].includes(status);

  // 3. Asistensi Dinas Provinsi
  const step3Completed = [
    PengajuanStatus.VALIDATED_PROV,
    PengajuanStatus.SK_DITJENBUN_ISSUED,
    PengajuanStatus.PKS_BPDP_SIGNED,
    PengajuanStatus.DISBURSED,
    PengajuanStatus.COMPLETED
  ].includes(status);
  const step3Active = status === PengajuanStatus.REKOMTEK_KAB_ISSUED;

  // 4. Penerbitan Rekomtek Ditjenbun
  const step4Completed = [
    PengajuanStatus.SK_DITJENBUN_ISSUED,
    PengajuanStatus.PKS_BPDP_SIGNED,
    PengajuanStatus.DISBURSED,
    PengajuanStatus.COMPLETED
  ].includes(status);
  const step4Active = status === PengajuanStatus.VALIDATED_PROV;

  // 5. Penerbitan SK Dirut BPDP
  const step5Completed = [
    PengajuanStatus.PKS_BPDP_SIGNED,
    PengajuanStatus.DISBURSED,
    PengajuanStatus.COMPLETED
  ].includes(status);
  const step5Active = status === PengajuanStatus.SK_DITJENBUN_ISSUED;

  // Logika Tambahan untuk REJECTED
  const isRejected = status === PengajuanStatus.REJECTED;

  return [
    {
      id: 1,
      label: 'Submit Proposal',
      isCompleted: step1Completed && !step1Warning,
      isActive: false,
      isWarning: step1Warning
    },
    {
      id: 2,
      label: 'Verifikasi Dinas Kab/Kota',
      isCompleted: step2Completed,
      isActive: step2Active && !isRejected,
      isError: isRejected && !step2Completed && !step1Warning // Jika ditolak di tahap ini
    },
    {
      id: 3,
      label: 'Asistensi Dinas Provinsi',
      isCompleted: step3Completed,
      isActive: step3Active && !isRejected,
      isError: isRejected && step2Completed && !step3Completed
    },
    {
      id: 4,
      label: 'Penerbitan Rekomtek Ditjenbun',
      isCompleted: step4Completed,
      isActive: step4Active && !isRejected,
      isError: isRejected && step3Completed && !step4Completed
    },
    {
      id: 5,
      label: 'Penerbitan SK Dirut BPDP',
      isCompleted: step5Completed,
      isActive: step5Active && !isRejected,
      isError: isRejected && step4Completed && !step5Completed
    }
  ];
});
```
