# Research & Audit: Skeleton Loading Coverage

This document outlines the findings of the audit conducted across all active views in the application and defines the loading state strategy for each component.

## Target Views Audit & Spacing Analysis

| Target View | Current Spacing & Structure | Loading State Strategy |
|-------------|----------------------------|------------------------|
| `QueueVerifikasiKabView.vue` | Header + Table Card | Display card header, replace table rows with 4 row-skeletons during page hydration. |
| `DetailVerifikasiKabView.vue` | Header + Wizard Steps + Form | Replace detail body with 2 card placeholders (`h-60` and `h-40`) to prevent cumulative layout shift. |
| `QueueVerifikasiProvinsiView.vue` | Header + Table Card | Display card header, render 4 row-skeletons inside table wrapper. |
| `DetailVerifikasiProvinsiView.vue` | Header + Wizard Steps + Form | Replace detail body with 2 skeleton cards matching the kabupaten detail view. |
| `PenetapanPlenoView.vue` | Header + Split Grid (Form + List) | Display header, replace split grid layout with side-by-side skeleton blocks. |
| `SKPenetapanView.vue` | Header + Document Status Card | Replace status card with a single rounded `h-72` card placeholder. |
| `PenerbitanSKView.vue` | Header + Progress Stepper + Form | Replace body container with stepper and form loading placeholders. |
| `UserManagementView.vue` | Header + Split Panel (Form + List) | Replace list panel and form panel with dual card skeleton loaders. |
| `PenyaluranDanaView.vue` | Header + Grid Cards + Table | Replace grid and table rows with matching layout block loaders. |
| `PelaporanBASTView.vue` | Header + File Dropzone Form | Replace form container with `h-80` dropzone loader. |
| `TrackingPengusulanView.vue` | Header + Search Filter + Table | Keep search inputs, replace table content with row skeletons. |
| `PengajuanProposalView.vue` | Header + Document Stepper | Replace main body with stepper card skeletons. |
| `RevisiProposalView.vue` | Header + Form Cards | Replace validation forms with layout cards. |

## Resusable Skeleton Component Audit

The existing [Skeleton.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/components/ui/Skeleton.vue) supports the following optional parameters:
* `width` (default `100%`)
* `height` (default `1rem`)
* `customClass` (merged via `cn` helper)

No new components are required. We will import `<Skeleton />` directly from `@/components/ui/Skeleton.vue`.

## Loading Lifecycle Integration

To simulate server-side latency and ensure a smooth visual experience:
1. Initialize a reactive variable `const pageLoading = ref(true)`.
2. Within the page `onMounted` lifecycle hook, trigger the store data fetching actions.
3. Wrap transition cleanup in a `setTimeout` of 400ms:
   ```typescript
   onMounted(async () => {
     await fetchData();
     setTimeout(() => {
       pageLoading.value = false;
     }, 400);
   });
   ```
4. Bind elements reactively via `v-if="pageLoading"` / `v-else` blocks.
