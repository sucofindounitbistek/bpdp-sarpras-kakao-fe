# Research & Technical Resolutions: sarpras-package-rules

This document records the decisions and rationales chosen for implementing the updated Sarpras packages and requirement rules.

## Decision 1: Split UPH into Two Selectable Packages
* **Decision**: Split the `JenisSarpras.UPH` enum value into two distinct values:
  * `UPH_1_JENIS` (Unit Pengolahan Hasil - 1 Jenis Produk)
  - `UPH_MULTI_JENIS` (Unit Pengolahan Hasil - Multi-Jenis / Skala Besar)
* **Rationale**: The requirements and documents needed for UPH vary significantly depending on whether it produces 1 jenis (9 documents, 20 pekebun, 5 Ha) or multi-jenis (19 documents, 40 pekebun, 10 Ha). Splitting them into two cards simplifies client-side state handling and step 1 rendering without requiring complex sub-branch logic within the single UPH card.
* **Alternatives Considered**: 
  * Keep single UPH enum and ask user to select type in Step 1. Rejected as it increases component complexity and goes against Constitution V (Simplicity).

## Decision 2: Add Pikap Package under Alat Transportasi
* **Decision**: Add `JenisSarpras.PIKAP` enum and card option.
* **Rationale**: The requirements document defines separate rules for Pikap (25 pekebun, 10 Ha) and Truk (25 pekebun, 10 Ha). Even though they require the same minimum parameters and documents, they represent different types of machinery with different costs and user choices. Adding Pikap satisfies requirements.
* **Alternatives Considered**:
  * Map Pikap to Truk. Rejected because the client demands separate tracking of Pikap and Truk allocations.

## Decision 3: Remove '/Truk/' Typos in Checklist Headings
* **Decision**: Treat the string "/Truk/" in headings like "Mesin Pertanian/Truk/20 pekebun..." as a copy-paste error from the Truk heading immediately preceding it. The actual package names will be:
  * Mesin Pertanian (JenisSarpras.MESIN_PERTANIAN)
  * Pembentukan Infrastruktur Pasar (JenisSarpras.INFRASTRUKTUR_PASAR)
  * Verifikasi atau Penelusuran Teknis (JenisSarpras.VERIFIKASI_TEKNIS)
* **Rationale**: Appending "Truk" to "Mesin Pertanian" or "Infrastruktur Pasar" is logically inconsistent with the actual package types. 
* **Alternatives Considered**:
  * Renders literal "Mesin Pertanian / Truk" label. Rejected as it would confuse stakeholders.

## Decision 4: Externalize All Indonesian Labels
* **Decision**: Move all raw text labels and validation errors into `src/config/localization.ts`.
* **Rationale**: Adheres to Constitution XV (Mandatory Wording Externalization). This ensures the templates and stores do not contain hardcoded Indonesian text.
