# Research & Technical Decisions: Perbaikan Form Edit Paket Sarpras & Dokumen Wajib/Opsional

**Feature**: `082-fix-edit-paket-sarpras`  
**Date**: 2026-09-12  
**Status**: Completed  

---

## 1. Research Topics & Technical Decisions

### 1.1 Akar Masalah Nilai Kosong pada Form Modal Edit & Peniadaan "Label Singkat"
- **Investigation**:
  Pada respons API `GET /api/v1/master/paket-sarpras`, entitas paket sarpras memiliki atribut `name: ""` dan `label: "Ekstensifikasi (Benih, Pupuk, Pestisida)"`.
  Di form edit lama, input `Nama Paket` membaca `paket.name` (sehingga kosong) dan input `Label Singkat` membaca `paket.label`.
  Karena 90% paket memiliki nama dan label yang sama, keberadaan dua input ini membingungkan admin dan memicu validasi error palsu *"Nama paket wajib diisi"*.
- **Decision**:
  1. Hapus input "Label Singkat" dari template modal form edit (`PaketSarprasListView.vue`).
  2. Hanya sediakan satu input utama: **"Nama Paket"**, yang dihidrasi dengan fallback: `paketDetail.name?.trim() || paketDetail.label?.trim() || ''`.
  3. Saat submit, sistem otomatis menyelaraskan `label = name` sehingga database dan API backend tetap menerima kedua field secara konsisten.
  4. Validasi submit hanya mengecek `name.trim()`.
- **Rationale**: Menyederhanakan formulir (YAGNI & Anti-Redundansi Konstitusi FE Prinsip V), menghilangkan friksi pengguna, dan mencegah validasi error palsu.

---

### 1.2 Konfigurasi Status Sifat Dokumen (Wajib vs Opsional)
- **Investigation**:
  Tabel `master_dokumen_persyaratan` mendefinisikan katalog dokumen, sedangkan tabel `master_paket_dokumen` menghubungkan dokumen ke paket sarpras dan memiliki kolom `is_wajib BOOLEAN DEFAULT TRUE`.
  Namun di UI Dokumen Persyaratan (`DokumenPersyaratanListView.vue`), belum ada kontrol untuk menentukan apakah dokumen tersebut Wajib atau Opsional.
  Selain itu, di backend repository, saat mengaitkan dokumen ke paket, `is_wajib` di-hardcode `true`.
- **Decision**:
  1. **Di Master Dokumen Persyaratan (`/master-data/dokumen-persyaratan`)**:
     - Tambahkan pilihan radio/select pada form modal tambah/edit: **Wajib (Required)** vs **Opsional**.
     - Tampilkan badge status `WAJIB` (merah) atau `OPSIONAL` (abu-abu) pada tabel katalog dokumen.
     - Simpan properti `is_wajib` ke backend API.
  2. **Di Modal Paket Sarpras (`/master-data/paket-sarpras`)**:
     - Pada daftar checklist dokumen persyaratan, tampilkan badge `[WAJIB]` atau `[OPSIONAL]` di samping nama dokumen agar admin mengetahui sifat dokumen yang dicentang.
     - Saat disimpan, relasi dokumen paket otomatis mewarisi sifat `is_wajib` dari master katalog dokumen.
- **Rationale**: Mematuhi hasil klarifikasi Opsi B (Pewarisan terpusat dari Master Dokumen) sehingga admin tidak perlu mengatur ulang satu per satu per paket, menjaga konsistensi regulasi.

---

### 1.3 Konsistensi Tampilan Label & Validasi pada Alur Proposal Seluruh Role
- **Investigation**:
  Pada alur proposal (Pemohon pengusulan, verifikasi Dinas Kabupaten, Dinas Provinsi, dan Ditjenbun/BPDPKS), komponen pratinjau dan form unggah membaca properti `is_wajib` (atau `wajib`).
- **Decision**:
  1. **Tampilan**:
     - Dokumen dengan `is_wajib: true` menampilkan badge merah/rose: **Wajib**.
     - Dokumen dengan `is_wajib: false` menampilkan badge abu-abu/slate: **Opsional**.
  2. **Logika Validasi**:
     - Validasi form pengusulan dan tombol approval verifikator HANYA memeriksa kelengkapan dokumen bertanda `is_wajib: true`.
     - Dokumen dengan `is_wajib: false` tidak pernah memblokir pengajuan (*non-blocking*).
- **Rationale**: Memberikan kepastian transparansi bagi pemohon dan verifikator di seluruh tahapan tanpa menyebabkan proposal macet karena dokumen opsional.

---

### 1.4 Hydration Asinkron & Loading State
- **Investigation**:
  Data kartu pada list paket tidak selalu memuat detail persyaratan dokumen secara instan.
- **Decision**:
  Saat `openEditModal(paket)` dipanggil:
  - Buka modal seketika dengan data awal kartu agar tidak ada lag UX.
  - Panggil `masterSarprasService.getPaketDetail(paket.code)` dan `masterStore.fetchPersyaratan(paket.code, true)` secara paralel.
  - Tampilkan shimmer skeleton loader pada area checklist dokumen jika data masih dimuat.
  - Nonaktifkan tombol simpan selama proses fetch detail berlangsung untuk mencegah submit parsial.
- **Rationale**: Mematuhi Konstitusi FE Prinsip XII (Lazy Loading & Skeleton Loader Standard).
