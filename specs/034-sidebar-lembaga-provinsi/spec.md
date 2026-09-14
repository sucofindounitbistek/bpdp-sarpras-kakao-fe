# Feature Specification: Provincial Dinas Institutional Account Sidebar & List View (Sidebar Lembaga Provinsi)

**Feature Branch**: `034-sidebar-lembaga-provinsi`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Sidebar Provinsi penambahan sidebar lembaga /speckit-specify isinya list akun kelembagaan pekebun"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Institutional Accounts List in Provincial Dinas Sidebar (Priority: P1)

As a Provincial Dinas Officer (Dinas Provinsi), when navigating the application sidebar under the "DINAS PROVINSI" section, I want to see a new sidebar menu item named "Lembaga", so that I can click it to view and inspect all registered farmer organization accounts (Akun Kelembagaan Pekebun) within my province.

**Why this priority**: Core navigation and visibility requirement enabling Provincial Dinas officers to monitor registered farmer organization accounts (Kelompok Tani / Gapoktan / Koperasi / Kelembagaan Pekebun).

**Independent Test**: Can be tested independently by logging in as or switching role to `DINAS_PROV`, expanding the sidebar navigation, clicking "Lembaga", and confirming navigation to `/dinas/provinsi/lembaga` displaying the list of farmer organization accounts.

**Acceptance Scenarios**:

1. **Given** a user with active role `DINAS_PROV` (Dinas Provinsi), **When** they view the sidebar navigation under section "DINAS PROVINSI", **Then** a "Lembaga" menu item (with Building / Building2 icon) is rendered below existing items.
2. **Given** a user clicks the "Lembaga" menu item, **When** the route changes to `/dinas/provinsi/lembaga`, **Then** the page loads displaying the "Daftar Akun Kelembagaan Pekebun" view with data tables, search filter, and status badges.
3. **Given** the list of institutional accounts, **When** the officer uses the search input or district/city (Kabupaten/Kota) filter dropdown, **Then** the table filters records in real-time.

---

### User Story 2 - View Institutional Account Details & Status (Priority: P2)

As a Provincial Dinas Officer, when viewing a specific farmer organization in the list, I want to view detailed organization information (Nama Lembaga, Jenis Kelembagaan, Penanggung Jawab, NIB/SK, Alamat/Kabupaten, Jumlah Anggota, Status Verifikasi), so that I have complete institutional context.

**Why this priority**: Enhances administrative oversight and verification capabilities for provincial officers.

**Independent Test**: Click the "Detail" / "Lihat" action button on an institutional account row and confirm a detail modal or expanded view displays complete organization credentials.

**Acceptance Scenarios**:

1. **Given** an institutional account row in the table, **When** the officer clicks the detail action button, **Then** a detail modal or slide-over opens presenting complete organization credentials and contact details.

---

### Edge Cases

- **Empty State**: What happens if no farmer organizations exist for the selected district filter? The view displays an empty table state ("Belum ada akun kelembagaan pekebun terdaftar di wilayah ini.").
- **Role Scoping**: Is the "Lembaga" sidebar item hidden for non-Provincial Dinas roles? Yes, it MUST strictly be visible only when active role includes `DINAS_PROV` or `ALL`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add the "Lembaga" menu item to the `DINAS_PROV` section in `src/composables/useNavigation.ts` pointing to route `/dinas/provinsi/lembaga`.
- **FR-002**: System MUST register the route `/dinas/provinsi/lembaga` in `src/router/index.ts` mapping to a new view component `src/views/dinas/provinsi/LembagaProvinsiView.vue`.
- **FR-003**: System MUST display a structured, searchable data table of farmer organization accounts (`LembagaPekebun`) including columns: Nama Lembaga, Jenis Kelembagaan, Kabupaten/Kota, Penanggung Jawab / Ketua, Kontak, and Status Akun.
- **FR-004**: System MUST provide real-time search filtering (by organization name, NIB/SK, or leader name) and district (Kabupaten) dropdown filtering.
- **FR-005**: All UI titles, table headers, filter placeholders, and status badges MUST be externalized into `src/config/localization.ts`.

### Key Entities *(include if feature involves data)*

- **LembagaPekebun**: Institutional entity containing `id`, `namaLembaga`, `jenisLembaga` (Kelompok Tani / Gapoktan / Koperasi / Kelembagaan Pekebun), `kabupatenNama`, `ketuaNama`, `kontak`, `statusVerifikasi`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Provincial Dinas officers can access the Institutional Accounts page in 1 click from the sidebar.
- **SC-002**: Table search and district filtering respond in <100ms.
- **SC-003**: Zero TypeScript errors (`npx vue-tsc -b`) and 100% adherence to UI/UX Pro Max design guidelines.

## Assumptions

- Uses existing mock/Pinia store institutional data or `usePekebunStore` / `usePengusulanStore` lembaga references.
- Uses `Building2` icon from `lucide-vue-next` for the sidebar menu item.
