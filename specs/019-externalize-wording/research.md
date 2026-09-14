# Research: Centralize Localization Wording

## Findings & Decisions

### 1. Localization File Architecture
Kami akan membuat file baru `src/config/localization.ts` yang mendefinisikan objek terjemahan dengan modifier `as const` agar bertipe ketat (strict readonly).
Ini menjamin bahwa Key kamus lokalisasi tidak bisa salah ketik saat dirujuk di tempat lain dalam proyek, dan compiler TypeScript akan langsung mendeteksi jika ada key yang tidak valid.

### 2. Backward Compatibility in types/pengusulan.ts
Terdapat pemetaan status dan sarpras bawaan yang dideklarasikan di `src/types/pengusulan.ts` (`PengajuanStatusLabel` & `JenisSarprasLabel`).
Alih-alih mendefinisikan ulang objek literal di file tipe tersebut, kita akan mengimpor `LOCALIZATION` dari `src/config/localization.ts` dan mereferensikan properti objek lokalisasi pusat secara langsung:
```typescript
import { LOCALIZATION } from '@/config/localization';

export const PengajuanStatusLabel: Record<PengajuanStatus, string> = LOCALIZATION.proposalStatus;
export const JenisSarprasLabel: Record<JenisSarpras, string> = LOCALIZATION.jenisSarpras;
```
Hal ini memastikan tidak ada perubahan API internal pada module mappers/utils yang bergantung pada helper `getStatusLabel` maupun `getJenisSarprasLabel`.

### 3. Stepper & Queue Page Integration
Komponen stepper (`TrackingPengusulanView.vue`) dan antrean kabupaten (`QueueVerifikasiKabView.vue`) memiliki teks hardcoded. Kita akan memodifikasi file tersebut untuk mengonsumsi data `LOCALIZATION` langsung pada computed state dan helper function-nya.
Jika sewaktu-waktu pengguna ingin melakukan wording edit, ia hanya perlu menyunting file `src/config/localization.ts`.
