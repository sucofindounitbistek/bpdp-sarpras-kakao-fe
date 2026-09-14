# Quickstart & Validation Guide: 1:1 Rekomendasi Teknis (Rekomtek) Ditjenbun

**Feature Directory**: `specs/083-generate-rekomtek-ditjenbun/`  
**Date**: 2026-09-12  

---

## 1. Runnable Validation Scenarios

### Scenario 1: Generate & Pratinjau Draf Rekomtek 1:1
1. Buka browser pada URL: `http://localhost:5173/ditjenbun/ceki/1` (atau usulan aktif yang berstatus Ditjenbun).
2. Scroll ke panel kanan Card *"Penerbitan Rekomtek"*.
3. Perhatikan langkah 2 *"Unduh & Tanda Tangan"*:
   - Klik tombol **"Pratinjau Draf Rekomtek"** (atau ikon Mata).
4. **Verifikasi**:
   - Modal viewer `RekomtekPreviewModal` muncul menampilkan 3 halaman dokumen A4 berurutan.
   - Halaman 1: Memiliki Kop Resmi Kementan, logo Kementan tajam, Nomor surat terisi (atau draf), Tabel 8 Poin terisi nama kelembagaan, luas areal, jumlah KK, rincian bantuan.
   - Halaman 2: Klausul harga satuan butir 7, paragraf penutup, blok TTE BSrE Plt. Dirjenbun, daftar tembusan 6 pihak.
   - Halaman 3: Lampiran SK CPCL & BA Verifikasi beserta blok paraf Ditjenbun.

### Scenario 2: Sinkronisasi Input Nomor Rekomtek (Opsi 1)
1. Pada input *"3. Nomor Rekomendasi Teknis"*, ketikkan nomor agenda resmi: `124/PI.400/E/08/2026`.
2. Klik kembali tombol **"Pratinjau"**.
3. **Verifikasi**:
   - Nomor pada Halaman 1 dan Halaman 3 Lampiran langsung berubah menjadi `124/PI.400/E/08/2026`.

### Scenario 3: Download Langsung Berkas Draf PDF
1. Klik tombol **"Download Draf Rekomtek"**.
2. **Verifikasi**:
   - Dialog print/PDF browser otomatis terbuka dengan pratinjau 3 halaman tepat A4, tanpa overflow, siap disimpan sebagai `Draf_Rekomtek_[NOMOR_PROPOSAL].pdf`.
   - Waktu respons pembentukan dokumen < 1 detik.

---

## 2. Automated Test Commands
```bash
# Menjalankan unit test generator dokumen
npm run test -- src/utils/rekomtekPdfGenerator.test.ts

# Memastikan tidak ada error TypeScript
npm run build
```
