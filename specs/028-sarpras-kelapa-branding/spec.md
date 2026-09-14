# Feature Specification: sarpras-kelapa-branding

**Feature Branch**: `028-sarpras-kelapa-branding`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "/speckit-specify tolong wording kakao diganti kelapa dan juga unutu warna dibuat karaktrerisik kelapa karena yang kakao sudah"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Kelapa Branding & Color Theme Update (Priority: P1)

As a user (Pemohon, Dinas, BPDP), I want to see a cohesive coconut-themed green and sand/cream color scheme instead of cocoa brown, so that the application visually matches the "Kelapa" commodity.

**Why this priority**: Essential to align the application's visual identity with the target commodity (kelapa).

**Independent Test**:
Can be tested by running the application, checking all screens (Login, Dashboard, Form wizards, and Verifier queues), and confirming that:
1. No cocoa brown headers, backgrounds, borders, or highlights are visible.
2. The primary branding colors are fresh forest green and palm-themed light accents.

**Acceptance Scenarios**:
1. **Given** a user is on the Login page, **When** they view the card and backgrounds, **Then** the primary brand colors are kelapa green (`#066C2A`) instead of cocoa brown.
2. **Given** a user is on the Dashboard, **When** they view the welcome banner gradient, **Then** it transitions to a dark forest green instead of cocoa brown.

---

### User Story 2 - Wording Substitution from Kakao to Kelapa (Priority: P1)

As a user, I want all user-facing Indonesian text, descriptions, placeholders, and mock data to refer to "Kelapa" instead of "Kakao".

**Why this priority**: Critical to ensure text descriptions are accurate and relevant.

**Independent Test**:
Can be tested by reviewing the text content on the landing pages, forms, and mock proposal descriptions, confirming that all instances of "kakao", "Kakao", or "KAKAO" in display strings have been replaced by "kelapa", "Kelapa", or "KELAPA" respectively.

**Acceptance Scenarios**:
1. **Given** a user opens the Tracking Usulan page, **When** they view the subtitle, **Then** it reads "bantuan sarana prasarana kelapa" instead of "kakao".
2. **Given** a verifier reviews a proposal, **When** they view the commodity field, **Then** it displays "Kelapa" instead of "Kakao".

---

### Edge Cases

- **Key identifiers in code**: Legacy identifiers containing "KAKAO" (like `JenisSarpras.UPH_KAKAO` or `BPDP-KAKAO-` mock prefixes) should have their display text changed to Kelapa but their system keys preserved or safely renamed to ensure mock data routes do not break.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Replace all user-facing display labels, descriptions, and mock data values containing "kakao" / "Kakao" / "KAKAO" with "kelapa" / "Kelapa" / "KELAPA" across all components, store mocks, and localization files.
- **FR-002**: Update CSS variables in `src/assets/main.css` to represent coconut characteristics:
  - `--primary` (light mode): changed from cocoa brown to Kelapa Forest Green HSL `142 89% 22%` (corresponding to `#066C2A`).
  - `--secondary` (light mode): changed from cocoa light cream to Light Palm Green HSL `84 47% 95%` (corresponding to `#F1F8E9`).
  - `--primary` (dark mode): changed from dark cocoa brown to a slightly brighter Kelapa green HSL `142 60% 32%`.
  - `--ring`: updated to match the primary HSL variables.
- **FR-003**: Rebrand the custom Tailwind color extensions in `tailwind.config.js`:
  - `brand` primary color changed to `#066C2A` (Forest/Kelapa Green), dark to `#033B16`, and light to `#81C784`.
  - Replace the `cocoa` palette definitions with a `kelapa` theme:
    - DEFAULT: `#066C2A` (Kelapa Green)
    - light: `#81C784` (Light palm green)
    - dark: `#033B16` (Deep forest green)
    - accent: `#D2B48C` (Coconut shell tan/brown)
- **FR-004**: Replace any usages of the Tailwind classes `to-cocoa` and `text-cocoa-accent` in:
  - `src/views/DashboardView.vue` (change `to-cocoa` to `to-emerald-950`)
  - `src/components/ui/Sidebar.vue` (change `text-cocoa-accent` to `text-amber-500` or `text-[#D2B48C]`)
  - `src/components/ui/RoleSwitcher.vue` (change `text-cocoa-accent` to `text-amber-500`)

### Key Entities *(include if feature involves data)*

- **Theme Colors**: CSS variables and Tailwind config mapping coconut characteristics.
- **Display Strings**: Indonesian display copy containing commodity wording.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of display strings referencing "kakao" (case-insensitive) are updated to "kelapa" in all page views and components.
- **SC-002**: The application renders forest green primary branding styles on buttons, inputs, focus states, and cards across both themes.
- **SC-003**: The project builds successfully (`vite build`) and type-checks with zero errors.

## Assumptions

- Code-level enum keys (like `JenisSarpras.UPH_KAKAO`) can be kept to avoid breaking external routing, but their display strings are updated.
