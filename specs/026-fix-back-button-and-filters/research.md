# Research Notes: fix-back-button-and-filters

## Navigation and Filter Architecture Decisions

### 1. Dinas Kabupaten Wizard "Kembali" Destination
- **Decision**: Change the handler `@click="verifikasiStore.currentStep = 2"` to `verifikasiStore.currentStep = 1`.
- **Rationale**: The step config in `DetailVerifikasiKabView.vue` does not contain step ID 2 (the steps are 1: Verifikasi Pekebun & Dokumen, 3: SK CPCL, 4: Summary & Submit). Setting `currentStep = 2` unmounts all active steps and results in a blank view. Setting it to 1 returns the user to the first step successfully.
- **Alternatives considered**: Adding a dummy Step 2 component. Rejected because it would introduce a useless step and violate simple navigation flows.

### 2. Status Option Deduplication
- **Decision**: Filter options in `QueueFilter.vue` and `TrackingPengusulanView.vue` will be deduplicated by their localized label before rendering.
- **Rationale**: `LOCALIZATION.proposalStatus` has duplicate values for different status codes (e.g. `SUBMITTED`, `VERIFIED_ADMIN`, `VERIFIED_FIELD` all map to 'Verifikasi Dinas Kab/Kota'). Rendering them directly creates multiple options with the same text. Deduplicating by label ensures a clean, unique dropdown.
- **Alternatives considered**: Keeping duplicate options but appending status code keys. Rejected because it exposes raw DB keys to end-users and is visually cluttered.

### 3. Match Logic for Deduplicated Filters
- **Decision**: Match proposals by comparing their status *labels* instead of status *keys*.
- **Rationale**: If we choose the option representing "Verifikasi Dinas Kab/Kota", its bound value is the first key (e.g. `SUBMITTED`). We want to display all proposals having status `SUBMITTED`, `VERIFIED_ADMIN`, or `VERIFIED_FIELD`. By comparing `getStatusLabel(item.currentStatus) === getStatusLabel(filterStatus.value)`, we match all proposals that map to the selected label.
- **Alternatives considered**: Maintaining a mapping of status keys to groups. Rejected because comparing labels is more elegant, maintains clean code, and leverages existing localization mappings directly.

### 4. Custom Filters for Ditjenbun and BPDP
- **Decision**: Pass custom status options to `QueueFilter.vue` as a prop in `AntreanRekomtekView.vue` and `AntreanBpdpView.vue`.
- **Rationale**: Ditjenbun and BPDP workflows use different status codes and labels (`UsulanStatus`) from the default `proposalStatus`. Hardcoding default options in the reusable `QueueFilter.vue` broke filtering in these dashboards. Allowing custom props solves this issue cleanly.
