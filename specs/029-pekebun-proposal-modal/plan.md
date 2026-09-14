# Implementation Plan: Pekebun Proposal Confirmation Modal

**Branch**: `029-pekebun-proposal-modal` | **Date**: 2026-08-10 | **Spec**: [spec.md](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/specs/029-pekebun-proposal-modal/spec.md)

**Input**: Feature specification from `/specs/029-pekebun-proposal-modal/spec.md`

## Summary

This feature adds a confirmation modal wrapper to protect proposal submissions by Lembaga Pekebun (Pemohon). Specifically, clicking "Submit Proposal" in step 3 of the wizard (`StepPilihPekebunLahan.vue`) will open the `ApprovalConfirmationModal` to prompt for final confirmation before submitting to Dinas Kabupaten/Kota. The existing verifier modals on other pages remain active and unaffected (co-existence). 

Technical Approach:
1. Extend `ApprovalConfirmationModal` to support `'submit'` action type, custom variant formatting, and localization strings.
2. Add new localization strings to `LOCALIZATION.confirmationModal` inside `src/config/localization.ts` for `'submit'`.
3. Modify `StepPilihPekebunLahan.vue` to import and render `ApprovalConfirmationModal`, intercepting the submission flow.

## Technical Context

**Language/Version**: Vue 3 / TypeScript 5

**Primary Dependencies**: Vue Router, Pinia, Lucide Vue Next

**Storage**: Local storage via Pinia stores (simulated)

**Testing**: Manual validation, production build checking

**Target Platform**: Responsive Web (Mobile-first viewport compatibility)

**Project Type**: Vue 3 Frontend Web App

**Performance Goals**: Smooth modal transition animations (<200ms), zero layout shift

**Constraints**: WCAG AA Contrast Compliance, Wording Externalization (No hardcoded strings)

**Scale/Scope**: 1 UI Component modification, 1 View integration, 1 Localization update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Direct Implications / Validation Method |
|---|---|---|
| **I. Vue 3 & Component-Driven** | PASS | All changes are implemented using Vue 3 SFCs with `<script setup>`. |
| **II. TypeScript Schema** | PASS | Full TypeScript typing for props, parameters, and emits. |
| **V. Simplicity (YAGNI)** | PASS | Reuses existing `ApprovalConfirmationModal` rather than creating a duplicate modal component. |
| **XI. Vue Toaster Notification**| PASS | Direct browser alerts are avoided; using standard toast notifications for success/error responses. |
| **XIV. Compact Density** | PASS | Uses compact UI buttons, text margins, and alignment that match the design guidelines. |
| **XV. Mandatory Wording Localization** | PASS | All new modal titles, descriptions, and button labels are defined inside `src/config/localization.ts`. |

## Project Structure

### Documentation (this feature)

```text
specs/029-pekebun-proposal-modal/
├── plan.md              # This file
├── research.md          # Research decisions & rationale
├── data-model.md        # State/Data description (purely UI here)
├── quickstart.md        # Scenario testing & validation steps
├── contracts/           
│   └── ApprovalConfirmationModal.md  # Component interface contract
└── checklists/
    └── requirements.md  # Spec quality validation checklist
```

### Source Code (repository root)

```text
src/
├── components/
│   └── approval/
│       └── ApprovalConfirmationModal.vue  # Extended component
├── config/
│   └── localization.ts                    # New localization keys
└── views/
    └── pengusulan/
        └── StepPilihPekebunLahan.vue      # Modal integration in Step 3
```

**Structure Decision**: Single Vue 3 project structure, targeting standard layout directories.

## Complexity Tracking

*No violations detected. Standard implementation patterns are used.*
