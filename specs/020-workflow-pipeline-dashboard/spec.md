# Feature Specification: Dashboard Workflow Pipeline (Multi-Role)

**Feature Branch**: `020-workflow-pipeline-dashboard`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "buatkan dashboard seperti ini untuk role tertera di gambar, dan setiap card diberikan url untuk ke halaman proposal"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lihat Pipeline Status Berdasarkan Role (Priority: P1)

Setiap pengguna yang masuk ke halaman Dashboard melihat tampilan pipeline alur kerja pengajuan sarpras kakao, dengan setiap tahapan ditampilkan sebagai card yang menunjukkan ringkasan data (Jumlah Pekebun, Luas Lahan, Jumlah Proposal) pada tahapan tersebut. Tampilan pipeline bersifat read-only dan menyesuaikan konteks berdasarkan role aktif pengguna.

**Why this priority**: Ini adalah inti dari fitur — memberikan visibilitas real-time terhadap progres alur kerja sarpras kakao tanpa harus membuka setiap halaman sub-modul satu per satu.

**Independent Test**: Dapat diuji penuh dengan login sebagai salah satu role (misalnya DINAS_KAB), membuka halaman Dashboard, dan memverifikasi bahwa card pipeline tampil dengan data ringkasan yang benar.

**Acceptance Scenarios**:

1. **Given** pengguna login sebagai DINAS_KAB atau DINAS_PROV, **When** membuka halaman Dashboard, **Then** tampil seluruh 10 card pipeline alur kerja sarpras kakao (dari Pengajuan Proposal s.d. Penerbitan SK Dirut) dengan label tahapan, jumlah pekebun, luas lahan (Ha), dan jumlah proposal.
2. **Given** pengguna login sebagai DITJENBUN, DITJENBUN_VERIFIKATOR, atau DITJENBUN_APPROVAL, **When** membuka halaman Dashboard, **Then** tampil seluruh card pipeline dengan data relevan untuk lingkup nasional.
3. **Given** pengguna login sebagai BPDPKS, BPDP_VERIFIKATOR, atau BPDP_APPROVAL, **When** membuka halaman Dashboard, **Then** tampil seluruh card pipeline dengan data relevan untuk lingkup BPDP.
4. **Given** data pada suatu tahapan pipeline adalah nol, **When** card ditampilkan, **Then** nilai ditampilkan sebagai `0` (misalnya `0 Orang`, `0 Ha`, `0 Proposal`) dan card tetap tampil.
5. **Given** data ringkasan belum termuat (loading), **When** card ditampilkan, **Then** nilai ditampilkan dengan placeholder `--` atau loader skeleton.

---

### User Story 2 - Navigasi ke Halaman Proposal dari Card Pipeline (Priority: P2)

Setiap card tahapan pada pipeline dapat diklik dan mengarahkan pengguna ke halaman daftar proposal yang relevan dengan tahapan tersebut.

**Why this priority**: Kemampuan navigasi langsung dari card ke halaman proposal meningkatkan efisiensi kerja operasional.

**Independent Test**: Dapat diuji dengan mengklik salah satu card pipeline dan memverifikasi bahwa halaman yang terbuka adalah halaman daftar proposal yang sesuai dengan tahapan card tersebut.

**Acceptance Scenarios**:

1. **Given** card pipeline "Verifikasi Dinas Kabupaten/Kota" ditampilkan, **When** pengguna mengklik card tersebut, **Then** sistem mengarahkan pengguna ke halaman verifikasi kabupaten (/dinas/verifikasi/kabupaten).
2. **Given** card pipeline "Penerbitan Rekomtek" ditampilkan, **When** pengguna mengklik card tersebut, **Then** sistem mengarahkan pengguna ke halaman antrean rekomtek Ditjenbun (/ditjenbun/rekomtek).
3. **Given** card pipeline "Penelitian BPDP" atau "Approval BPDP" ditampilkan, **When** pengguna mengklik card tersebut, **Then** sistem mengarahkan pengguna ke halaman antrean BPDP (/bpdp/antrean).
4. **Given** pengguna tidak memiliki akses ke halaman tujuan card yang diklik, **When** navigasi dipicu, **Then** sistem menampilkan halaman Access Denied sesuai mekanisme route guard yang sudah ada.

---

### User Story 3 - Alur Visual Antar Tahapan dengan Panah Penghubung (Priority: P3)

Card-card tahapan ditampilkan dalam tata letak grid yang mencerminkan alur kerja dari gambar referensi, dengan panah penghubung antar card.

**Why this priority**: Panah penghubung membantu pengguna memahami relasi antar tahapan secara visual.

**Independent Test**: Dapat diuji dengan memverifikasi bahwa layout grid dan arah panah sesuai dengan diagram referensi.

**Acceptance Scenarios**:

1. **Given** pengguna membuka Dashboard, **When** section pipeline ditampilkan, **Then** card disusun dalam layout yang mencerminkan alur baris 1 (Pengajuan Proposal ke kanan hingga Asistensi Dinas Provinsi), baris 2 (arah balik dari Asistensi Ditjenbun ke kiri hingga Penelitian BPDP), baris 3 (Approval BPDP ke kanan ke Penerbitan SK Dirut).
2. **Given** tampilan pada layar mobile, **When** pipeline ditampilkan, **Then** card tersusun dalam layout single-column dengan urutan alur yang tetap benar.

---

### Edge Cases

- Jika data ringkasan pipeline belum tersedia: Card menampilkan skeleton loader atau nilai placeholder dan tidak crash.
- Jika pengguna adalah PEMOHON: Section pipeline tidak ditampilkan; dashboard PEMOHON tidak berubah.
- Jika card diklik pada role yang tidak memiliki akses ke URL tujuan: Route guard existing menangani redirect ke halaman Access Denied.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menampilkan section pipeline workflow pada halaman Dashboard untuk role: DINAS_KAB, DINAS_PROV, DITJENBUN, DITJENBUN_VERIFIKATOR, DITJENBUN_APPROVAL, BPDPKS, BPDP_VERIFIKATOR, BPDP_APPROVAL.
- **FR-002**: Section pipeline HARUS menampilkan 10 card tahapan sesuai urutan alur: (1) Pengajuan Proposal, (2) Verifikasi Dinas Kabupaten/Kota, (3) Approval SK CPCL, (4) Asistensi Dinas Provinsi, (5) Asistensi Ditjenbun, (6) Penerbitan Rekomtek, (7) Approval Rekomtek, (8) Penelitian BPDP, (9) Approval BPDP, (10) Penerbitan SK Dirut.
- **FR-003**: Setiap card pipeline HARUS menampilkan 3 data ringkasan: Jumlah Pekebun, Luas Lahan (Ha), dan Jumlah Proposal.
- **FR-004**: Setiap card pipeline HARUS dapat diklik dan mengarahkan pengguna ke URL halaman proposal/daftar yang relevan dengan tahapan tersebut.
- **FR-005**: Tampilan pipeline HARUS mencerminkan layout dan arah alur sesuai gambar referensi, termasuk panah penghubung antar card.
- **FR-006**: Judul section pipeline HARUS mencerminkan konteks role target dan dieksternalisasi ke localization config (Konstitusi XV).
- **FR-007**: Data ringkasan pada setiap card HARUS disimulasikan dengan client-side mock data karena backend endpoint agregasi per-tahapan belum tersedia (Konstitusi XIII - Mockup-First Standard).
- **FR-008**: Section pipeline HARUS TIDAK ditampilkan untuk role PEMOHON; tampilan dashboard PEMOHON tidak berubah.
- **FR-009**: Pada tampilan mobile, pipeline HARUS tetap dapat dibaca dengan layout yang responsif, tidak menyebabkan horizontal overflow.
- **FR-010**: Seluruh wording label card, label data, dan teks UI pipeline HARUS dieksternalisasi ke src/config/localization.ts (Konstitusi XV).
- **FR-011**: Card pipeline HARUS menampilkan visual hover effect sebagai feedback interaktif sebelum diklik.

### Key Entities

- **PipelineStage**: Representasi satu tahapan dalam alur kerja sarpras kakao. Atribut: nama tahapan, label singkat, URL tujuan navigasi, jumlah pekebun (mock), luas lahan dalam Ha (mock), jumlah proposal (mock).
- **PipelineDashboardConfig**: Konfigurasi per-role yang menentukan daftar stage yang ditampilkan dan data mock-nya. Disimpan di sisi klien sebagai konstanta TypeScript.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pengguna dengan role DINAS_KAB, DINAS_PROV, DITJENBUN, atau BPDP (beserta sub-role) dapat melihat seluruh 10 card pipeline lengkap dalam satu tampilan Dashboard tanpa scroll horizontal pada viewport >= 1024px.
- **SC-002**: Setiap card pipeline dapat diklik dan pengguna berpindah ke halaman yang benar (navigasi client-side instan).
- **SC-003**: Pada viewport mobile (375px), pipeline dapat dibaca tanpa horizontal overflow dan semua 10 card tetap dapat diakses melalui scroll vertikal.
- **SC-004**: Wording tidak ada yang hardcode di template Vue; semua label pipeline berasal dari localization.ts.
- **SC-005**: Dashboard PEMOHON tidak mengalami perubahan apapun setelah fitur ini diimplementasikan.

---

## Assumptions

- Data ringkasan (Jumlah Pekebun, Luas Lahan, Jumlah Proposal) untuk setiap card pipeline disimulasikan dengan mock data client-side karena tidak ada backend endpoint agregasi per-tahapan yang tersedia saat ini.
- Setiap card pipeline memiliki URL navigasi statis; filtering by status tahapan ditangani oleh halaman tujuan masing-masing.
- Layout pipeline menggunakan CSS Grid (bukan SVG diagram interaktif) untuk konsistensi dengan desain komponen existing.
- Panah antar card diimplementasikan menggunakan icon SVG inline atau CSS pseudo-elements, tanpa library diagram eksternal.
- Section pipeline disisipkan ke DashboardView.vue, melengkapi section metrics card yang sudah ada.
- Role PEMOHON tidak termasuk dalam target pengguna fitur ini sesuai gambar referensi.
- Komponen pipeline baru (PipelineCard.vue atau WorkflowPipeline.vue) akan dibuat sebagai komponen terpisah yang dipanggil dari DashboardView.vue.

---

## Pipeline Stage to URL Mapping

| Stage | Label | URL Tujuan | Role yang Relevan |
|-------|-------|-----------|------------------|
| 1 | Pengajuan Proposal | /pengusulan/pengajuan-proposal | Semua role non-PEMOHON |
| 2 | Verifikasi Dinas Kabupaten/Kota | /dinas/verifikasi/kabupaten | DINAS_KAB, DINAS_PROV |
| 3 | Approval SK CPCL | /dinas/verifikasi/kabupaten | DINAS_KAB, DINAS_PROV |
| 4 | Asistensi Dinas Provinsi | /dinas/verifikasi/provinsi | DINAS_PROV |
| 5 | Asistensi Ditjenbun | /ditjenbun/rekomtek | DITJENBUN* |
| 6 | Penerbitan Rekomtek | /ditjenbun/rekomtek | DITJENBUN* |
| 7 | Approval Rekomtek | /ditjenbun/rekomtek | DITJENBUN_APPROVAL |
| 8 | Penelitian BPDP | /bpdp/antrean | BPDP_VERIFIKATOR |
| 9 | Approval BPDP | /bpdp/antrean | BPDP_APPROVAL |
| 10 | Penerbitan SK Dirut | /bpdp/antrean | BPDPKS |

*DITJENBUN termasuk DITJENBUN_VERIFIKATOR dan DITJENBUN_APPROVAL
