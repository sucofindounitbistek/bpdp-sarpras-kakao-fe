# Feature Specification: Skeleton Loading Component & State Hydration

**Feature Branch**: `003-skeleton-loading`

**Created**: 2026-07-30

**Status**: Approved & Ready for Implementation / Aligned with Constitution Principle XII (v2.3.0)

**Input**: User request: "jangan lupa buat skeleton. lalu implementasikan skeletonnya ya"

---

## Business Goal & Scope

Penerapan komponen **Skeleton Loader Primitives (`Skeleton.vue`)** pada seluruh modul dashboard, kartu metrik, tabel direktori pengguna, antrean verifikasi dinas, serta formulir pengusulan sarpras.

Fitur ini menjamin bahwa saat data sedang di-load, di-fetch, atau ketika role pengguna berpindah, sistem menampilkan animasi *pulse* Skeleton loader yang presisi sesuai geometri tampilan (mencegah *Cumulative Layout Shift* / CLS dan layar kosong/putih).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Skeleton Loader Status Hydration pada Dashboard & Switch Role (Priority: P1) 🎯 MVP

Sebagai Pengguna / Peninjau Aplikasi, saya ingin melihat animasi Skeleton Loader saat berpindah role atau saat halaman dashboard dimuat, sehingga transisi visual terasa sangat responsif dan mulus tanpa mengalami *layout shift*.

**Acceptance Scenarios**:

1. **Given** Pengguna berada di Dashboard, **When** mengubah role simulasi pada topbar header, **Then** kartu metrik dan grafik secara singkat (300-500ms) menampilkan Skeleton Loader sebelum data role baru terisi penuh.
2. **Given** Komponen Skeleton Loader sedang aktif, **When** melihat tampilan dalam mode gelap (*Dark Mode*), **Then** Skeleton Loader menyesuaikan warna latar ke `bg-slate-800/80` yang selaras dengan tema.

---

### User Story 2 - Skeleton Loading pada Tabel Data & Form CPCL (Priority: P2)

Sebagai Pengurus Lembaga Pekebun / Admin BPDPKS, saya ingin melihat Skeleton Loader pada area tabel user management dan form CPCL saat data pertama kali dimuat.

**Acceptance Scenarios**:

1. **Given** Pengguna membuka halaman User Management atau Verifikasi Dinas, **When** data tabel sedang dimuat, **Then** baris-baris tabel menampilkan animasi Skeleton pulse.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Komponen `Skeleton.vue` MUST mendukung kustomisasi `width`, `height`, `rounded`, dan `customClass`.
- **FR-002**: `Skeleton.vue` MUST mematuhi skema warna Light Mode (`bg-slate-200/80`) dan Dark Mode (`dark:bg-slate-800/80`).
- **FR-003**: `MetricCards.vue` MUST menampilkan Skeleton Cards saat `isLoading` aktif atau saat role di-switch.
- **FR-004**: `UserDirectoryTable.vue`, `CPCLForm.vue`, dan tabel verifikasi dinas MUST mendukung Skeleton loading rows.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cumulative Layout Shift (CLS) = 0 saat komponen berpindah dari state loading ke data terisi.
- **SC-002**: 100% komponen tabel dan kartu metrik memiliki Skeleton loader pengganti.
- **SC-003**: Transisi tema Light & Dark Mode pada Skeleton Loader 100% harmonis.
