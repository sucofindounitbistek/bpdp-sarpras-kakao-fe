# Research: Modul Penyaluran Barang (Ekstensifikasi & Intensifikasi)

**Feature**: `045-penyaluran-barang-ekstensifikasi-intensifikasi`
**Date**: 2026-08-27
**Status**: Completed

---

## 1. Technical Context & Best Practices

### Context & Goals
Modul Penyaluran Barang Khusus Ekstensifikasi & Intensifikasi merupakan modul bisnis baru yang mengorkestrasi alur pengajuan permohonan pengadaan barang oleh Pekebun hingga pelaksanaan kontrak vendor dan penugasan surveyor oleh BPDP. Kebutuhan utama adalah membangun **Mockup Terisolasi & Reaktif** yang dapat disimulasikan langsung oleh pengguna lintas role tanpa memodifikasi atau mengganggu fitur proposal Sarpras existing.

---

## 2. Research Decisions & Rationales

### Decision 1: Pinia Store Architecture & LocalStorage Persistence
- **Decision**: Membuat store baru terdedikasi `usePenyaluranBarangStore` di `src/stores/penyaluranBarang.ts` dengan konfigurasi `persist` (LocalStorage).
- **Rationale**: Memungkinkan state transisi permohonan (misal status berubah dari `MENUNGGU_VERIFIKASI_TEKNIS` ke `DISPOSISI_PPK` lalu ke `PROSES_PEMILIHAN_PENYEDIA`) langsung terlihat saat pengguna berpindah peran di Role Switcher topbar tanpa membutuhkan backend API aktif.
- **Alternatives Considered**:
  - *In-memory state*: Hilang saat refresh halaman, menyulitkan demo.
  - *Hardcoded mock JSON terpisah*: Tidak reaktif antar perpindahan role.

### Decision 2: Client-side Interactive PDF Generation
- **Decision**: Menggunakan HTML-to-PDF / Canvas snapshot atau dynamic print-styled iframe generator untuk fitur "Download Surat Permohonan".
- **Rationale**: Menghasilkan dokumen PDF berformat kop resmi BPDP, rincian preferensi tabel RAB (Jenis barang, Nama barang/varietas, Jumlah, Satuan), tanggal dinamis, dan placeholder tanda tangan lembaga pekebun secara instan di browser.
- **Alternatives Considered**:
  - *Static file asset download*: Tidak mencerminkan data aktual yang baru saja diisi pemohon di form.

### Decision 3: Non-Destructive Extension of Role Switcher & Navigation
- **Decision**: Memperluas role union di `src/stores/auth.ts` dengan menambahkan `BPDP_PPK` dan `BPDP_ULP`, serta menambahkan section menu navigasi `'PENYALURAN BARANG (MOCKUP)'` di `src/composables/useNavigation.ts` dan opsi di `src/components/ui/RoleSwitcher.vue`.
- **Rationale**: Menjaga semua rute dan menu existing tetap 100% utuh sembari memberikan akses langsung bagi evaluator untuk menguji tampilan khusus BPDP PPK dan BPDP ULP.
- **Alternatives Considered**:
  - *Sub-modal switcher terpisah*: Membingungkan alur pengujian standar aplikasi.

### Decision 4: Component Decomposition & Pro Max Design Tokens
- **Decision**: Membangun komponen antarmuka yang modular di `src/components/penyaluran-barang/` dengan palet warna brand BPDP (`#066C2A` Forest Green, emerald accents, slate neutrals), kartu bento, status badge animasi, modal dialog konfirmasi, dan timeline progress tracker.
- **Rationale**: Memenuhi Konstitusi Proyek (WCAG AA, font-medium/semibold, micro-transitions, compact density, mobile-first responsive).

---

## 3. Risks & Mitigations

| Risiko | Mitigasi |
| :--- | :--- |
| Konflik nama rute atau state dengan modul pengusulan sarpras existing | Memberikan prefix unik rute `/penyaluran-barang/*` dan namespace store terisolasi `penyaluranBarang`. |
| Pengguna kehilangan data simulasi saat testing | Menyediakan tombol *"Reset Demo Data"* di UI untuk mengembalikan data awal jika dibutuhkan. |
