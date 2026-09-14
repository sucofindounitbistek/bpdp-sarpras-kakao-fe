# Research: Section Kategori Sumber & Kewenangan Dokumen BPDP

**Feature**: `076-bpdp-document-authority-sections`
**Date**: 2026-09-08

## 1. Technical Context & Background

Dalam rantai birokrasi pengusulan dan verifikasi program Sarpras Kelapa Sawit/Kelapa (BPDP), dokumen-dokumen resmi yang ditelaah dan diverifikasi pada level BPDP (baik Verifikator maupun Kepala Divisi/Approval) diterbitkan oleh instansi pemerintah berjenjang (multi-tier governance):

1. **Dinas Kabupaten / Kota**:
   - Berwenang melakukan verifikasi CPCL (Calon Petani Calon Lahan) di lapangan, validasi kesesuaian berkas pekebun, penetapan SK CPCL, serta verifikasi Rencana Anggaran Biaya (RAB) Final.
   - Dokumen: SK Penetapan CPCL, Berita Acara Hasil Penelitian Dokumen, Berita Acara Verifikasi Lapangan, dan Dokumen RAB Final Kabupaten.
2. **Dinas Provinsi**:
   - Berwenang melakukan asistensi, penelaahan provinsi, dan menerbitkan surat pengantar rekomendasi kepada kementerian teknis.
   - Dokumen: Surat Pengantar SK CPCL.
3. **Direktorat Jenderal Perkebunan (Ditjenbun) Kementerian Pertanian**:
   - Berwenang melakukan verifikasi teknis nasional dan menerbitkan rekomendasi teknis resmi.
   - Dokumen: Rekomendasi Teknis (REKOMTEK) Ditjenbun.
4. **Badan Pengelola Dana Perkebunan (BPDP)**:
   - Berwenang melakukan penelitian kepatuhan dan kelayakan penyaluran dana serta menerbitkan keputusan persetujuan pencairan/pengadaan (SK Dirut).
   - Dokumen: Laporan Keputusan Hasil Penelitian Rekomtek (`KEPUTUSAN_KELAYAKAN`).

## 2. Decision & Architecture Strategy

### Decision 1: Card-Based Sectioning Architecture
- **Decision**: Membagi dokumen ke dalam kartu bordered terpisah (`AuthorityDocumentSectionCard` atau per-section container) berdasarkan instansi penerbit.
- **Rationale**:
  - Memberikan batasan visual yang jelas (visual boundaries) antar instansi.
  - Membantu Kepala Divisi BPDP secara instan memahami instansi mana yang bertanggung jawab atas berkas tertentu, terutama saat perlu melakukan pengembalian usulan (pushback) per tier instansi.
  - Mematuhi Constitution Principle IV (Visual Intentionality) dan Principle V (Zero-Redundancy).
- **Alternatives Considered**:
  - *Accordion / Collapsible*: Ditolak karena menyembunyikan status kelengkapan dokumen di balik klik tambahan, memperlambat proses review.
  - *Divider Flat*: Ditolak karena kurang tegas dalam memberikan identitas pembeda antar instansi.

### Decision 2: Dual-Mode Adaptation on BPDP Approval
- **Decision**:
  - **Mode Inspeksi (SK Terbit / Selesai)**: Menampilkan 4 kartu section mandiri di panel kiri (Dinas Kabupaten/Kota, Dinas Provinsi, Ditjenbun, BPDP) untuk 7 dokumen resmi dengan kemampuan tolak individual per dokumen. Panel kanan menyajikan ringkasan audit dan tombol aksi multi-tier pushback.
  - **Mode Reguler (Sebelum SK Terbit)**: Panel kiri tetap berfokus pada evaluasi Laporan Keputusan BPDP (KEPUTUSAN_KELAYAKAN), sedangkan panel kanan ("Hasil Penelitian Dokumen Usulan") dikelompokkan ke dalam 3 sub-section instansi (Kabupaten, Provinsi, Ditjenbun).
- **Rationale**:
  - Menjaga fokus workflow persetujuan reguler agar Kadiv BPDP tidak terdistraksi dokumen mentah yang sudah selesai ditelaah oleh verifikator, namun tetap dapat melihat hasil telaah per instansi dengan jelas di panel pendamping.

### Decision 3: Consistency on BPDP Verifikator (`CekiBpdpView.vue`)
- **Decision**: Menerapkan pengelompokan 3 section kartu (Kabupaten, Provinsi, Ditjenbun) pada Step 2 Penelitian Dokumen Verifikator BPDP.
- **Rationale**:
  - Menciptakan konsistensi mental model antara penelaah (Verifikator) dan pemberi persetujuan (Approval/Kadiv).

## 3. UI/UX Token & Color Coding

Sesuai panduan `@ui-ux-pro-max` dan Constitution Principle X:
- **Dinas Kabupaten / Kota**:
  - Badge: `bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800`
  - Icon: `Building2` / `Landmark`
- **Dinas Provinsi**:
  - Badge: `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800`
  - Icon: `Compass` / `MapPin`
- **Ditjenbun (Kementan)**:
  - Badge: `bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800`
  - Icon: `Award` / `ShieldCheck`
- **BPDP**:
  - Badge: `bg-emerald-50 text-[#066C2A] border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800`
  - Icon: `FileCheck2` / `Briefcase`
