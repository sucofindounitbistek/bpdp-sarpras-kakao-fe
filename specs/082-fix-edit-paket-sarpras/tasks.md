# Tasks: Perbaikan Form Edit Paket Sarpras & Dokumen Wajib/Opsional (Frontend)

**Input**: Design documents from `specs/082-fix-edit-paket-sarpras/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)  

## Format: `[ID] [P?] [Story] Description with file path`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier ([US1], [US2], [US3], [US4])

---

## Phase 1: Setup & Types Preparation

**Purpose**: Menyiapkan definisi tipe TypeScript dan kontrak model untuk paket sarpras dan dokumen persyaratan.

- [X] T001 [P] Perbarui interface `MasterDokumenCatalog` dan `DokumenPersyaratanItem` dengan atribut `is_wajib: boolean` di `src/types/masterSarpras.ts`
- [X] T002 [P] Perbarui interface `PaketSarprasFormState` di `src/views/master-data/PaketSarprasListView.vue` agar hanya berfokus pada `name` (tanpa field input label singkat)

---

## Phase 2: Foundational (Store & Service Foundation)

**Purpose**: Memperbarui store Pinia dan service HTTP untuk mendukung normalisasi data dan atribut `is_wajib`.

- [X] T003 Perbarui `src/services/masterSarpras.service.ts` untuk menyertakan `is_wajib` pada `createDokumen`, `updateDokumen`, dan memastikan payload `updatePaket` menyinkronkan `label: payload.name`
- [X] T004 Perbarui `src/stores/masterSarpras.ts` untuk memetakan properti `is_wajib` pada `dokumenCatalog`, `persyaratanMap`, dan menyegarkan cache saat pembaruan paket/dokumen selesai

---

## Phase 3: User Story 1 - Kelengkapan Nilai Form Modal Edit Paket (Priority: P1) 🎯 MVP

**Goal**: Modal edit paket sarpras memuat seluruh field utama terisi lengkap (Nama Paket, Kategori, Deskripsi, Jumlah Tahap, Kode Penomoran, Syarat Minimum, checklist dokumen) dan meniadakan input redundan "Label Singkat".

**Independent Test**: Buka modal edit paket di `/master-data/paket-sarpras`, pastikan hanya ada satu input nama ("Nama Paket") dan terisi penuh nilai paket tanpa field kosong.

- [X] T005 [US1] Hapus elemen input "Label Singkat" dari template modal form edit di `src/views/master-data/PaketSarprasListView.vue`
- [X] T006 [US1] Perbaiki fungsi `openEditModal(paket)` di `src/views/master-data/PaketSarprasListView.vue` dengan bidirectional fallback cerdas (`name = paket.name || paket.label || ''`)
- [X] T007 [US1] Integrasikan pemanggilan `masterSarprasService.getPaketDetail(paket.code)` secara paralel dengan `masterStore.fetchPersyaratan(paket.code, true)` di `src/views/master-data/PaketSarprasListView.vue`
- [X] T008 [US1] Tambahkan indikator loading skeleton/shimmer pada bagian dokumen persyaratan modal selama data detail sedang dimuat di `src/views/master-data/PaketSarprasListView.vue`

---

## Phase 4: User Story 2 - Kelancaran Pengiriman (Submit) Form Pembaruan Paket (Priority: P1) 🎯 MVP

**Goal**: Form pembaruan paket dapat di-submit dengan sukses tanpa terblokir validasi palsu *"Nama paket wajib diisi"*, dengan penyelarasan otomatis `label = name`.

**Independent Test**: Klik tombol "Simpan Perubahan" pada modal edit paket yang terbuka, pastikan toast hijau sukses muncul dan data kartu langsung ter-refresh.

- [X] T009 [US2] Perbaiki validasi submit `handleSavePaket()` di `src/views/master-data/PaketSarprasListView.vue` agar hanya memvalidasi `formState.value.name.trim()`
- [X] T010 [US2] Normalisasi payload di `handleSavePaket()` pada `src/views/master-data/PaketSarprasListView.vue` dengan menyematkan `name: trimmedName` dan `label: trimmedName`
- [X] T011 [US2] Nonaktifkan tombol "Simpan Perubahan" saat state `isLoadingDetail` atau `isSubmitting` aktif di `src/views/master-data/PaketSarprasListView.vue`

---

## Phase 5: User Story 3 - Pengelolaan Sifat Dokumen Wajib vs Opsional di Master Data (Priority: P1) 🎯 MVP

**Goal**: Admin dapat menentukan sifat dokumen (Wajib vs Opsional) pada katalog dokumen persyaratan, dan status ini diwariskan ke checklist dokumen di paket sarpras.

**Independent Test**: Buat/edit dokumen di `/master-data/dokumen-persyaratan` sebagai "Opsional". Pastikan badge "OPSIONAL" muncul di tabel katalog dan pada kartu paket sarpras yang menggunakannya.

- [X] T012 [P] [US3] Tambahkan kontrol pilihan sifat dokumen (Radio button / Switch: Wajib vs Opsional) pada modal tambah dan edit dokumen di `src/views/master-data/DokumenPersyaratanListView.vue`
- [X] T013 [P] [US3] Tampilkan badge status `WAJIB` (merah) dan `OPSIONAL` (abu-abu) pada kolom tabel katalog dokumen di `src/views/master-data/DokumenPersyaratanListView.vue`
- [X] T014 [US3] Hubungkan penyimpanan `is_wajib` pada fungsi `handleSaveDocument()` di `src/views/master-data/DokumenPersyaratanListView.vue`
- [X] T015 [US3] Tampilkan badge indikator visual `[WAJIB]` atau `[OPSIONAL]` di samping setiap item dokumen pada checklist modal edit paket sarpras di `src/views/master-data/PaketSarprasListView.vue`

---

## Phase 6: User Story 4 - Konsistensi Penandaan & Validasi Dokumen Proposal Multi-Role (Priority: P1) 🎯 MVP

**Goal**: Memastikan penanda visual badge "Wajib" dan "Opsional" konsisten di seluruh role pada alur proposal, dan validasi submit hanya memblokir dokumen Wajib.

**Independent Test**: Akses tahapan Upload Dokumen sebagai Pemohon, unggah seluruh berkas wajib dan kosongkan berkas opsional. Pastikan proposal berhasil disubmit.

- [X] T016 [P] [US4] Verifikasi dan pastikan badge `Wajib` (merah) dan `Opsional` (abu-abu) tampil konsisten pada `src/views/pengusulan/StepUploadDokumen.vue`
- [X] T017 [P] [US4] Verifikasi dan pastikan badge `Wajib` dan `Opsional` tampil konsisten pada `src/views/pengusulan/StepPaketSarpras.vue`
- [X] T018 [P] [US4] Verifikasi dan pastikan tabel pratinjau dokumen verifikasi di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` dan `src/views/dinas/provinsi/StepSummaryDanSubmit.vue` menampilkan badge Wajib/Opsional
- [X] T019 [US4] Pastikan fungsi validasi kelengkapan dokumen pengusulan di `src/stores/pengusulanDraft.ts` dan `src/views/pengusulan/StepUploadDokumen.vue` hanya mensyaratkan dokumen bertanda `wajib: true`

---

## Phase 7: Polish, Typecheck & Verification

**Purpose**: Verifikasi akhir tipe data TypeScript dan pengujian end-to-end.

- [X] T020 Jalankan typecheck TypeScript `npm run type-check` dan perbaiki jika ada tipe yang tidak kompatibel
- [X] T021 Verifikasi alur menyeluruh: edit paket sarpras -> simpan -> buka master dokumen persyaratan -> atur sifat dokumen -> cek tampilan proposal

---

## Dependencies & Completion Order

```
[Phase 1: Setup & Types] ──> [Phase 2: Store & Service]
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
   [Phase 3: US1 - Form Edit Paket]              [Phase 5: US3 - Master Dokumen Wajib/Opsional]
              │                                               │
              ▼                                               ▼
   [Phase 4: US2 - Submit Pembaruan]             [Phase 6: US4 - Konsistensi Proposal Multi-Role]
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      ▼
                           [Phase 7: Verification]
```
