# Research & Technical Decisions: Multi-Lahan Pekebun

## 1. Local State vs Store array

To support multiple lands in the Farmer Wizard (Step 3):
- We change the Vue model binding in `StepDataLahanPekebun.vue` from `modelValue: LahanFormData` to `modelValue: LahanFormData[]`.
- In `FormPekebunView.vue`, we initialize `lahanDataList` as a ref array `LahanFormData[]` instead of a singular object.
- The `Pekebun` interface is updated to add `daftarLahan?: LahanPekebun[]` while keeping `lahan: LahanPekebun` for backward compatibility. This prevents any existing code (like lists or details) from crashing.

## 2. In-Line Accordion & Tab Workload Division

To prevent vertical scroll bloat and Leaflet map instance collisions:
- Only **one** land form is active (expanded) for editing/creation at any time.
- Inside the active land form, inputs are split into three tabs:
  - **Tab 1: Legalitas**
  - **Tab 2: Alamat & Berkas**
  - **Tab 3: Poligon Lahan (Peta)**
- **Leaflet Map Initialization Rule**: The Leaflet map instance is instantiated *only* when the "Poligon Lahan" tab is active. It is mounted inside a target div and destroyed when switching tabs or collapsing the accordion. This prevents rendering bugs, incorrect container sizing (Leaflet gray area bug), and high memory consumption.

## 3. Zod Array Validation

To validate the multi-lahan list:
- We define a new validator in `src/schemas/pekebun.schema.ts`:
  ```typescript
  export const lahanPekebunListSchema = z.array(lahanPekebunSchema).min(1, 'Minimal harus mengisi 1 data lahan');
  ```
- During wizard onSubmit, we validate the array. Any errors are mapped by index to display them on the corresponding land card.

## 4. Alternatives Considered

- **Multiple full forms stacked vertically**: Rejected because it creates a massive scrollbar and makes coordinates/map management highly confusing for users.
- **Form Modals**: Rejected because Leaflet maps inside modals frequently suffer from incorrect container size rendering (partial map tiles loading) and make editing poligon coordinates cramped.
