# Implementation Plan: Workflow Pipeline Dashboard

**Branch**: `020-workflow-pipeline-dashboard` | **Date**: 2026-08-06 | **Spec**: [specs/020-workflow-pipeline-dashboard/spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/020-workflow-pipeline-dashboard/spec.md)

## Summary
Add a premium, highly aesthetic workflow pipeline dashboard to replace/augment the metrics grid on the main Dashboard view for internal users (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, BPDPKS). The pipeline consists of 10 stages organized in a visually looping flow with connectors on desktop, and a vertical list on mobile. Each stage shows summary numbers (Pekebun, Lahan, Proposal) and navigates to the respective list views when clicked. All copywriting is externalized to `localization.ts` in compliance with project principles.

## Technical Context

**Language/Version**: Vue 3, TypeScript, Tailwind CSS
**Primary Dependencies**: lucide-vue-next, pinia, vue-router
**Storage**: N/A (Client-side simulation store)
**Testing**: Manual visual & routing checks (automated unit testing is explicitly not used per project convention)
**Target Platform**: Responsive Web (Mobile-First, target 375px up to desktop)
**Project Type**: Vue 3 Web Application

## Constitution Check

*GATE: Must pass before implementation.*

- **Principle I (Vue 3 SFC Setup)**: Followed. New components will use `<script setup lang="ts">`.
- **Principle X (UI/UX Pro Max & Weight Discipline)**: Followed. We will use strict font weight control (only `font-medium` and `font-semibold`, never `font-bold` or `font-extrabold`).
- **Principle VII (Mobile-First)**: Followed. Desktop layout loops using custom grid directions; mobile collapses into a responsive vertical list avoiding overflow.
- **Principle XIII (Mockup-First Standard)**: Followed. Metrics per-stage will be simulated on client-side state.
- **Principle XV (Localization Wording)**: Followed. Every single text, stage title, and sub-label is externalized to `src/config/localization.ts`.

## Proposed Changes

### Configuration & Localization

#### [MODIFY] [localization.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/config/localization.ts)
Add wording keys under a new `pipeline` section:
- Stage names: Pengajuan Proposal, Verifikasi Dinas Kabupaten/Kota, Approval SK CPCL, Asistensi Dinas Provinsi, Asistensi Ditjenbun, Penerbitan Rekomtek, Approval Rekomtek, Penelitian BPDP, Approval BPDP, Penerbitan SK Dirut.
- UI Labels: "Jumlah Pekebun", "Luas Lahan", "Jumlah Proposal", and title "Tampilan Alur Kerja Pipeline (Dinas & Pusat)".

### State Management & Stores

#### [MODIFY] [metrics.ts](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/stores/metrics.ts)
- Add mock metrics state for the 10 stages per active role.
- Expose a getter or ref `activePipelineData` that maps active stage values depending on `authStore.activeRole`.

### UI Components

#### [NEW] [PipelineCard.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/components/dashboard/PipelineCard.vue)
- Presents individual stage information in a glassmorphic or clean-bordered container.
- Renders:
  - Icon/Index number.
  - Stage title (localized).
  - Row metrics: Pekebun (e.g. `X Orang`), Lahan (e.g. `Y Ha`), Proposal (e.g. `Z Berkas`).
- Supports click handler trigger to navigate to target URL.
- Responsive styles and micro-interactions (subtle hover scale/lift).

#### [NEW] [WorkflowPipeline.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/components/dashboard/WorkflowPipeline.vue)
- Coordinates layout of the 10 `PipelineCard` components.
- Handles responsive toggle:
  - **Desktop (grid-cols-4)**:
    - Row 1: Stages 1-4 with arrows pointing Right.
    - Right edge connector from Stage 4 pointing Down to Stage 5.
    - Row 2: Stages 5-8 with arrows pointing Left.
    - Left edge connector from Stage 8 pointing Down to Stage 9.
    - Row 3: Stages 9-10 with arrows pointing Right.
  - **Mobile (flex flex-col)**: Vertical stack with connector lines running down the center-left.

### Main Views

#### [MODIFY] [DashboardView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/DashboardView.vue)
- Detect if the active user role is not `PEMOHON`.
- If so, insert `<WorkflowPipeline />` above or inside the workspace view instead of the default single-stat card row, rendering a unified workflow view.

## Verification Plan

### Automated Tests
- None (explicitly skipped per project convention).

### Manual Verification
1. Run `npm run dev` and navigate to the local environment.
2. Verify role transitions (Dinas Kab/Kota, Dinas Prov, Ditjenbun, BPDPKS) load the appropriate active state styles.
3. Ensure no text is bold/extrabold (uses SF Pro Medium/Semibold).
4. Verify clicking cards navigates to correct URLs.
5. Check mobile view (375px) in Chrome DevTools to ensure zero layout shift/overflow and clean vertical flow.
