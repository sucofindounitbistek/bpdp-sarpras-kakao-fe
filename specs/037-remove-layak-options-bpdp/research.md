# Research: Remove "Layak / Tidak Layak" Radio Options in BPDP Verifikator View (037-remove-layak-options-bpdp)

## Problem Statement & Context
In `src/views/bpdp/CekiBpdpView.vue`, the "Keputusan Kelayakan" action card currently presents a radio selection titled "1. Status Penilaian Kelayakan" with options "Layak" and "Tidak Layak". The user requested to remove this radio selection ("BPDP Verifikator yang layak tidak layak apus").

## Technical Decisions & Rationale

### 1. Template Cleanup
- **Decision**: Remove lines rendering the "1. Status Penilaian Kelayakan" radio button container in `CekiBpdpView.vue`.
- **Rationale**: Removes UI clutter and prevents unnecessary user interaction.

### 2. Internal State Default
- **Decision**: Retain `const statusKelayakan = ref<'LAYAK' | 'TIDAK_LAYAK'>('LAYAK')` as default in script setup.
- **Rationale**: Ensures downstream handlers and store calls (`handleAjukanKelayakan`) continue functioning smoothly without breaking component interface contracts.

## Alternatives Considered
- **Removing the ref entirely**: Rejected because existing store methods reference `statusKelayakan` when building submission payloads. Setting default `'LAYAK'` in ref is zero-risk.
