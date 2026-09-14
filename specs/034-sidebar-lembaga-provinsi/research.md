# Research: Provincial Dinas Institutional Account Sidebar & List View (034-sidebar-lembaga-provinsi)

## Problem Statement & Context
Provincial Dinas officers (Dinas Provinsi) need dedicated navigation and oversight over registered farmer organizations (Kelompok Tani / Gapoktan / Koperasi / Kelembagaan Pekebun) operating within their province. A new "Lembaga" item under the "DINAS PROVINSI" section in the sidebar will route officers to `/dinas/provinsi/lembaga` (`LembagaProvinsiView.vue`).

## Technical Decisions & Rationale

### 1. Navigation Item & Icon
- **Decision**: Use `Building2` icon from `lucide-vue-next` for the "Lembaga" navigation item in `src/composables/useNavigation.ts`.
- **Rationale**: `Building2` clearly communicates institutional/organizational entities and aligns with standard Lucide icon usage in the application.

### 2. Route & View Component
- **Decision**: Add route `/dinas/provinsi/lembaga` with `name: 'dinas-provinsi-lembaga'` in `src/router/index.ts` mapping to lazy-loaded `@/views/dinas/provinsi/LembagaProvinsiView.vue`.
- **Rationale**: Keeps router structure modular and consistent with existing provincial routes (`/dinas/verifikasi/provinsi`).

### 3. Institutional Account Data Provider
- **Decision**: Create mock data structure for registered farmer organization accounts (`LembagaPekebun`) with search & district filtering in `LembagaProvinsiView.vue`.
- **Rationale**: Enables instant real-time filtering (by organization name, leader/ketua, NIB/SK, and district/kabupaten) while ensuring fast load times (<100ms).

### 4. Detail Modal & Metadata Inspection
- **Decision**: Render a slide-over/modal in `LembagaProvinsiView.vue` displaying full organization profile: Nama Lembaga, Jenis (Kelompok Tani/Gapoktan/Koperasi), NIB/SK Hukum, Penanggung Jawab / Ketua, Email & Phone, Alamat & Wilayah, Jumlah Anggota, and Status Akun.
- **Rationale**: Complies with UI/UX Pro Max standards for high-density administrative dashboards.

## Alternatives Considered
- **Combining with Pekebun List View**: Rejected because individual farmers (Pekebun) and institutional organization accounts (Lembaga) have distinct administrative scopes and document verification lifecycles.
