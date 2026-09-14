# Interface Contract: Pekebun Draft Operations (032-resume-draft-pekebun)

## Store Interface (Pinia `usePekebunStore`)

The Pinia `pekebun` store defines the client-side interface for managing saved drafts and resuming form entries.

### `getDraftById(id: string): Pekebun | undefined`
Retrieves a draft record by its unique ID.
- **Parameters**: `id` - Pekebun draft ID (e.g. `'PKB-004'`)
- **Returns**: `Pekebun` object if found and `isDraft === true`, otherwise `undefined`.

---

### `saveDraftPekebun(identitas: IdentitasFormData, dokumenFiles: DokumenFormData, lahanList: LahanFormData[]): Pekebun`
Saves a new draft entry into `listPekebun`.
- **Behavior**: Generates new ID (`PKB-xxx`), sets `isDraft: true`, unshifts item into `listPekebun`, and persists store state.
- **Returns**: Newly created `Pekebun` draft record.

---

### `updateDraftPekebun(id: string, identitas: IdentitasFormData, dokumenFiles: DokumenFormData, lahanList: LahanFormData[]): Pekebun`
Updates an existing draft entry without changing `isDraft` status.
- **Parameters**:
  - `id` - Existing draft ID
  - `identitas` - Updated Step 1 form data
  - `dokumenFiles` - Updated Step 2 uploaded files / existing URLs
  - `lahanList` - Updated Step 3 land list data
- **Behavior**: Replaces field values on the target draft item in `listPekebun`, updates timestamp `updatedAt`, and keeps `isDraft: true`.
- **Returns**: Updated `Pekebun` draft record.

---

### `updatePekebun(id: string, identitas: IdentitasFormData, dokumenFiles: DokumenFormData, lahanList: LahanFormData[]): Pekebun`
Finalizes an existing draft entry into a fully registered Pekebun.
- **Behavior**: Replaces field values, sets `isDraft: false`, updates `updatedAt`, and persists store state.
- **Returns**: Finalized `Pekebun` record.

---

### `deleteDraftPekebun(id: string): void`
Permanently removes a draft entry from the store.
- **Parameters**: `id` - Draft ID to delete
- **Behavior**: Filters out the target item from `listPekebun.value` and triggers persistence update.
