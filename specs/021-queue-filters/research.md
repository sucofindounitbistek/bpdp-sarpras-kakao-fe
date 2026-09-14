# Research: Verification Queue Filters

## Decision: Reusable Queue Filter Component
- Instead of copying filter markup across 4 separate view files (Kabupaten, Provinsi, Ditjenbun, BPDPKS), we will implement a reusable component `src/components/ui/QueueFilter.vue`.
- This component will encapsulate:
  - Text search input (integrated with Lucide `Search` icon).
  - Status select dropdown.
  - Jenis Sarpras select dropdown.
  - "Reset Filter" button (which renders only if any filter value is active).
- **Event Flow**:
  - The component takes a reactive state object (FilterState) and emits updates or updates via Vue 3 `v-model` binding parameters: `v-model:search`, `v-model:status`, and `v-model:jenisSarpras`.

## Statuses Mapping
- **Status options**:
  - Since the user selected Option B (Global status filter options), the dropdown will list all proposal statuses available in the localization configuration (`proposalStatus` in `localization.ts` containing DRAFT, SUBMITTED, REVISION_ADMIN, etc.).
- **Jenis Sarpras options**:
  - The dropdown will list all 17 categories defined in the localization configuration (`jenisSarpras` in `localization.ts`).

## Visual Polish & Mobile Compatibility
- Desktop view aligns all controls horizontally in a single row using flex grid.
- Mobile view wraps controls vertically (`flex flex-col`), ensuring comfortable click targets of at least 44x44px and zero horizontal overflow.
