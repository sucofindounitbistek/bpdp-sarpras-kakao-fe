# Feature Specification: Externalize Localization Wording

**Feature Branch**: `019-externalize-wording`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "bisa ga ya wording2 ini dibuat jadi 1 file language gitu supaya tinggal edit2 aja. jadi tolong /speckit-constitution buat aturan dimana setiap wording dimasukkan kedalam language"

---

## Background & Context

Saat ini, teks label alur dokumen (stepper timeline) dan label status verifikasi tersebar langsung di dalam komponen Vue (hardcoded). Ketika ada perubahan kata/frasa (wording), pengembang harus mencari dan mengubah kode di berbagai komponen individu.

Dengan memusatkan semua teks label, penamaan alur, pesan status, toaster, dan deskripsi halaman ke dalam satu file konfigurasi bahasa (lokalisasi) pusat, pemeliharaan teks menjadi sangat mudah dan tidak rentan terhadap inkonsistensi.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pengelolaan Wording Terpusat (Priority: P1)

Sebagai Administrator / Pengembang Sistem, saya ingin semua teks label alur pengusulan dan label status antrean verifikasi disimpan dalam satu file konfigurasi lokalisasi khusus, sehingga perubahan teks di kemudian hari dapat diselesaikan hanya dengan mengubah file tersebut tanpa menyentuh file tampilan komponen.

**Why this priority**: Menjawab kebutuhan utama pengguna untuk memudahkan penyesuaian wording secara terpusat.
**Independent Test**: Ubah salah satu nilai teks di dalam file lokalisasi terpusat (misal label stepper pertama menjadi "Kirim Proposal Baru"). Muat ulang aplikasi dan verifikasi perubahan tersebut otomatis tercermin pada halaman pelacakan proposal dan antrean dinas.

**Acceptance Scenarios**:
1. **Given** pengembang mengubah nilai status `SUBMITTED` menjadi `Menunggu Proses Verifikasi` di file lokalisasi, **When** halaman antrean verifikasi dibuka, **Then** status badge menampilkan label baru tersebut.
2. **Given** pengembang mengubah label tahapan rekomtek kabupaten di file lokalisasi, **When** halaman pelacakan usulan dibuka, **Then** lingkaran alur stepper menampilkan nama tahapan yang diperbarui.

---

## Requirements

### Functional Requirements

- **FR-001**: Sistem HARUS menyediakan file konfigurasi lokalisasi terpusat (misalnya di `src/config/localization.ts` atau `src/locales/id.ts`) yang mengekspor seluruh kamus terjemahan wording.
- **FR-002**: Komponen pelacakan usulan (`TrackingPengusulanView.vue`) HARUS mengambil label tahapan stepper dan label status alur dari file lokalisasi terpusat.
- **FR-003**: Komponen antrean kabupaten (`QueueVerifikasiKabView.vue`) HARUS mengambil label status antrean dan variant badge dari file lokalisasi terpusat.
- **FR-004**: Struktur kamus kata lokalisasi HARUS bertipe TypeScript ketat untuk menghindari kesalahan penulisan key (typo) saat dipanggil di komponen.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% hardcoded teks wording untuk alur timeline proposal dan status antrean dipindahkan ke file lokalisasi pusat.
- **SC-002**: Waktu yang dibutuhkan untuk mengubah wording di seluruh aplikasi berkurang menjadi hanya memodifikasi 1 baris di file lokalisasi pusat.

---

## Assumptions

- Aplikasi saat ini menggunakan bahasa tunggal (Bahasa Indonesia), sehingga lokalisasi terpusat akan menggunakan format config objek TypeScript yang diekspor secara statis tanpa memerlukan library i18n pihak ketiga yang kompleks.
