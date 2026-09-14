# Implementation Plan: Sync Pekebun Document Validation Status

**Branch**: `065-sync-pekebun-validation` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/065-sync-pekebun-validation/spec.md`

## Summary

Synchronize Pekebun document validation status from backend records (`GET /api/v1/validasi-dokumen-pekebun?pengajuan_id=:id`) into Pinia draft store (`verifikasiKabDraft`), resolving missing CPCL list extractions (`daftarCPCL`) and robustly matching document IDs (`dokumen_pekebun_id`) and field detail keys (`namaLengkap`, `nik`, `nomorKK`). This eliminates false "Belum Diverifikasi" status badges when valid validation records exist.

## Technical Context

**Language/Version**: TypeScript 5 / Vue 3 (Options/Composition API)
**Primary Dependencies**: Vue Router, Pinia, TailwindCSS, Lucide Vue Icons
**Storage**: Pinia Store (`verifikasi-kab-draft` with persistence)
**Testing**: Manual E2E Validation / Vue Component testing
**Target Platform**: Web Browser (Chrome/Firefox/Edge)
**Project Type**: Web Application Frontend (`bpdp-sarpras-kelapa-fe`)
**Performance Goals**: Instant UI status badge synchronization (<300ms post API fetch)
**Constraints**: Keep existing draft store persistence schema intact

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Preserves existing API contracts & store structures
- [x] No breaking UI changes
- [x] Backward-compatible fallback for unverified proposals

## Project Structure

### Documentation (this feature)

```text
bpdp-sarpras-kelapa-fe/specs/065-sync-pekebun-validation/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Research findings
├── data-model.md        # Data models & store mapping
├── quickstart.md        # Quickstart validation guide
└── contracts/
    └── ui-contract.md   # UI store contract specification
```

### Source Code

```text
bpdp-sarpras-kelapa-fe/src/
├── stores/
│   └── verifikasiKabDraft.ts                       # Pinia store farmer validation sync logic
└── views/dinas/kabupaten/
    ├── DetailVerifikasiKabView.vue                  # Main verifikasi view fetching API data
    ├── StepVerifikasiPekebunDanDokumenProposal.vue  # Verification step displaying pekebun status badges
    └── VerifikasiPekebunDetailView.vue              # Pekebun detail verification view
```

## Generated Artifacts

- [spec.md](./spec.md)
- [plan.md](./plan.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
- [contracts/ui-contract.md](./contracts/ui-contract.md)
- [quickstart.md](./quickstart.md)
