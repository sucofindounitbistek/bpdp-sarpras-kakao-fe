# Phase 0: Research & Technical Analysis - SPKA Numbering Format

## Research Items

### 1. Structure & Format Formula for SPKA Number

- **Decision**: Formula `SPKA` + `[Kode Jenis Paket]` + `[Bulan MM]` + `[Tahun YY]` + `[Urutan Bulanan 0001-9999]`.
- **Example**: `SPKA106260001` (Package 1: Ekstensifikasi, Month 06, Year 26, Sequence 0001).
- **Rationale**:
  - `SPKA` constant prefix guarantees document identification across all workflow stages.
  - 1-digit package code (1-9) concisely embeds the Sarpras assistance package category.
  - 2-digit MM (01-12) and 2-digit YY (e.g. 26 for 2026) clearly denote the creation month/year.
  - 4-digit zero-padded sequence (0001-9999) supports up to 9,999 submissions per month with automatic monthly reset.
- **Alternatives Considered**:
  - Hyphenated string (`SPKA-1-06-26-0001`): Good for visual reading, but raw unformatted string `SPKA106260001` is stored as standard ID/nomorUsulan and can be formatted with optional dashes or displayed directly.

### 2. Mapping of Sarpras Packages to Single-Digit Codes (1-9)

- **Decision**:
  - `1`: Ekstensifikasi / BENIH_PUPUK (Benih, Pupuk, Pestisida)
  - `2`: Intensifikasi / INTENSIFIKASI (Pupuk dan Pestisida)
  - `3`: Alat pascapanen / ALAT_PASCAPANEN
  - `4`: Unit Pengolahan Hasil / UPH (atau UPH_KAKAO)
  - `5`: Jalan kebun dan jalan akses / JALAN_PERKEBUNAN (Jalan kebun dan jalan akses ke jalan umum dan/atau pelabuhan)
  - `6`: Alat transportasi / TRUK (atau ALAT_ANGKUT_LANGSIR / GEROBAK_BERMOTOR)
  - `7`: Mesin pertanian / ALSINTAN (atau MESIN_PERTANIAN)
  - `8`: Infrastruktur pasar / DRAINASE
  - `9`: Verifikasi atau penelusuran teknis
- **Rationale**: Direct 1-to-1 mapping covers all 9 official Sarpras assistance types defined in the system.

### 3. Monthly Sequence Counter Strategy

- **Decision**: A helper utility `generateSpkaNomor({ jenisPaket, createdAt, sequenceNumber })` combined with store sequence tracking per month (`YYMM`).
- **Rationale**: Easily calculates month and year from creation timestamp and formats 4-digit padded sequence.

## Conclusion

All technical context and requirements resolved without ambiguity. Ready for Phase 1 design artifacts.
