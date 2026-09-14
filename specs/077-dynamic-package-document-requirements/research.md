# Research & Technical Decisions: Standarisasi Dokumen Persyaratan Dinamis Master Paket

**Feature**: `077-dynamic-package-document-requirements`

## 1. Context & Architecture Review

Sistem saat ini memiliki dua arsitektur untuk dokumen persyaratan:
1. **Master Paket Dokumen API (Backend)**:
   - Endpoint: `GET /api/v1/master-sarpras/paket/:code/persyaratan`
   - Store: `useMasterSarprasStore()` di `src/stores/masterSarpras.ts`
   - Method: `fetchPersyaratan(paketCode, force)`
   - Caching: Tersimpan dalam `persyaratanMap: Record<string, DokumenPersyaratanItem[]>`
   - Struktur Item Dokumen:
     ```ts
     interface DokumenPersyaratanItem {
       id: number;
       paket_id: number;
       paket_code: string;
       dokumen_id: number;
       dokumen_code: string;
       nama: string;
       deskripsi?: string;
       is_wajib: boolean;
       sort_order: number;
       format_download_url?: string;
       is_active: boolean;
     }
     ```
2. **Static Config (Frontend)**:
   - File: `src/lib/pengusulan-persyaratan.config.ts` (`PAKET_PERSYARATAN_CONFIG`)
   - Merupakan fallback statis yang sebelumnya digunakan di seluruh tahap.

## 2. Technical Decisions

### Decision 1: Shared Composable / Helper untuk Dokumen Usulan Dinamis
- **Pilihan**: Membuat composable `useDynamicPackageRequirements(proposalRef)` atau helper method di `useMasterSarprasStore`.
- **Rasional**: Mencegah duplikasi logika sinkronisasi antara master dokumen dan dokumen yang diunggah proposal (`proposal.documents`) di 4 tempat berbeda.
- **Strategi Penggabungan (Union Strategy)**:
  1. Ambil daftar persyaratan dari `masterStore.fetchPersyaratan(paketCode)`.
  2. Map setiap syarat ke berkas yang diunggah di `proposal.documents` berdasarkan kesamaan kode (case-insensitive & normalize alphanumeric).
  3. Identifikasi dokumen di `proposal.documents` yang kodenya **tidak terdaftar** di master paket terkini.
  4. Sisipkan dokumen tersebut di akhir daftar sebagai kelompok *"Dokumen Tambahan / Riwayat Berkas"* agar file existing tidak hilang atau tersembunyi dari verifikator.

### Decision 2: Graceful Fallback
- Jika API master gagal atau jaringan offline, gunakan `PAKET_PERSYARATAN_CONFIG[paketCode]` sebagai cadangan data agar halaman verifikator tetap dapat dibuka tanpa error.

### Decision 3: Zero Impact to Authority Output Documents
- Dokumen output instansi pemerintah (*SK CPCL, Berita Acara Verifikasi, Surat Pengantar Provinsi, Rekomtek Ditjenbun, Laporan Kelayakan BPDP*) tetap dikelola oleh `authoritySections.ts` dan card otoritas masing-masing karena merupakan dokumen resmi regulasi pemerintah yang format dan kewenangannya baku untuk semua paket.
