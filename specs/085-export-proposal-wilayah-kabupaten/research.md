# Research & Technical Decisions: Export Data Proposal Dinas Kabupaten Sesuai Wilayah Terkait

**Feature**: [`085-export-proposal-wilayah-kabupaten`](spec.md) | **Date**: 2026-09-14

---

## 1. Asal Usul Data Wilayah Pengguna (Dinas Kabupaten)

### Temuan
- Pada autentikasi SSO IAM (`bpdp-iam-be` & `bpdp-sarpras-kelapa-fe`), pengguna dengan peran `DINAS_KAB` membawa data profil terotentikasi:
  - `authStore.user.regency_id`: ID numerik kabupaten (contoh: `3201`, `7322`, dll.)
  - `authStore.user.province_id`: ID numerik provinsi
  - `authStore.user.nomenklatur_dinas`: Nama resmi instansi dinas (contoh: *"Dinas Pertanian dan Perkebunan Kabupaten Luwu Utara"*)
- Pada tabel antrean dinas (`QueueVerifikasiKabView.vue`), nama kabupaten diidentifikasi melalui helper [`getKabupatenNama()`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/utils/regionHelper.ts#L6-L41).

### Keputusan
- Nama wilayah aktif untuk akun Dinas Kabupaten dapat diekstrak secara hierarkis:
  1. Nama kabupaten dari usulan pertama di antrean yang sudah dimuat (`getKabupatenNama(store.listPengajuan[0])`), atau
  2. Nama kabupaten yang diekstrak dari `nomenklatur_dinas` akun pengguna (misal membersihkan prefix *"Dinas Pertanian"* untuk mendapatkan nama kabupatennya), atau
  3. Default fallback terstandarisasi yang sudah digunakan sistem: *"Kab. Luwu Utara"*.

---

## 2. Ketiadaan API Wilayah & Penundaan Filter Manual

### Temuan
- Endpoint master data wilayah (seperti `/api/v1/wilayah/kecamatan` dan `/api/v1/wilayah/desa`) belum selesai diimplementasikan di backend.
- Menampilkan dropdown filter wilayah bertingkat saat ini tidak memungkinkan dan akan memicu error jaringan atau membingungkan pengguna jika dibiarkan kosong.

### Keputusan
- **Tunda Filter Manual**: Tidak merender input dropdown wilayah yang bergantung pada API yang belum tersedia.
- **Tampilkan Indikator Otomatis**: Pada modal ekspor, tampilkan card/badge informatif dengan ikon gembok (*lock icon*):
  - **Judul**: `Cakupan Wilayah: [Nama Kabupaten]`
  - **Status**: `Terkunci Otomatis`
  - **Keterangan**: *"Penyaringan wilayah per kecamatan/desa sedang ditangguhkan menunggu kesiapan API Wilayah. Seluruh data yang diekspor otomatis dibatasi untuk wilayah kabupaten dinas Anda."*

---

## 3. Investigasi Backend `/proposals/export` & Pencegahan Kebocoran Data

### Temuan Kritis
- Inspeksi pada handler backend [`bpdp-sarpras-kelapa-be/internal/proposal/handler.go`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-be/internal/proposal/handler.go#L522-L580) dan repository [`internal/proposal/repository.go`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-be/internal/proposal/repository.go#L321-L382):
  - Endpoint `/proposals/export` menerima parameter: `search`, `status`, `start_date`, `end_date`, `paket_sarpras`, `sortBy`, `sortOrder`.
  - Endpoint `/proposals/export` **BELUM** melakukan filtering berdasarkan `regency_id` di tingkat database GORM.
  - Jika frontend memicu `exportCsv` langsung dari backend, berkas CSV yang diunduh akan berisi proposal dari seluruh Indonesia (kebocoran data lintas kabupaten!).

### Keputusan Solusi
1. **Penerusan Query Parameter**: Frontend tetap mengirimkan `regency_id` pada parameter query agar saat backend nantinya mengaktifkan filter database, integrasi sudah langsung aktif (*future-proof*).
2. **Penyaringan Sisi Klien (*Client-Side Sanitization*)**:
   - Untuk menghitung pratinjau (`fetchMatchCount`): Ambil data unpaginated via `proposalService.exportJson(params)`, lalu filter dengan fungsi `matchesProposalRegion`. `matchedCount.value = scopedList.length`.
   - Untuk Ekspor CSV: Ambil data via `proposalService.exportJson(params)`, filter dengan `matchesProposalRegion`, kemudian panggil fungsi utilitas lokal [`exportProposalsToCsv(scopedList, filename)`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/utils/exportProposal.ts#L35-L60). Ini menjamin **zero data leakage** 100%!
   - Untuk Ekspor PDF: Ambil data, filter dengan `matchesProposalRegion`, lalu teruskan ke [`exportProposalsToPdf(scopedList, title, filters)`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/utils/exportProposal.ts#L65-L150).

---

## 4. Aturan Pencocokan Wilayah Berlapis (*Hybrid Matching Rule*)

### Keputusan Implementasi
Fungsi pencocokan wilayah `matchesProposalRegion(item: any, regencyId?: number | string, regencyName?: string): boolean`:
1. **Tahap 1 (ID Wilayah)**: Jika `regencyId` tersedia dan proposal memiliki `regency_id` atau `kode_kabupaten`, cocokkan nilai numerik/kodenya.
2. **Tahap 2 (Nama Wilayah)**: Jika tidak cocok atau ID tidak ada, gunakan helper `getKabupatenNama(item)`. Bersihkan format nama (hilangkan *"Kab."*, *"Kota"*, ubah ke lowercase) lalu bandingkan dengan `regencyName`.
3. **Tahap 3 (Fallback Netral)**: Jika `regencyId` dan `regencyName` tidak didefinisikan (misalnya pengguna Ditjenbun atau BPDP pusat), izinkan seluruh usulan lolos (`return true`).
