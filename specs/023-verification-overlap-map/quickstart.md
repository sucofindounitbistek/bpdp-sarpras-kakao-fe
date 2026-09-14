# Quickstart: Peta Global Verifikasi & Deteksi Tumpang Tindih Lahan

**Feature**: 023-verification-overlap-map
**Date**: 2026-08-06

## Prerequisites

- Aplikasi berjalan (`npm run dev`)
- Login sebagai salah satu role verifikator: `DITJENBUN_VERIFIKATOR`, `BPDP_VERIFIKATOR`, `DINAS_KAB`, `DINAS_PROV`
- Ada minimal 2 proposal dengan data poligon lahan di sistem

## Validation Scenarios

### Scenario 1: Peta Global dengan Poligon Biru dan Merah (P1)

1. Login sebagai `DITJENBUN_VERIFIKATOR`
2. Buka halaman `/ditjenbun/rekomtek/ceki/:id` (detail proposal yang memiliki data poligon)
3. Buka section "Peta Global Verifikasi" (klik untuk expand)
4. **Expected**: Peta satelit muncul dengan:
   - Poligon biru untuk proposal yang sedang diverifikasi
   - Poligon merah untuk proposal lain dalam radius 50 km
   - Legend di pojok kanan bawah: "Proposal Sedang Diverifikasi" (biru) dan "Proposal Lain" (merah)
5. Klik poligon merah → **Expected**: Popup muncul dengan nomor proposal dan nama lembaga

### Scenario 2: Deteksi Tumpang Tindih (P2)

1. Pastikan ada proposal yang lahannya tumpang tindih dengan proposal aktif
2. Buka peta global
3. **Expected**: 
   - Area tumpang tindih terlihat secara visual (warna lebih gelap/gradasi)
   - Daftar "Tumpang Tindih Terdeteksi" muncul di bawah peta
   - Setiap entry menampilkan: nomor proposal, nama lembaga, luas irisan (Ha), persentase

### Scenario 3: Tidak Ada Data Poligon (Edge Case)

1. Buka proposal yang tidak memiliki data poligon lahan (koordinatPoligon kosong)
2. Buka section peta
3. **Expected**: Pesan "Proposal ini belum memiliki data poligon lahan" ditampilkan, peta tetap menampilkan area default Indonesia

### Scenario 4: Mobile Responsiveness

1. Buka halaman verifikasi di Chrome DevTools dengan viewport 375px
2. Expand section peta
3. **Expected**: Peta tidak overflow horizontal, dapat di-zoom dengan pinch gesture, legend tetap terbaca

### Scenario 5: Konsistensi Antar Halaman (P3)

1. Ulangi Scenario 1-2 di semua halaman:
   - `/ditjenbun/rekomtek/ceki/:id` (CekiDitjenbunView)
   - `/bpdp/ceki/:id` (CekiBpdpView)
   - Halaman verifikasi Dinas Kab/Kota
   - Halaman verifikasi Dinas Provinsi
2. **Expected**: Tampilan dan perilaku peta identik di semua halaman

### Scenario 6: Dark Mode

1. Aktifkan dark mode dari toggle tema
2. Buka section peta
3. **Expected**: Legend, overlap list, dan section card mendukung tema gelap; peta satelit tetap terlihat jelas

## Verification Commands

```bash
# Install new dependency (turf.js for overlap detection)
npm install @turf/turf

# Type check
npx vue-tsc -b --noEmit

# Build check
npm run build

# Dev server (manual verification)
npm run dev
```