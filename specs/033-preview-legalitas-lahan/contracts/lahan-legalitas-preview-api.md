# Interface Contract: Land Legal Document Preview (033-preview-legalitas-lahan)

## UI Component Contract: `StepPilihPekebunLahan.vue`

### `openLahanDocPreview(lahan: LahanPekebun): void`
Opens the `DocumentPreviewModal` with the land's legal certificate document.

- **Parameters**: `lahan` - Target `LahanPekebun` object.
- **Behavior**:
  1. Checks `lahan.scanLegalitasUrl`. If empty or `#`, shows warning toast and aborts.
  2. Infers mime type (`application/pdf` for `.pdf`, `image/png` / `image/jpeg` for image extensions).
  3. Sets `previewDoc.value = { dataUrl: lahan.scanLegalitasUrl, mimeType, title: `Legalitas Lahan - ${lahan.jenisLegalitas} (${lahan.nomorLegalitas})` }`.
  4. Sets `showDocPreview.value = true`.

---

## Shared UI Component: `DocumentPreviewModal.vue`

### Props Contract
- `isOpen`: `boolean` - Controls modal visibility.
- `title`: `string` - Modal header title.
- `dataUrl`: `string` - File URL or Data URL.
- `mimeType`: `string` - File mime type (`application/pdf`, `image/png`, etc.).

### Emits Contract
- `close`: `(): void` - Emitted when user closes the modal.
