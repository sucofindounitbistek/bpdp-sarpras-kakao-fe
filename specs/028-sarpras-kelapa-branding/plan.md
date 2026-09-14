# Implementation Plan: Rebranding from Kakao to Kelapa

This feature modifies all user-facing wording from "Kakao" to "Kelapa" and rebrands the application's visual styling to match coconut characteristics (deep green and sand/cream tones) instead of cocoa brown.

## Proposed Changes

### Styling and Themes

#### [MODIFY] [main.css](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/assets/main.css)
* Replace `--primary` (light and dark mode) and `--secondary` (light mode) with coconut-themed HSL color variables:
  * `--primary` (light): `142 89% 22%` (representing `#066C2A` green)
  * `--secondary` (light): `84 47% 95%` (representing `#F1F8E9` light palm green/cream)
  * `--primary` (dark): `142 60% 32%` (lighter green for contrast)
  * `--ring`: match primary green HSL values.

#### [MODIFY] [tailwind.config.js](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/tailwind.config.js)
* Rebrand the custom `brand` color keys to coconut green and palm values.
* Replace the `cocoa` color map with a `kelapa` color map defining:
  * `DEFAULT`: `#066C2A`
  * `light`: `#81C784`
  * `dark`: `#033B16`
  * `accent`: `#D2B48C` (Tan/Husk brown)

---

### UI Wording & Component Layouts

#### [MODIFY] [Sidebar.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/components/ui/Sidebar.vue)
* Change header title text from "Kakao" to "Kelapa".
* Update class `text-cocoa-accent` to `text-amber-500` or `text-[#D2B48C]`.

#### [MODIFY] [RoleSwitcher.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/components/ui/RoleSwitcher.vue)
* Update class `text-cocoa-accent` to `text-amber-500`.

#### [MODIFY] [DashboardView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/DashboardView.vue)
* Change text copy referencing "kakao" / "Kakao" to "kelapa" / "Kelapa".
* Update CSS gradient class `to-cocoa` to `to-emerald-950`.

#### [MODIFY] [LoginView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/LoginView.vue)
* Rebrand header text "BPDP Sarpras Kakao" to "BPDP Sarpras Kelapa".
* Change initial login user profile names containing "Kakao" to "Kelapa".

#### [MODIFY] [SKPenetapanView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/ditjenbun/SKPenetapanView.vue)
* Change mock SK number "SK-DITJENBUN/SARPRAS/KAKAO/2026/088" to "SK-DITJENBUN/SARPRAS/KELAPA/2026/088".
* Update description labels to "kelapa".

#### [MODIFY] [AntreanRekomtekView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/ditjenbun/AntreanRekomtekView.vue)
* Replace mock descriptions from "kakao" to "kelapa".

#### [MODIFY] [FormPengusulanView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/pengusulan/FormPengusulanView.vue)
* Replace text description "bantuan sarana & prasarana kakao" with "bantuan sarana & prasarana kelapa".

#### [MODIFY] [TrackingPengusulanView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/pengusulan/TrackingPengusulanView.vue)
* Replace text subtitle "bantuan sarana prasarana kakao" with "bantuan sarana prasarana kelapa".

#### [MODIFY] [StepProfilLembaga.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/pengusulan/StepProfilLembaga.vue)
* Update placeholder "Koperasi Tani Kakao Sejahtera" to "Koperasi Tani Kelapa Sejahtera".

#### [MODIFY] [PekebunListView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/master-data/PekebunListView.vue)
* Update table description "pekebun kakao" to "pekebun kelapa".

#### [MODIFY] [PengajuanProposalView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/pemohon/PengajuanProposalView.vue)
* Substitute package selection options and descriptions from "Kakao" to "Kelapa".

---

### Mocks and Data Stores

#### [MODIFY] [rekomtek.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/stores/rekomtek.ts)
* Change commodity (`komoditas`) values in mock records from "Kakao" to "Kelapa".
* Update mock group names ("Kelompok Tani Kakao Mandiri", "Kelompok Tani Tunas Kakao", "Kelompok Tani Kakao Sejahtera", "Kelompok Tani Kakao Lestari") to Kelapa equivalents.
* Update crop type labels (`jenisBibit`) from "Kakao Lindak"/"Kakao Mulia" to "Kelapa Dalam"/"Kelapa Genjah".
* Update RAB details ("Bibit kakao hibrida", "Alat fermentasi kakao", "Alat pengering kakao") to "Bibit kelapa hibrida", "Alat fermentasi kelapa", etc.

#### [MODIFY] [pengusulan.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts)
* Replace mock descriptions and receipt numbers (e.g. `BPDP-KAKAO-` to `BPDP-KELAPA-`).
* Update mock organization names ("Koperasi Tani Kakao Sejahtera", "Koperasi Kakao Makmur") to Kelapa equivalents.

#### [MODIFY] [users.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/stores/users.ts)
* Update mock user names ("Koperasi Kakao Prima") to Kelapa equivalents.

---

### Auditing & Queue Mocks

#### [MODIFY] [DetailVerifikasiProvinsiView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue)
* Change mock proposal names in activity logs to Kelapa equivalents.

#### [MODIFY] [DetailVerifikasiKabView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/DetailVerifikasiKabView.vue)
* Change mock proposal names in activity logs to Kelapa equivalents.

#### [MODIFY] [ProvVerifikasiView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/dinas/ProvVerifikasiView.vue)
* Update Gapoktan name in mock verifications to Kelapa equivalent.

## Verification Plan

### Automated Tests
* None. Correctness will be verified via type checking and manual UI review.

### Manual Verification
1. Open the application.
2. Verify that the primary button styles, text inputs, and sidebar logos are colored Forest/Kelapa Green.
3. Verify that the text reads "Sarpras Kelapa" across Login, Dashboard, Forms, and Verifier queues.
4. Verify that the Dashboard welcome banner displays a green gradient.
5. Verify that type check `npx vue-tsc --noEmit` and build `npm run build` pass cleanly.
