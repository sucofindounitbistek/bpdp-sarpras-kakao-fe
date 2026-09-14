# Implementation Plan: Centralize Localization Wording

**Branch**: `019-externalize-wording` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

## Summary

Membuat file konfigurasi lokalisasi pusat (`src/config/localization.ts`) yang menyimpan seluruh teks label alur proposal, label status, variant badge, dan label jenis paket bantuan (sarpras). Komponen stepper pelacakan (`TrackingPengusulanView.vue`), halaman antrean kabupaten (`QueueVerifikasiKabView.vue`), dan pemetaan tipe (`src/types/pengusulan.ts`) akan dimodifikasi untuk mengonsumsi teks dari konfigurasi pusat ini secara seragam demi menjaga kepatuhan terhadap Core Principle XV.

## Technical Context

**Language/Version**: Vue 3, TypeScript strict mode

**Primary Dependencies**: Vue 3, Pinia (for app state), project components

**Storage**: None

**Testing**: Build check & manual validation of labels in the browser

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation Details / Compliance |
| :--- | :--- | :--- |
| **XV. Localization Standard** | `Passed` | Fully complies. Externalizes all user-facing Indonesian copy to a central language file. |
| **I. Vue 3 Setup** | `Passed` | Uses `<script setup>` with TypeScript strict mode. |
| **V. Simplicity (YAGNI)** | `Passed` | Uses simple TypeScript object exporting without introducing complex third-party translation library bundles. |

## Project Structure

### Documentation

```text
specs/019-externalize-wording/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Data design
└── quickstart.md        # Validation scenarios
```

### Source Code

```text
src/
├── config/
│   └── localization.ts       # [NEW] Central translation dictionary file
├── types/
│   └── pengusulan.ts         # [MODIFY] Delegate label dicts to central configuration
└── views/
    ├── pengusulan/
    │   └── TrackingPengusulanView.vue  # [MODIFY] Read stepper labels from config
    └── dinas/
        └── kabupaten/
            └── QueueVerifikasiKabView.vue # [MODIFY] Read queue labels from config
```
