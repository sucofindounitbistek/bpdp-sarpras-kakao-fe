# Research: Master Data Pekebun

**Branch**: `004-master-data-pekebun` | **Date**: 2026-07-30

## Research Tasks

### 1. Multi-Step Form Pattern (Existing Codebase)

**Decision**: Reuse the existing multi-step form pattern established in `FormPengusulanView.vue` and the `useFormWizard` composable.

**Rationale**: The project already has a proven, working multi-step form pattern with `useFormWizard.ts` providing step navigation (goNext, goBack, goToStep), `StepIndicator.vue` for visual step progress, and per-step Vue SFC components. Reusing this pattern ensures consistency and reduces implementation time.

**Alternatives considered**:
- Building a new wizard system from scratch — rejected (YAGNI, Constitution V)
- Using a third-party form wizard library — rejected (unnecessary dependency, Constitution V)

---

### 2. Dukcapil Lookup Simulation

**Decision**: Simulate Dukcapil lookup entirely in the frontend using a Pinia store with hardcoded mock data. The lookup function accepts a 16-digit NIK and returns mock identity data (name, KK number, marital status, birthplace/date) after a simulated delay.

**Rationale**: Per Constitution XIII and clarification Q3, backend endpoints are not yet available. The mockup pattern is already established in the codebase (e.g., `pengusulan.ts` store uses inline mock data). The simulation must be clearly labeled with code comments indicating it is a client-simulated integration.

**Alternatives considered**:
- Waiting for backend API — rejected (blocks frontend development, Constitution XIII mandates mockup delivery)
- Using a real third-party Dukcapil sandbox API — rejected (requires API keys, network dependency, out of scope for mockup)

---

### 3. Cascading Wilayah Dropdown Data

**Decision**: Use a static mock dataset embedded in the Pinia store representing a small sample of Indonesian regions (2-3 provinces, with nested kabupaten/kecamatan/desa). The cascading behavior (select province → filter kabupaten, etc.) will be implemented with reactive computed properties.

**Rationale**: Full Indonesian wilayah data is ~300KB+ and not needed for a mockup. A small representative dataset demonstrates the cascading pattern effectively and can be swapped for a real API call later.

**Alternatives considered**:
- Bundling full wilayah JSON (~80,000 desa) — rejected (bloats bundle, unnecessary for mockup)
- Using an external API — rejected (same reason as Dukcapil: backend not ready)

---

### 4. File Upload Simulation

**Decision**: Reuse the existing `FileUpload.vue` component for image uploads (KTP, KK, Swafoto) and PDF uploads (Surat Kuasa, Scan Legalitas). Files will be stored in component state as `File` objects with preview URLs generated via `URL.createObjectURL`. No actual server upload occurs in the mockup.

**Rationale**: `FileUpload.vue` already exists in the project and handles drag-and-drop, file type validation, and size limit checks. This is consistent with the existing upload pattern in `StepUploadDokumen.vue`.

**Alternatives considered**:
- Building a new upload component — rejected (existing component is sufficient)

---

### 5. NIK Uniqueness Validation

**Decision**: Validate NIK uniqueness against the in-memory list of registered Pekebun in the Pinia store. When a user enters a NIK, the store checks if any existing Pekebun record shares the same NIK and returns an error message if found.

**Rationale**: With no backend, the Pinia store is the single source of truth for mockup data. This approach mirrors how `pengusulan.ts` store manages its list data.

**Alternatives considered**:
- Skip uniqueness validation in mockup — rejected (key UX requirement from clarification Q2)

---

### 6. Document Template Downloads (.docx)

**Decision**: Place placeholder .docx files in `/public/templates/` directory. Download buttons will use standard `<a>` tags with `download` attribute pointing to these static files.

**Rationale**: Per clarification Q5, the user chose .docx format. Static files in `/public/` are served directly by Vite's dev server and production builds without any build processing.

**Alternatives considered**:
- Generating .docx dynamically with a library — rejected (YAGNI, placeholder files are sufficient for mockup)

---

## All NEEDS CLARIFICATION: Resolved ✅

No remaining unknowns. All technical decisions are documented above.
