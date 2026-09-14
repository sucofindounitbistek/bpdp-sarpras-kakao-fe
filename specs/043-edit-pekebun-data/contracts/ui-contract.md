# UI & Integration Contract: Edit Data Pekebun

## Route Path Contract
- **Path**: `/master-data/pekebun/edit/:id`
- **Params**: `id` - string representing the registered pekebun ID
- **Roles Allowed**: `['PEMOHON']`

## Component Interaction Controls

### 1. `PekebunListView.vue` Actions
- For registered pekebuns (where `isDraft` is falsy):
  - Renders a green Edit button: `Button size="sm" variant="outline" class="p-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"`
  - Icon: `FileEdit` from `lucide-vue-next`
  - Clicking this navigates to the edit path.

### 2. `DetailPekebunModal.vue` Footer
- Renders an "Edit Data" button: `Button variant="outline" size="md" class="border-[#066C2A] text-[#066C2A] hover:bg-emerald-50"`
- Clicking this triggers an `@edit` event, which the parent handles by navigating to the edit path.

### 3. `FormPekebunView.vue` Wizard Footer
- Conditionally hides "Simpan Draft" button if editing a registered (non-draft) record.
