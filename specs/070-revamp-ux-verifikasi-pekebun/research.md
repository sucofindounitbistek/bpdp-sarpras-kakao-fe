# Research: Revamp UX Halaman Verifikasi Pekebun

## 1. Masalah Desain Eksisting

### Masalah 1: Alur Navigasi Terfragmentasi (*Fragmented Hierarchy*)
Saat ini di `VerifikasiPekebunDetailView.vue`:
1. Dokumen Identitas Pekebun ditampilkan dalam grid 4 kolom.
2. Dokumen Lahan ditampilkan dalam box abu-abu terpisah di bawahnya.
3. Mengklik salah satu dokumen memicu card verifikasi yang muncul di bawah kedua section tersebut.
4. Di bawah card verifikasi, terdapat tabel data identitas pekebun yang sangat panjang, diikuti tabel data lahan, dan peta satelit.
5. Verifikator harus menggulir berkali-kali ke atas untuk mengganti dokumen, lalu ke tengah untuk memeriksa, lalu ke bawah untuk memeriksa alamat/koordinat.

### Masalah 2: Tidak Ada Indikator Progres (*No Clear Progress Overview*)
- Hanya ada dot bulat kecil berukuran `w-2 h-2` pada kartu dokumen.
- Verifikator tidak bisa mengetahui secara instan berapa dokumen yang sudah selesai atau apakah masih ada dokumen tertinggal.

### Masalah 3: Ketiadaan Sticky Action Bar
- Tombol kembali hanya ada di pojok kiri atas berupa icon kecil (`ArrowLeft`).
- Setelah selesai memverifikasi dokumen di tengah atau bawah layar, verifikator harus scroll kembali ke paling atas untuk keluar.
- Tidak ada shortcut untuk memeriksa pekebun berikutnya dalam proposal yang sama.

## 2. Solusi Desain UI/UX (Best Practices Workbench)

### Split Workbench 2 Kolom (`lg:grid-cols-12`):
- **Kolom Kiri (`lg:col-span-5` atau `lg:col-span-6`)**:
  - Panel Pemilih Dokumen (Tabs / Segmented buttons) dengan status badge jelas:
    - Identitas (KTP, KK, Swafoto, Surat Kuasa)
    - Lahan (Legalitas, Surat Kades)
  - Card Document Viewer dengan aspect ratio ideal, tombol preview modal, dan status file (Ukuran, format).
- **Kolom Kanan (`lg:col-span-7` atau `lg:col-span-6`)**:
  - Focus Card: Form verifikasi data dokumen yang sedang aktif.
  - Nilai data input pemohon ditampilkan dengan kontras teks yang jelas (angka/huruf tebal, latar belakang abu-abu terang).
  - Tombol aksi `[✓ Sesuai]` dan `[✕ Tidak Sesuai]` dengan micro-interaction aktif.
  - Textarea catatan revisi muncul dengan transisi mulus jika Tidak Sesuai.
  - Tombol `[Lanjut ke Dokumen Berikutnya]` di footer card.

### Sticky Bottom Footer:
- Fixed di bagian bawah: `fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 shadow-lg`.
- Kiri: Counter ringkasan:
  - Total Dokumen Selesai: `X / Y`
  - Sesuai: `A`
  - Perlu Catatan: `B`
- Kanan:
  - Tombol "Kembali ke Usulan" (`variant: outline`)
  - Tombol "Lanjut ke Pekebun Berikutnya" (`variant: primary green`) yang otomatis mengarahkan ke ID pekebun berikutnya jika ada.
