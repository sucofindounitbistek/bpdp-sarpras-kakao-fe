# Research: RAB PDF Generation

## Decisions

### 1. Client-Side Print layout via Iframe

- **Decision**: Trigger printing using a dynamically generated hidden `iframe` in the DOM. The `downloadRAB` action will construct an HTML document string containing custom CSS reset for print layout, insert table rows, and call `contentWindow.print()`.
- **Rationale**:
  - Zero external dependencies required (adheres strictly to Core Principle V: YAGNI/Simplicity).
  - High performance: browser rendering engine handles fonts, margins, column-sizing, and pagination instantly.
  - Generates actual text elements inside the PDF rather than canvas rasterization, producing smaller, searchable, and professional documents.
- **Alternatives Considered**:
  - `jspdf` or `pdfmake`: Rejected because it adds >100KB to the frontend bundle and introduces layout engine complexities for simple grid exports.

### 2. Localization Update

- **Decision**: Update properties in `src/config/localization.ts` under `rabTable`:
  - `downloadSuccess`: `'RAB berhasil dicetak sebagai PDF.'`
- **Rationale**: Keeps the user feedback wording consistent with the actual action taken.

### 3. Header Profile Dynamic Fallbacks

- **Decision**: Check `store.lembaga` property in `usePengusulanDraftStore`. If `namaLembaga` is equivalent to default `"Kelembagaan Pekebun"` or is empty, resolve to `"Kelompok Tani Bukan Karyawan Baru"`. If `alamatLengkap` is empty, resolve to `"Sleman Semabda"`.
- **Rationale**: Meets the user requirement to match the mock image out-of-the-box, but stays fully compatible with actual dynamic session profiles.

## References

- [StepRAB.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/pengusulan/StepRAB.vue)
- [localization.ts](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/config/localization.ts)
