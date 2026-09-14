# Quickstart Validation: Breadcrumb Role Removal & Menu-Only Navigation

## Validation Scenarios

### Scenario 1: Breadcrumb di Halaman Dashboard
1. Buka aplikasi dan masuk sebagai Pemohon/Dinas/BPDP.
2. Buka halaman utama (Dashboard).
3. Verifikasi breadcrumbs hanya menampilkan:
   `Beranda` (tanpa menu tambahan).

### Scenario 2: Breadcrumb di Halaman Daftar Antrean (Kabupaten/Kota)
1. Masuk sebagai peran `DINAS_KAB`.
2. Navigasi ke menu **Verifikasi & Rekomtek**.
3. Verifikasi breadcrumb menampilkan:
   `Beranda > Verifikasi & Rekomtek (Kab)` (tidak menampilkan `DINAS KABUPATEN / KOTA`).

### Scenario 3: Breadcrumb di Halaman Detail Usulan (Ditjenbun)
1. Masuk sebagai peran `DITJENBUN_VERIFIKATOR`.
2. Buka salah satu detail pengajuan dalam antrean.
3. Verifikasi breadcrumbs menampilkan:
   `Beranda > Asistensi Rekomtek > Detail Usulan` (tidak menampilkan `DITJENBUN (VERIFIKATOR)` atau `Ditjenbun Pusat`).
4. Klik tautan `Asistensi Rekomtek` pada breadcrumb.
5. Verifikasi sistem mengarahkan kembali ke daftar antrean rekomtek dengan benar.
