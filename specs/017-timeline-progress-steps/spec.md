# Feature Specification: Pekebun Timeline Step View & Wording Refinement

**Feature Branch**: `017-timeline-progress-steps`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "workflow timeline pekebun jadi step view biar terlihat progresds perbaiki wording timeline pekebun: - submit pemohon = submit proposal - rekomtek kab/kota = verifikasi dinas kab/kota - asistensi dinas provinsi - penerbitan rekomtek ditjenbun - penerbitan SK Dirut BPDP"

---

## Background & Context

Saat ini, pada halaman tracking pengusulan (`TrackingPengusulanView.vue`), alur posisi pengajuan (workflow timeline) ditampilkan menggunakan grid sederhana berisi kotak status. Tampilan ini kurang menggambarkan progres/aliran langkah terhubung (*step progress*) secara intuitif dan modern, serta memiliki wording status yang kurang sesuai dengan regulasi terbaru.

Fitur ini bertujuan untuk mendesain ulang workflow timeline tersebut menjadi **step view (stepper)** yang terhubung secara visual, di mana setiap langkah menunjukkan posisi pengajuan saat ini dengan jelas (apakah langkah tersebut sudah selesai, sedang berjalan, atau belum dimulai). Selain itu, wording pada tiap langkah juga diselaraskan dengan kebutuhan terbaru pengguna.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Tampilan Stepper Terhubung yang Responsif (Priority: P1)

Sebagai Pemohon (Pekebun/Lembaga), saat saya membuka halaman detail usulan, saya ingin melihat progres pengajuan saya disajikan dalam bentuk **stepper step view** yang terhubung dengan garis visual yang jelas, baik di perangkat mobile maupun desktop.

**Why this priority**: Mengubah representasi visual dari grid menjadi step progress adalah kebutuhan utama pengguna agar progres terlihat mengalir.
**Independent Test**: Buka halaman tracking pengusulan pada resolusi desktop dan mobile. Verifikasi bahwa stepper terhubung dengan garis kontinu dan beradaptasi dengan baik pada lebar layar (mobile-first design).

**Acceptance Scenarios**:
1. **Given** pengguna membuka detail usulan, **When** halaman dirender di desktop, **Then** stepper ditampilkan secara horizontal dengan garis penghubung antar lingkaran nomor langkah.
2. **Given** pengguna membuka detail usulan, **When** halaman dirender di mobile (viewport <= 768px), **Then** stepper bertransformasi secara vertikal (stacked) atau horizontal scrollable/wrap yang rapi tanpa menyebabkan overflow layar.
3. **Given** langkah status saat ini, **When** langkah tersebut sedang aktif (*in-progress*), **Then** lingkaran langkah menunjukkan indikator visual aktif (seperti pulse animation, warna border/background khusus, atau label "Sedang Diproses").

---

### User Story 2 — Penyelarasan Wording & Pemetaan Status yang Akurat (Priority: P2)

Sebagai pengguna sistem, saya ingin status pengajuan dipetakan ke dalam 5 langkah dengan wording baru sebagai berikut:
1. **Submit Proposal** (sebelumnya: Submit Pemohon)
2. **Verifikasi Dinas Kab/Kota** (sebelumnya: Rekomtek Kab/Kota)
3. **Asistensi Dinas Provinsi** (sebelumnya: Validasi Provinsi / Asistensi Provinsi)
4. **Penerbitan Rekomtek Ditjenbun** (sebelumnya: SK Ditjenbun)
5. **Penerbitan SK Dirut BPDP** (sebelumnya: Penyaluran BPDP)

**Why this priority**: Menyelaraskan dengan istilah proses administrasi sarana prasarana yang resmi.
**Independent Test**: Periksa penamaan kelima langkah pada stepper dan pastikan status logis usulan memicu pewarnaan aktif/selesai pada langkah yang sesuai.

**Acceptance Scenarios**:
1. **Given** proposal baru saja diajukan (`SUBMITTED`), **When** stepper dirender, **Then** Langkah 1 bertanda selesai (Green Check/Active), Langkah 2-5 berstatus pending (Grey/Neutral).
2. **Given** proposal berada pada status `REKOMTEK_KAB_ISSUED` atau `VERIFIED_ADMIN`/`VERIFIED_FIELD`, **When** stepper dirender, **Then** Langkah 1 selesai (Green), Langkah 2 aktif/selesai, dan Langkah 3-5 pending.
3. **Given** proposal berada pada status `VALIDATED_PROV`, **When** stepper dirender, **Then** Langkah 1 & 2 selesai, Langkah 3 aktif/selesai, Langkah 4 & 5 pending.
4. **Given** proposal berada pada status `SK_DITJENBUN_ISSUED`, **When** stepper dirender, **Then** Langkah 1, 2, & 3 selesai, Langkah 4 aktif/selesai, Langkah 5 pending.
5. **Given** proposal berada pada status `PKS_BPDP_SIGNED`, `DISBURSED`, atau `COMPLETED`, **When** stepper dirender, **Then** Langkah 1 s.d. 5 berstatus selesai (Semua Green).

---

## Requirements

### Functional Requirements

- **FR-001**: Sistem HARUS mengganti tampilan grid timeline di `TrackingPengusulanView.vue` dengan komponen stepper step progress terhubung.
- **FR-002**: Desain stepper HARUS menggunakan class Tailwind CSS yang bersih, mendukung dark mode, dan mematuhi standard accessibility WCAG AA.
- **FR-003**: Wording langkah-langkah stepper HARUS diubah menjadi:
  1. `Submit Proposal`
  2. `Verifikasi Dinas Kab/Kota`
  3. `Asistensi Dinas Provinsi`
  4. `Penerbitan Rekomtek Ditjenbun`
  5. `Penerbitan SK Dirut BPDP`
- **FR-004**: Pemetaan status untuk menentukan langkah aktif/selesai HARUS mengikuti logika berikut:
  - **Langkah 1 (Submit Proposal)**: Selesai jika status proposal minimal `SUBMITTED`.
  - **Langkah 2 (Verifikasi Dinas Kab/Kota)**: Selesai jika status proposal berada di `['REKOMTEK_KAB_ISSUED', 'VALIDATED_PROV', 'SK_DITJENBUN_ISSUED', 'PKS_BPDP_SIGNED', 'DISBURSED', 'COMPLETED']`. Aktif (In Progress) jika status proposal adalah `SUBMITTED` (sedang menunggu verifikasi kabupaten).
  - **Langkah 3 (Asistensi Dinas Provinsi)**: Selesai jika status proposal berada di `['VALIDATED_PROV', 'SK_DITJENBUN_ISSUED', 'PKS_BPDP_SIGNED', 'DISBURSED', 'COMPLETED']`. Aktif jika status proposal adalah `REKOMTEK_KAB_ISSUED`.
  - **Langkah 4 (Penerbitan Rekomtek Ditjenbun)**: Selesai jika status proposal berada di `['SK_DITJENBUN_ISSUED', 'PKS_BPDP_SIGNED', 'DISBURSED', 'COMPLETED']`. Aktif jika status proposal adalah `VALIDATED_PROV`.
  - **Langkah 5 (Penerbitan SK Dirut BPDP)**: Selesai jika status proposal berada di `['PKS_BPDP_SIGNED', 'DISBURSED', 'COMPLETED']`. Aktif jika status proposal adalah `SK_DITJENBUN_ISSUED`.
- **FR-005**: Setiap langkah stepper HARUS menampilkan nomor langkah, label wording yang disempurnakan, dan status visual yang mudah dibedakan (Completed: Hijau dengan ikon Check; Active: Border Emerald tebal dengan latar bersemangat/pulse; Pending: Abu-abu).

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Tampilan stepper menggantikan timeline lama 100% tanpa menyisakan kode visual grid lama.
- **SC-002**: Penggunaan media query Tailwind (`md:`) memastikan layout stepper responsif 100% (tidak ada overflow horizontal pada viewport mobile minimal 375px).
- **SC-003**: Wording pada stepper berubah total sesuai dengan yang didefinisikan pada FR-003.

---

## Assumptions

- Status proposal yang diambil dari store (`selectedProposal.currentStatus`) adalah representasi state terkini.
- Penggunaan ikon standard dari library `lucide-vue-next` (seperti `Check`, `Circle`, `Clock`, dll.) yang sudah ada di proyek.
