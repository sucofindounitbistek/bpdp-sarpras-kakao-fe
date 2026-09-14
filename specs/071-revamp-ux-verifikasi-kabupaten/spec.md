# Feature Specification: Revamp UX Halaman Verifikasi Proposal Kabupaten

**Feature Branch**: `071-revamp-ux-verifikasi-kabupaten`
**Created**: 2026-09-03
**Status**: Specified & Ready for Clarification / Planning
**Input**: User request: "[BPDP | Sarpras Kelapa](http://localhost:5173/dinas/verifikasi/kabupaten/545) pada halaman ini sepertinya uxnya juga harus diperbaiki untuk pengelompokkannya seperti batas2nya itu dibuat accordion aja kali ya dan diseragamkan, butuh referensi dari /frontend-design dan /ui-ux-pro-max, tolong dikerjakan ya /speckit-specify"

---

## Clarifications

### Session 2026-09-03
- Q: State awal accordion (default expanded) → A: Opsi A (Buka modul CPCL & Berkas Proposal secara default; tutup Peta Spasial, Gudang, dan RAB agar rendering ringan dan hemat ruang).
- Q: Perilaku buka-tutup accordion (Multi vs Single Expand) → A: Opsi A (Multi-Expand: pengguna bebas membuka beberapa modul sekaligus secara independen).
- Q: Format indikator status pada header accordion → A: Opsi A (Detail Tally: menampilkan badge status + jumlah item reaktif, e.g. `X Sesuai`, `Y Catatan`, `Z Belum Dicek`).


Halaman verifikasi proposal tingkat kabupaten (`/dinas/verifikasi/kabupaten/:id`) merupakan pusat kendali verifikasi kelayakan usulan sarpras kelapa sebelum usulan diterbitkan SK CPCL dan diajukan ke tingkat provinsi.

### Masalah UX Saat Ini:
1. **Vertical Wall of Content**: Seluruh komponen penting (Peta Spasial Overlap, Tabel CPCL, Tabel Berkas Proposal, Pemeriksaan Gudang, Stepper & Tabel RAB) disusun membentang secara vertikal dalam satu halaman panjang tanpa hirarki visual yang jelas.
2. **Inkonsistensi Batas & Separator**: Pembatas antar-bagian tidak seragam (sebagian menggunakan divider garis tipis horizontal, sebagian menggunakan kartu abu-abu, sebagian tabel terbuka), menimbulkan kelelahan visual (*cognitive overload*).
3. **Status Keseluruhan Sulit Dipantau**: Pengguna harus menggulir berulang kali dari atas ke bawah untuk mengetahui bagian mana yang masih pending, bagian mana yang memiliki penolakan/catatan, dan bagian mana yang telah selesai diverifikasi.

### Solusi Desain (/frontend-design & /ui-ux-pro-max):
1. **Unified Accordion Modular System**:
   - Mengelompokkan 5 pilar verifikasi utama ke dalam sistem Accordion Card yang seragam, elegan, dan terstruktur:
     - **Modul 1: Peta Spasial & Analisis Poligon Lahan** (`VerificationOverlapMap`)
     - **Modul 2: Verifikasi Calon Pekebun & Lahan (CPCL)** (Daftar anggota, unggah foto udara, tombol menuju workbench detail pekebun)
     - **Modul 3: Verifikasi Berkas Proposal & Kelembagaan** (Kelengkapan berkas wajib, persetujuan cepat *Approve All*, verifikasi berkas per item)
     - **Modul 4: Pemeriksaan Gudang Serah Terima** (Khusus paket pupuk / usulan dengan gudang serah terima: alamat, koordinat, foto fisik)
     - **Modul 5: Verifikasi & Rekonsiliasi Rencana Anggaran Biaya (RAB)** (4-step stepper penyelarasan, unduh CSV, unggah berkas bertandatangan, tabel RAB interaktif)
2. **Standardized Accordion Header**:
   - Setiap panel accordion memiliki anatomi yang seragam:
     - **Left**: Icon tematik dengan badge kontainer halus, Judul modul yang tegas (*bold 13px/14px*), dan deskripsi fungsi singkat.
     - **Right**: Badge status interaktif real-time (contoh: `Semua Sesuai`, `X Perlu Perbaikan`, `Y Belum Dicek`, atau `N Pekebun Terdaftar`), tombol aksi cepat jika ada, dan panah Chevron animasi halus.
3. **Tally & Quick Controls Header**:
   - Di bagian atas daftar accordion disediakan bilah kontrol ringkas:
     - Tally pill ringkasan progres verifikasi menyeluruh (Berapa modul selesai vs butuh perhatian).
     - Tombol pintar: **"Buka Semua"** / **"Tutup Semua"** (*Expand All / Collapse All*).
4. **Visual Polish & Hierarchy**:
   - Menerapkan palet warna BPDP Kelapa (Emerald `#066C2A`, Slate neutral `#0f172a`, Rose `#e11d48` untuk revisi).
   - Card border `border-slate-200/80` dengan bayangan halus `shadow-xs hover:shadow-sm`.

---

## 2. User Scenarios & Acceptance Criteria *(Mandatory)*

### User Story 1 - Pengelompokan Modul Verifikasi dengan Accordion Seragam (Priority: P1)

Sebagai Verifikator Dinas Kabupaten, saya ingin halaman verifikasi usulan dikelompokkan secara terstruktur menggunakan modul kartu lipat (*accordion*) yang konsisten, sehingga saya dapat fokus memeriksa satu bagian tanpa terdistraksi oleh tumpukan tabel dan peta yang sangat panjang.

**Why this priority**:
Merupakan inti permintaan pengguna untuk merapikan antarmuka dan menghilangkan beban visual yang berantakan.

**Independent Test**:
Buka halaman `/dinas/verifikasi/kabupaten/:id`, pastikan kelima bagian utama disajikan dalam accordion yang dapat dibuka/tutup dengan transisi halus dan desain seragam.

**Acceptance Scenarios**:
1. **Given** Verifikator membuka halaman detail verifikasi kabupaten, **When** halaman selesai dimuat, **Then** sistem menyajikan bagian verifikasi dalam 5 blok accordion dengan format header, border, dan padding yang seragam.
2. **Given** Verifikator mengklik header salah satu accordion, **When** modul di-toggle, **Then** konten modul terbuka/tertutup dengan animasi transisi yang mulus dan ikon chevron berputar secara presisi.
3. **Given** Usulan tidak memiliki data gudang serah terima dan bukan paket pupuk, **When** halaman dirender, **Then** accordion Modul Gudang disembunyikan secara otomatis (*conditional rendering*).

---

### User Story 2 - Status Visual Reaktif pada Header Accordion (Priority: P2)

Sebagai Verifikator Dinas Kabupaten, saya ingin setiap header accordion menampilkan indikator status verifikasi (misal: Selesai, Ada Catatan, Belum Lengkap) secara langsung tanpa harus membuka modul tersebut, sehingga saya dapat memprioritaskan bagian mana yang perlu diperiksa lebih dulu.

**Why this priority**:
Memungkinkan navigasi efisien (*at-a-glance status recognition*) sehingga verifikator tidak perlu membuka semua accordion untuk mencari berkas yang tertinggal atau ditolak.

**Independent Test**:
Ubah status verifikasi di dalam modul (misal menolak salah satu dokumen proposal atau menyetujui seluruh pekebun), verifikasi apakah badge di header accordion berubah secara instan.

**Acceptance Scenarios**:
1. **Given** Seluruh dokumen persyaratan pada Modul 3 telah disetujui, **When** melihat header accordion Berkas Proposal, **Then** tampil badge hijau "Semua Sesuai" dengan icon centang.
2. **Given** Terdapat minimal 1 dokumen atau data yang ditandai tidak sesuai/ditolak, **When** melihat header accordion terkait, **Then** tampil badge merah "Perlu Catatan/Revisi" dengan jumlah item yang ditolak.
3. **Given** Masih ada item yang belum diverifikasi, **When** melihat header accordion, **Then** tampil badge netral/kuning yang mencantumkan jumlah item belum diverifikasi.

---

### User Story 3 - Fitur Kontrol "Buka Semua / Tutup Semua" & Ringkasan Global (Priority: P3)

Sebagai Verifikator Dinas Kabupaten, saya ingin memiliki tombol pintasan untuk membuka atau menutup seluruh accordion sekaligus serta melihat ringkasan status global di atas daftar modul, sehingga saya dapat bekerja sesuai gaya kerja yang fleksibel (mode ringkas vs mode telaah penuh).

**Why this priority**:
Menghilangkan friksi bagi verifikator yang ingin melihat seluruh data sekaligus untuk mencetak atau meninjau cepat.

**Independent Test**:
Tekan tombol "Buka Semua", pastikan seluruh accordion terbuka; tekan tombol "Tutup Semua", pastikan seluruh accordion terlipat rapi.

**Acceptance Scenarios**:
1. **Given** Beberapa accordion dalam kondisi tertutup, **When** Verifikator mengklik "Buka Semua", **Then** seluruh accordion yang aktif terbuka secara serentak.
2. **Given** Seluruh accordion dalam kondisi terbuka, **When** Verifikator mengklik "Tutup Semua", **Then** seluruh accordion terlipat dan hanya menyisakan header ringkasan.

---

## 3. Functional Requirements

- **FR-01**: Antarmuka `StepVerifikasiPekebunDanDokumenProposal.vue` harus membagi konten ke dalam modul accordion terstandarisasi.
- **FR-02**: Masing-masing accordion harus memiliki:
  - Container: `border border-slate-200/80 rounded-2xl bg-white shadow-xs overflow-hidden`
  - Header Button: Padding `px-5 py-4`, ikon tematik 20px dalam badge bulat/squircle, judul 13px bold, subtitle 11px slate-500, status badge reaktif, dan chevron indicator.
- **FR-03**: State keterbukaan accordion dapat diatur independen per modul (default: Peta tertutup untuk hemat memori/render, CPCL & Dokumen Proposal terbuka untuk kemudahan verifikasi langsung).
- **FR-04**: Header ringkasan di atas accordion harus menyajikan tombol toggle global `Buka Semua / Tutup Semua` dan counter kelengkapan verifikasi.
- **FR-05**: Konsistensi penamaan dan gaya tabel/komponen di dalam accordion diselaraskan dengan standar token Tailwind di `bpdp-sarpras-kelapa-fe`.

---

## 4. Success Criteria

- **SC-01**: Tinggi total halaman dalam kondisi default (accordion ringkas) berkurang setidaknya 60% dibandingkan halaman tumpuk sebelumnya, secara signifikan memangkas scroll vertikal.
- **SC-02**: Verifikator dapat mengenali status kelayakan seluruh 5 modul verifikasi dalam waktu kurang dari 3 detik melalui badge status di header accordion.
- **SC-03**: Beban rendering peta poligon Leaflet berkurang karena peta dimuat di dalam accordion yang tertutup secara default dan hanya dirender saat dibuka.
- **SC-04**: Build frontend (`npm run build`) dan type-checking (`npx vue-tsc -b`) berhasil 100% tanpa galat kompilasi atau regresi fungsional.
