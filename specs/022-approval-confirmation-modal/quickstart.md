# Quickstart: Modal Konfirmasi Pengiriman Approval

**Feature**: 022-approval-confirmation-modal
**Date**: 2026-08-06

## Prerequisites

- Aplikasi berjalan (`npm run dev`)
- Login sebagai salah satu role approver: `DITJENBUN_APPROVAL`, `BPDP_APPROVAL`, `DINAS_KAB`, `DINAS_PROV`

## Validation Scenarios

### Scenario 1: Konfirmasi Setujui (P1)

1. Login sebagai `DITJENBUN_APPROVAL`
2. Buka halaman `/ditjenbun/rekomtek/:id` (detail proposal yang berstatus `APPROVAL_DITJENBUN`)
3. Pastikan semua dokumen sudah di-toggle `✓ Setuju`
4. Klik tombol "Setujui" di panel kanan
5. **Expected**: Modal konfirmasi muncul dengan:
   - Judul: "Konfirmasi Persetujuan"
   - Deskripsi: menampilkan tahap tujuan (mis. "BPDP Verifikator")
   - Tombol: "Ya, Setujui" (hijau) dan "Batal" (outline)
6. Klik "Batal" → **Expected**: Modal tertutup, tidak ada perubahan status
7. Klik "Setujui" lagi → modal muncul → klik "Ya, Setujui"
8. **Expected**: Modal tertutup, toast sukses muncul, redirect ke halaman antrean

### Scenario 2: Konfirmasi Tolak/Kembalikan (P2)

1. Login sebagai `BPDP_APPROVAL`
2. Buka halaman `/bpdp/approval/:id` (detail proposal berstatus `APPROVAL_BPDP`)
3. Toggle `✕ Tolak` pada dokumen, isi catatan penolakan
4. Klik tombol "Kembalikan" di panel kanan
5. **Expected**: Modal konfirmasi muncul dengan:
   - Judul: "Konfirmasi Pengembalian"
   - Deskripsi: menampilkan tahap tujuan pengembalian
   - Catatan penolakan ditampilkan
   - Tombol: "Ya, Kembalikan" (merah) dan "Batal" (outline)
6. Klik "Ya, Kembalikan" → **Expected**: Proposal dikembalikan, toast warning sukses

### Scenario 3: Double-Submission Prevention (Edge Case)

1. Buka modal konfirmasi (Scenario 1 step 4-5)
2. Klik "Ya, Setujui" dua kali dengan cepat
3. **Expected**: Tombol menjadi disabled + spinner setelah klik pertama, klik kedua diabaikan

### Scenario 4: Mobile Responsiveness

1. Buka halaman approval di Chrome DevTools dengan viewport 375px
2. Trigger modal konfirmasi
3. **Expected**: Modal tidak overflow horizontal, tombol touch-friendly (min 44x44px), teks terbaca

### Scenario 5: Konsistensi Antar Halaman

1. Ulangi Scenario 1 dan 2 di semua halaman:
   - `/ditjenbun/rekomtek/:id` (ApprovalDitjenbunView)
   - `/bpdp/approval/:id` (ApprovalBpdpView)
   - `/bpdp/ceki/:id` (CekiBpdpView)
   - `/ditjenbun/rekomtek/ceki/:id` (CekiDitjenbunView)
2. **Expected**: Desain, wording, dan perilaku modal identik di semua halaman

### Scenario 6: Dark Mode

1. Aktifkan dark mode dari toggle tema
2. Trigger modal konfirmasi
3. **Expected**: Modal mendukung tema gelap: background dark, teks kontras, tombol tetap terlihat

## Verification Commands

```bash
# Type check
npm run typecheck

# Build check
npm run build

# Dev server (manual verification)
npm run dev
```