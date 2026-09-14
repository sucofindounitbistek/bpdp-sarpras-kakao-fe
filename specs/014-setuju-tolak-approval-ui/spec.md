# Feature Specification: Standarisasi UI Setuju / Tolak Approval

**Feature Branch**: `014-setuju-tolak-approval-ui`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "setuju atau tolak ini bisakah dibuat seperti yang ada di ditjenbun approval seperti pada gambar, ada beberapa halaman yang masih beda tolong diperbaiki"

---

## Background & Context

Pada modul persetujuan (Approval) dan verifikasi dokumen usulan Sarpras Kakao, terdapat ketidaksesuaian tampilan tombol validasi per dokumen/laporan antar halaman.

Di halaman **Approval Ditjenbun (`ApprovalDitjenbunView.vue`)**, tombol validasi menggunakan desain tombol berlabel teks yang jelas: **`✓ Setuju`** (tombol hijau saat aktif) dan **`✕ Tolak`** (tombol merah saat aktif), dilengkapi dengan pratinjau berkas bertanda tangan dan textarea catatan penolakan jika ditolak.

Sedangkan di beberapa halaman lain (seperti **Approval BPDP `ApprovalBpdpView.vue`** dan komponen verifikasi dokumen), tampilan masih menggunakan checkbox statis atau tombol ikon tanpa label teks "Setuju" / "Tolak" yang seragam.

Fitur ini bertujuan untuk **menyeimbangkan dan menyelaraskan (standardize)** komponen dan tampilan tombol **Setuju / Tolak** di seluruh halaman persetujuan dan verifikasi agar 100% konsisten dengan referensi desain di `ApprovalDitjenbunView.vue`.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Kadiv BPDP Melakukan Review Approval Kelayakan dengan UI Standar (Priority: P1)

Sebagai `BPDP_APPROVAL` (Kadiv BPDP), saat saya membuka detail usulan pada halaman `/bpdp/approval/:id`, saya melihat kartu "Hasil Asistensi & Laporan Kelayakan BPDP" yang berisi informasi Rekomtek, status kelayakan, tombol pratinjau dokumen, dan tombol toggle **`✓ Setuju`** / **`✕ Tolak`** per dokumen/laporan yang seragam dengan tampilan di Approval Ditjenbun.

**Why this priority**: Paling berdampak langsung; `ApprovalBpdpView.vue` saat ini masih menggunakan `ChecklistDokumen` checkbox lama yang berbeda jauh dari `ApprovalDitjenbunView.vue`.

**Independent Test**: Buka `/bpdp/approval/:id` sebagai `BPDP_APPROVAL`. Verifikasi bahwa kartu utama menampilkan tombol `✓ Setuju` dan `✕ Tolak`, pratinjau PDF bekerja, dan memilih Tolak membuka textarea catatan penolakan.

**Acceptance Scenarios**:

1. **Given** usulan berstatus `APPROVAL_BPDP`, **When** Kadiv BPDP membuka halaman, **Then** kartu "Laporan Kelayakan Rekomtek" menampilkan tombol toggle `✓ Setuju` (hijau) dan `✕ Tolak` (merah).
2. **Given** Kadiv menekan `✓ Setuju`, **Then** tombol Setuju aktif dengan background hijau (`bg-emerald-600 text-white`), dan tombol "Setujui Kelayakan" di panel kanan menjadi aktif.
3. **Given** Kadiv menekan `✕ Tolak`, **Then** tombol Tolak aktif dengan background merah (`bg-rose-600 text-white`), textarea "Catatan Penolakan" muncul di bawah kartu, dan tombol "Kembalikan ke Ditjenbun" di panel kanan menjadi aktif jika catatan terisi.
4. **Given** dokumen laporan kelayakan memiliki file bertanda tangan, **When** Kadiv menekan "Pratinjau Laporan Kelayakan Bertanda Tangan", **Then** modal `DocumentPreviewModal` terbuka menampilkan PDF.

---

### User Story 2 — Penyelarasan Komponen `VerifikasiDokumenItem.vue` (Priority: P2)

Sebagai verifikator (Ditjenbun / BPDP), saat saya menelaah berkas di halaman verifikasi (`CekiBpdpView.vue` & `CekiDitjenbunView.vue`), tombol aksi per item dokumen menampilkan teks label **`✓ Setuju`** dan **`✕ Tolak`** dengan konsisten (bukan hanya ikon persegi polos) untuk meningkatkan kejelasan visual dan keterbacaan (usability).

**Why this priority**: Menghilangkan ambiguitas visual di halaman verifikasi dokumen.

**Independent Test**: Buka halaman `/bpdp/ceki/:id` atau `/ditjenbun/rekomtek/ceki/:id` dan pastikan tombol validasi per dokumen memiliki label teks "Setuju" dan "Tolak" yang seragam.

**Acceptance Scenarios**:

1. **Given** verifikator membuka halaman verifikasi dokumen, **When** melihat tiap item dokumen, **Then** tombol aksi berupa `✓ Setuju` dan `✕ Tolak` dengan warna hover & active yang seragam.
2. **Given** mode `readonly` aktif, **Then** label badge yang ditampilkan adalah `✓ Sesuai` / `✕ Tidak Sesuai` / `Belum dicek` dengan warna status yang jelas.

---

### User Story 3 — Konsistensi Modal Pratinjau Dokumen (Priority: P3)

Semua halaman persetujuan (Ditjenbun & BPDP) harus mendukung pratinjau dokumen PDF bertanda tangan secara langsung melalui modal interactive `DocumentPreviewModal.vue`.

**Why this priority**: Memastikan approver tidak perlu mengunduh file ke lokal hanya untuk meninjau berkas bertanda tangan.

**Independent Test**: Uji tombol pratinjau di `ApprovalDitjenbunView.vue` dan `ApprovalBpdpView.vue`; keduanya membuka `DocumentPreviewModal` dengan judul dan sumber file yang tepat.

**Acceptance Scenarios**:

1. **Given** pengguna menekan tombol pratinjau di halaman approval manapun, **When** modal terbuka, **Then** dokumen PDF dapat dibaca dengan jelas dalam modal overlay.

---

### Edge Cases

- Apa yang terjadi jika file PDF bertanda tangan belum ada / belum diunggah? Tampilkan alert banner peringatan ("Dokumen Rekomtek / Laporan Kelayakan belum diunggah") menggantikan tombol pratinjau.
- Apa yang terjadi jika Kadiv menekan "Tolak" tanpa mengisi catatan penolakan? Tombol eksekusi kembalikan/revisi tetap disabilitas atau menampilkan toast error "Harap berikan catatan alasan penolakan".

---

## Requirements

### Functional Requirements

- **FR-001**: Halaman `ApprovalBpdpView.vue` HARUS diperbarui untuk menggunakan kartu "Hasil Asistensi & Laporan Kelayakan BPDP" dengan tombol toggle **`✓ Setuju`** dan **`✕ Tolak`**, menggantikan komponen `ChecklistDokumen` statis.
- **FR-002**: Tombol `✓ Setuju` pada semua halaman approval & verifikasi HARUS memiliki gaya visual aktif `bg-emerald-600 text-white shadow-sm` dan gaya inaktif `text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300`.
- **FR-003**: Tombol `✕ Tolak` pada semua halaman approval & verifikasi HARUS memiliki gaya visual aktif `bg-rose-600 text-white shadow-sm` dan gaya inaktif `text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300`.
- **FR-004**: Komponen `VerifikasiDokumenItem.vue` HARUS mendukung opsi render tombol berlabel teks **`✓ Setuju`** / **`✕ Tolak`** agar seragam di seluruh aplikasi.
- **FR-005**: Halaman `ApprovalBpdpView.vue` HARUS menyediakan tombol "Pratinjau Laporan Kelayakan Bertanda Tangan" yang membuka `DocumentPreviewModal.vue` saat file bertanda tangan tersedia.
- **FR-006**: Apabila opsi `✕ Tolak` dipilih pada halaman approval, sistem HARUS menampilkan textarea "Catatan Penolakan" secara kondisional di bawah item terkait.
- **FR-007**: Keputusan pada panel kanan (Setujui / Kembalikan) HARUS tersinkronisasi secara reaktif dengan status toggle `Setuju` / `Tolak` dan kelengkapan catatan penolakan.

### Key Entities

- **ApprovalState**: State lokal untuk melacak status persetujuan item (`'APPROVED' | 'REJECTED' | 'PENDING'`) dan catatan penolakan (`notes`).
- **VerifikasiDokumenItem**: KomponenVue presentasional yang diperbarui untuk mendukung mode label tombol `✓ Setuju` / `✕ Tolak`.
- **DocumentPreviewModal**: Komponen modal overlay untuk pratinjau berkas PDF bertanda tangan.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% halaman approval (`ApprovalDitjenbunView.vue` & `ApprovalBpdpView.vue`) menggunakan tata letak dan desain tombol `✓ Setuju` / `✕ Tolak` yang persis sama.
- **SC-002**: Pengguna dapat melakukan pratinjau dokumen bertanda tangan dalam ≤ 1 klik dari halaman approval tanpa perlu mengunduh file secara manual.
- **SC-003**: Waktu reaksi toggle `Setuju` / `Tolak` dan pembukaan textarea catatan berlangsung secara instan (< 100ms) tanpa *layout shift*.

---

## Assumptions

- Halaman `ApprovalDitjenbunView.vue` merupakan acuan standar utama (gold standard) untuk desain persetujuan berkas.
- Pihak Kadiv BPDP (`BPDP_APPROVAL`) bertugas memeriksa Laporan Kelayakan yang telah diunggah oleh Verifikator BPDP.
- Pengembalian dari Kadiv BPDP jika ditolak adalah mengembalikan usulan ke Ketua Ditjenbun (`APPROVAL_DITJENBUN`) atau ke Verifikator BPDP (`VERIFIKASI_BPDP`) sesuai kebutuhan alur yang disepakati.
- Semua file pratinjau berbentuk PDF dan dapat ditampilkan melalui `DocumentPreviewModal.vue`.
