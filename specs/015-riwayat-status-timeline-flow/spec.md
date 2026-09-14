# Feature Specification: Penyambungan Alur Riwayat Status & Catatan Timeline

**Feature Branch**: `015-riwayat-status-timeline-flow`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "untuk riwayat bisa ga agar disambungkan setiap alurnya"

---

## Background & Context

Pada komponen **Riwayat Status & Catatan (`LogStatusUsulan.vue`)**, saat ini garis vertikal penunjuk alur (*timeline track line*) terlihat terputus, menggantung, atau kurang presisi menyambungkan antar baris riwayat aktivitas.

Ketika usulan berpindah status melalui beberapa tahapan (misalnya `DRAFT → VERIFIKASI_DITJENBUN → APPROVAL_DITJENBUN → VERIFIKASI_BPDP → APPROVAL_BPDP`), pengguna mengharapkan riwayat status tampil sebagai **garis alur kronologis yang tersambung secara utuh (continuous connected timeline)** dari setiap simpul (node) ke simpul berikutnya tanpa ada garis terputus atau terpotong di bagian bawah item terakhir.

Fitur ini akan menyempurnakan struktur HTML/CSS komponen `LogStatusUsulan.vue` agar setiap entri riwayat saling terhubung dengan garis vertikal yang mulus, mendukung indikator status berkode warna (hijau untuk persetujuan, amber/merah untuk pengembalian/pushback), dan memastikan alur riwayat menyambung di seluruh halaman detail usulan.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pengguna Melihat Alur Riwayat Status Terhubung Mulus (Priority: P1)

Sebagai petugas (Verifikator Ditjenbun, Ketua Tim Ditjenbun, Verifikator BPDP, atau Kadiv BPDP), saat saya membuka bagian "Riwayat Status & Catatan" pada halaman detail usulan, saya dapat melihat garis vertikal *timeline track* yang menyambung secara kontinu dari setiap riwayat aktivitas pertama hingga aktivitas terbaru, tanpa garis terputus.

**Why this priority**: Permintaan utama pengguna sesuai gambar; menyempurnakan tampilan estetika dan kejelasan kronologi alur usulan.

**Independent Test**: Buka halaman detail usulan apapun (misalnya `/bpdp/ceki/usl-004` atau `/ditjenbun/rekomtek/approval/usl-003`). Periksa kartu "Riwayat Status & Catatan" dan pastikan garis vertikal menyambung dengan rapi antar simpul tanpa terpotong di tengah dan tidak menggantung di bawah item terakhir.

**Acceptance Scenarios**:

1. **Given** usulan memiliki 2 atau lebih entri log status, **When** komponen `LogStatusUsulan.vue` dirender, **Then** terdapat garis vertikal kontinu (`w-0.5 bg-slate-200 dark:bg-slate-700`) yang menghubungkan titik indikator (*node*) dari entri pertama ke entri berikutnya.
2. **Given** entri log adalah item terakhir dalam daftar, **When** komponen dirender, **Then** garis vertikal bawah disembunyikan sehingga garis berhenti pas di titik indikator terakhir.
3. **Given** log perpindahan status terjadi (misal `APPROVAL DITJENBUN → VERIFIKASI BPDP`), **When** log ditampilkan, **Then** titik indikator berwarna hijau (`bg-[#066C2A]`), nama aktor, peran, tanggal, serta kotak catatan tampil terstruktur.
4. **Given** log pengembalian/pushback terjadi (misal ke `VERIFIKASI_DITJENBUN`), **When** log ditampilkan, **Then** titik indikator berwarna amber/merah untuk membedakan alur pengembalian.

---

### User Story 2 — Penyelarasan Riwayat di Seluruh Halaman Rekomtek & BPDP (Priority: P2)

Sebagai pengguna di semua peran, saat saya berpindah antar halaman detail usulan (Ditjenbun Ceki, Ditjenbun Approval, BPDP Ceki, BPDP Approval, dan Finalisasi SK Dirut), komponen `LogStatusUsulan.vue` menyajikan tampilan timeline terhubung yang konsisten 100%.

**Why this priority**: Memastikan tidak ada halaman yang masih menggunakan tampilan timeline terputus.

**Independent Test**: Navigasi ke seluruh 5 halaman detail rekomtek/BPDP dan pastikan kartu "Riwayat Status & Catatan" konsisten di semua view.

**Acceptance Scenarios**:

1. **Given** pengguna berada di halaman `CekiDitjenbunView.vue`, `ApprovalDitjenbunView.vue`, `CekiBpdpView.vue`, `ApprovalBpdpView.vue`, atau `FinalisasiSkDirutView.vue`, **When** melihat bagian riwayat, **Then** tampilan timeline tersambung dengan rapi di seluruh halaman tersebut.

---

## Requirements

### Functional Requirements

- **FR-001**: Komponen `LogStatusUsulan.vue` HARUS menyajikan garis vertikal penghubung (*connecting timeline track line*) yang menyambungkan setiap simpul riwayat aktivitas dari entri awal hingga entri berikutnya secara kontinu.
- **FR-002**: Garis vertikal di bawah simpul terakhir HARUS disembunyikan agar garis timeline berakhir dengan rapi pada titik indikator paling bawah tanpa garis menggantung.
- **FR-003**: Titik indikator simpul (*timeline node dot*) HARUS menggunakan warna status yang membedakan alur persetujuan/kemajuan (`bg-[#066C2A]`) dan alur pengembalian/revisi (`bg-amber-500` / `bg-rose-500`).
- **FR-004**: Setiap entri riwayat HARUS menampilkan header nama aktor, peran aktor (formatted uppercase), timestamp tanggal & jam terformat Indonesia, label perpindahan status (`From Status → To Status`), dan kotak catatan keterangan (*note box*).
- **FR-005**: Tampilan komponen `LogStatusUsulan.vue` HARUS mendukung mode gelap (*Dark Mode*) dengan kontras warna WCAG AA.

### Key Entities

- **StatusLog**: Model data riwayat yang berisi `id`, `usulanId`, `fromStatus`, `toStatus`, `actorName`, `actorRole`, `note`, `createdAt`.
- **LogStatusUsulan.vue**: Komponen Vue presentational timeline.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Garis penghubung vertikal antar simpul riwayat tersambung 100% tanpa celah kosong atau garis menggantung di item terakhir.
- **SC-002**: 100% dari 5 halaman detail rekomtek & BPDP yang mengonsumsi `LogStatusUsulan.vue` menampilkan timeline tersambung secara seragam.

---

## Assumptions

- Data `logs` dikirim dari Pinia store (`useRekomtekStore`) dalam bentuk array `StatusLog[]` yang terurut secara kronologis (item terlama di atas, item terbaru di bawah atau sebaliknya).
