# Technical Research & Decisions: Verifikasi Rekomtek & SK Dirut

## Phase 0 Research Findings

### Decision 1: Backend-Driven PDF Generation for Rekomtek & SK Dirut
* **Decision**: Dokumen Rekomtek, Kelayakan Rekomtek, dan SK Dirut di-generate penuh secara dinamis oleh backend dalam format PDF. Frontend hanya mengirim request trigger generate, menerima URL berkas, dan menampilkannya sebagai tautan unduh/preview.
* **Rationale**: Dokumen resmi program Sarpras memerlukan tata letak, kop surat, dan informasi dinamis (nama kelompok tani, alamat, koordinat lahan, alokasi dana) yang sangat presisi dan terstandardisasi. Melakukan rendering PDF di sisi client (frontend) menggunakan library JS rentan terhadap inkonsistensi antar-browser, kinerja perangkat, dan meningkatkan ukuran bundle aplikasi secara signifikan.
* **Alternatives Considered**: 
  * *HTML-to-PDF Client-Side (jsPDF / pdfmake)*: Ditolak karena inkonsistensi rendering, kesulitan pemeliharaan template kop surat, dan overhead beban komputasi client.
  * *Download Statis Template Word & Isi Manual*: Ditolak karena melanggar otomasi sistem dan memperbesar risiko manipulasi dokumen di luar sistem sebelum diunggah kembali.

### Decision 2: Dropdown Pilihan Tujuan Pengembalian (Dinas Kabupaten / Dinas Provinsi)
* **Decision**: Pada modal perintah perbaikan usulan, verifikator Ditjenbun memilih dinas penerima (Dinas Kabupaten/Kota atau Dinas Provinsi) via dropdown input, disandingkan dengan satu textarea deskripsi detail perbaikan.
* **Rationale**: Sesuai diagram alur, perintah perbaikan dapat diarahkan ke tingkat dinas kabupaten atau dinas provinsi secara dinamis tergantung letak ketidaksesuaian dokumen. Desain dengan dropdown mempermudah pembacaan antarmuka dibanding memiliki tombol aksi terpisah untuk setiap tujuan pengembalian, menjaga kekompakan UI, dan mempermudah penambahan tingkatan dinas di kemudian hari jika diperlukan.
* **Alternatives Considered**:
  * *Tombol Aksi Terpisah (Button-Based)*: Ditolak karena mengacaukan keselarasan desain visual modal dan tidak ramah bagi perangkat layar kecil (mobile viewports).

### Decision 3: Pilihan Bentuk Bantuan (Uang / Barang) Tingkat Usulan (Proposal-Level)
* **Decision**: Pilihan bentuk bantuan (uang/barang) dikunci pada tingkat usulan secara keseluruhan, bukan per item paket bantuan.
* **Rationale**: Mempermudah integrasi model data dengan sistem IAM/Penyaluran yang sudah ada, menyederhanakan validasi formulir di frontend, dan mencerminkan keputusan operasional program Sarpras Kakao di mana satu usulan kelompok tani dikategorikan sebagai satu bentuk skema penyaluran (hibah uang transfer bank atau hibah fisik barang).
* **Alternatives Considered**:
  * *Item-Level Multi-Bantuan*: Ditolak karena kompleksitas state management Pinia dan skema DTO database yang terlalu rumit tanpa kebutuhan bisnis yang mendesak (YAGNI).

### Decision 4: Generate Kelayakan Rekomtek Berbasis Checklist Terintegrasi di UI
* **Decision**: Dokumen kelayakan rekomtek di-generate otomatis oleh sistem (format PDF dari backend) setelah verifikator BPDP menyelesaikan form checklist kesesuaian dokumen di UI.
* **Rationale**: Mencegah kelalaian administrasi staf BPDP, menjamin standardisasi laporan kelayakan usulan, dan mempercepat audit internal karena data isian checklist tersimpan secara terstruktur di database.
* **Alternatives Considered**:
  * *Unggah Manual PDF Offline*: Ditolak karena menyulitkan pelacakan audit terperinci mengenai item dokumen mana yang dinilai tidak layak oleh staf verifikator.

### Decision 5: Pemisahan Peran Fungsional & Otorisasi Navigasi Guard
* **Decision**: Peran Ditjenbun & BPDPKS dipecah menjadi empat peran terpisah: `DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, dan `BPDP_APPROVAL`. Pembatasan akses dilakukan di tingkat rute (navigation guard) dan filter antrean tab (dashboard).
* **Rationale**: Menjamin kepatuhan proses pengawasan (*segregation of duties*). Verifikator tidak diperbolehkan menyetujui rekomtek/kelayakan buatannya sendiri, dan pejabat penentu persetujuan (Ketua Tim / Kadiv) dibatasi dari pengubahan data lapangan dan checklist mentah. Menyembunyikan tab antrean yang tidak relevan mengurangi kompleksitas visual (*cognitive load*) pada pengguna.
* **Alternatives Considered**:
  * *Satu Peran dengan Pembedaan Halaman*: Ditolak karena meningkatkan risiko *privilege escalation* jika pengguna memodifikasi URL secara manual, dan mempersulit pemisahan menu Sidebar.
