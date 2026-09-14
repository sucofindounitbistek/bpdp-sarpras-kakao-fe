# Research & Technical Decisions: Edit Data Pekebun

## Decisions

### Decision 1: Loading Registered Pekebun Details
- **Choice**: Use the existing `store.resumeDraft(id)` store method to load details of registered pekebuns.
- **Rationale**: The `resumeDraft` method fetches the pekebun by ID and retrieves its associated lands. This matches exactly what is needed to populate the Form Wizard.

### Decision 2: Disabling "Simpan Draft" for Registered Records
- **Choice**: Hide the "Simpan Draft" action in the wizard footer if `isEditingRegistered` is true.
- **Rationale**: A registered record should not be downgraded back to a draft status.

### Decision 3: Exposing edit pathways
- **Choice**: Provide two entry points:
  1. A green edit icon button in the action column of `PekebunListView.vue` for registered rows.
  2. A green "Edit Data" button in the footer of `DetailPekebunModal.vue`.
