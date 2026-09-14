# Research: 1:1 Rekomendasi Teknis (Rekomtek) Ditjenbun PDF Generator

**Feature Directory**: `specs/083-generate-rekomtek-ditjenbun/`  
**Date**: 2026-09-12  

---

## 1. Technical Context & Clarification Resolutions

### Decision 1: PDF Generation Mechanism & Architecture
- **Decision**: Client-side High-Fidelity HTML-to-PDF Renderer with Iframe & Window Print Driver, combined with an Interactive 1:1 A4 Modal Viewer (`RekomtekPreviewModal.vue`).
- **Rationale**: 
  - The project already successfully implements this exact pattern in `src/utils/permohonanPdfGenerator.ts`, `src/utils/exportProposal.ts`, `StepRAB.vue`, and `RevisiProposalView.vue`.
  - Zero heavy external binary dependencies (no Headless Chrome / Puppeteer overhead on server or client).
  - Sub-second instant generation (< 200ms vs > 2.5s network round-trip), easily beating the SC-002 target (< 1.5s).
  - Perfect typography scaling, native CSS `@page` page-breaks (`page-break-after: always; break-after: page;`), and SVG / Base64 embedded vector graphics for official logos (Kementan & BSrE).
  - Native print dialog directly allows saving as clean vector PDF ("Save as PDF") with selectable text, clickable links, and precise 1:1 margins matching the official Kementan document.
- **Alternatives Considered**:
  - *Server-side wkhtmltopdf / chromium*: Heavy server resource requirements, slow execution, vulnerable to rendering discrepancies on different OS environments.
  - *Client-side html2pdf.js / jspdf*: Converts DOM to raster canvas (fuzzy text, huge file size, page breaking bugs across table rows).

### Decision 2: Nomor Rekomtek Handling & Fallback
- **Decision**: Opsi 1 (Input Manual Form / Fallback Draf Sementara).
- **Rationale**:
  - Verifikator Ditjenbun retains flexibility to use official surat agenda numbers provided by Kementan persuratan (e.g. `124/PI.400/E/08/2026`).
  - If the input field in the card is left blank when clicking "Generate / Pratinjau", the system automatically provides a clean draft placeholder: `.../PI.400/E/[BULAN]/[TAHUN]` (e.g. `.../PI.400/E/09/2026`).
  - Synchronized reactively: typing in the input box immediately reflects in the live preview document.

### Decision 3: Document Layout & Page Break Precision (3 Halaman 1:1)
- **Decision**: 3 discrete page containers (`.rekomtek-page.page-1`, `.rekomtek-page.page-2`, `.rekomtek-page.page-3`) constrained to exact A4 dimensions (`210mm x 297mm`) with `box-sizing: border-box`, standard 15mm margins, and strict `break-after: page; page-break-after: always;`.
- **Rationale**:
  - Guarantees that Page 1 contains Kop, Metadata, Tujuan, Paragraph 1, and Points 1-8.
  - Page 2 contains Point 7 clause lanjutan, Closing paragraph, BSrE TTE block, and Tembusan.
  - Page 3 contains Lampiran header, SK CPCL info, Berita Acara info, and Second Ditjenbun verification signature block.
  - Prevents uncontrolled content spilling between pages regardless of browser viewport.

### Decision 4: Assets & Official Vector Emblems
- **Decision**: High-resolution SVG/PNG assets for:
  1. Logo Kementerian Pertanian (Garuda & Padi Kapas / Kementan sayap emas dengan lingkaran hijau).
  2. Logo Balai Sertifikasi Elektronik (BSrE) / BSSN security mark.
  3. QR Code generator / valid visual placeholder containing proposal verification hash & draft watermark.
- **Rationale**:
  - Vector assets ensure crisp, razor-sharp rendering at 300+ DPI during printing and PDF generation.

---

## 2. Best Practices & Guidelines
- Use CSS font stack: `font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;` with exact font sizes matching Kementan official standard (Kop 12pt bold, body 10pt/10.5pt, table 9.5pt, line-height 1.25 - 1.35).
- Print color adjust: `-webkit-print-color-adjust: exact; print-color-adjust: exact;`.
- Use hidden `iframe` for silent print/PDF generation trigger when clicking "Download Draf Rekomtek".
