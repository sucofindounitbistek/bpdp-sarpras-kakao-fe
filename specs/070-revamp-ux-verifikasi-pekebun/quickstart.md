# Quickstart: Menguji Revamp UX Halaman Verifikasi Pekebun

1. Buka browser dan arahkan ke halaman verifikasi usulan Kabupaten:
   `http://localhost:5173/dinas/verifikasi/kabupaten/:proposalId`
2. Pada Step 1 (Data CPCL & Dokumen), klik tombol "Periksa" pada salah satu pekebun:
   `http://localhost:5173/dinas/verifikasi/kabupaten/:proposalId/pekebun/:cpclId`
3. Amati tampilan baru:
   - **Header**: Menampilkan ringkasan profil pekebun dan progress bar verifikasi.
   - **Kolom Kiri**: Daftar berkas terorganisir rapi dan Document Viewer dengan pratinjau langsung.
   - **Kolom Kanan**: Checklist kesesuaian data input vs dokumen.
   - **Accordion Bawah**: Klik "Detail Profil Lengkap & Peta Poligon Lahan" untuk membuka rincian tanpa mengganggu form atas.
   - **Sticky Footer**: Memantau ringkasan dokumen dan mencoba tombol "Lanjut ke Pekebun Berikutnya".
