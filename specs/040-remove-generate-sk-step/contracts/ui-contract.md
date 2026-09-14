# UI & Integration Contract: Remove Generate SK Step

## View Contract

### `FinalisasiSkDirutView.vue`
- On load: If `activeUsulan.skDirut.draftUrl` is not present, the view automatically triggers draft url initialization in store.
- Form components displayed directly on load:
  - Download Link: `activeUsulan.skDirut.draftUrl`
  - Text Input: `nomorSk`
  - Component: `FileUpload`
  - Button: `Selesaikan Penerbitan SK Dirut`
