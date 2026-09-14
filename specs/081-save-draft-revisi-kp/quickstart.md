# Quickstart Validation: Simpan Sebagai Draft pada Revisi Proposal (Role KP)

## 1. Prerequisites
- Backend service berjalan di port 8080 (`go run ./cmd/api/main.go`).
- Frontend service berjalan di port 5173 (`npm run dev`).
- Akun pengguna role Kelembagaan Pekebun (KP) memiliki proposal berstatus revisi (misal `REV_FROM_KAB`).

## 2. Test Scenarios

### Skenario 1: Simpan Sebagian Perbaikan Sebagai Draf
1. Login sebagai Pemohon Kelembagaan Pekebun.
2. Masuk ke menu **Tracking Usulan** -> pilih proposal berstatus perbaikan -> klik **Perbaiki Proposal**.
3. Di tab **Pekebun & Lahan**, ubah salah satu nama atau alamat pekebun yang ditolak. Biarkan item penolakan lainnya belum lengkap.
4. Perhatikan tombol di bagian footer:
   - Tombol **"Kirim Ulang Revisi"** tetap dalam status *disabled* (karena belum semua selesai).
   - Tombol **"Simpan Draf"** dalam status *enabled*.
5. Klik tombol **"Simpan Draf"**:
   - Muncul loading spinner *"Menyimpan Draf..."*.
   - Muncul notifikasi toast hijau: *"Draf revisi berhasil disimpan"*.
   - Halaman **TIDAK berpindah**, pemohon tetap berada di formulir revisi.
   - Field yang baru saja diedit memiliki badge *"Telah Dikoreksi"*.
6. Refresh browser (F5):
   - Data koreksi yang tadi disimpan tetap muncul sebagai data terkini.
   - Status proposal di database dan header tetap berstatus perbaikan (tidak berubah jadi `SUBMITTED`).

### Skenario 2: Kirim Ulang Final Setelah Lengkap
1. Lengkapi sisa item penolakan verifikator hingga semua terselesaikan (`isAllRejectedResolved == true`).
2. Tombol **"Kirim Ulang Revisi"** kini aktif (*enabled*).
3. Klik tombol **"Kirim Ulang Revisi"**:
   - Status proposal beralih menjadi `SUBMITTED`.
   - Muncul toast berhasil dikirim ulang dan diarahkan kembali ke `/pengusulan/tracking`.
