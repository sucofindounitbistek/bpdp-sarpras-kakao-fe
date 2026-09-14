# Quickstart Validation: Centralize Localization Wording

## Validation Scenarios

### Scenario 1: Ubah Wording Stepper Alur Pengusulan
1. Buka file `src/config/localization.ts` dan ubah teks pada `workflowSteps.submitPemohon` dari `'Submit Proposal'` menjadi `'Pengajuan Awal Proposal'`.
2. Jalankan aplikasi frontend locally.
3. Masuk sebagai Pemohon dan buka halaman pelacakan proposal.
4. Verifikasi bahwa lingkaran tahapan pertama sekarang bertuliskan `'Pengajuan Awal Proposal'`.
5. Kembalikan nilainya ke `'Submit Proposal'` dan pastikan teks kembali berubah.

### Scenario 2: Ubah Wording Status Verifikasi Kabupaten/Kota
1. Buka file `src/config/localization.ts` dan ubah teks `kabQueueStatus.submitted` dari `'Menunggu Verifikasi'` menjadi `'Proposal Masuk'`.
2. Masuk sebagai peran `DINAS_KAB` dan buka halaman Antrean Verifikasi.
3. Verifikasi status proposal yang berstatus `SUBMITTED` sekarang berlabel `'Proposal Masuk'`.
4. Kembalikan nilai ke `'Menunggu Verifikasi'` dan pastikan label status kembali normal.
