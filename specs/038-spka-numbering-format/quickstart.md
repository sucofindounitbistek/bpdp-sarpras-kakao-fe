# Quickstart Validation Guide: SPKA Numbering Format

## Validation Scenarios

### Scenario 1: Generate SPKA Number for Ekstensifikasi (Code 1) in June 2026

- **Input**: Package = `Ekstensifikasi`, Month = `June 2026`, Sequence = `1`
- **Expected Outcome**: Nomor Usulan generated = `SPKA106260001`

### Scenario 2: Generate SPKA Number for Unit Pengolahan Hasil (Code 4)

- **Input**: Package = `UPH`, Month = `August 2026`, Sequence = `15`
- **Expected Outcome**: Nomor Usulan generated = `SPKA408260015`

### Scenario 3: Monthly Reset Verification

- **Input**: Proposal dibuat pada 1 Juli 2026 setelah bulan Juni berakhir.
- **Expected Outcome**: Urutan direset ke `0001` (`SPKA107260001`).

## Verification Steps

1. Jalankan `npm run test` atau periksa fungsi utility penomoran SPKA.
2. Buat proposal pengusulan baru untuk jenis paket yang dipilih.
3. Pastikan `nomorUsulan` yang tersimpan dan ditampilkan pada halaman tracking, ringkasan, dan cetak PDF mengikuti pola `SPKA` + `[1-9]` + `[MM]` + `[YY]` + `[0001]`.
