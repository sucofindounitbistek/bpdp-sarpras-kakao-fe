# Verification Guide: Skeleton Loading Coverage

This document outlines the manual verification scenarios to validate that all targeted views correctly implement and render skeleton loader states during data loading.

## Verification Scenarios

### Scenario 1: Skeleton Loader Rendering & Hydration
* **Prerequisites**: Network throttling set to "Slow 3G" or custom delay configuration in browser dev tools.
* **Execution**:
  1. Open the application and log in as any role (e.g. `DINAS_KAB` or `BPDPKS`).
  2. Navigate to one of the updated pages (e.g. **Dinas Kab/Kota Verification Queue** or **User Management**).
  3. Verify that the `<Skeleton />` pulse loading blocks render matching the page layout geometry immediately.
  4. Await 400ms. Check that the skeleton loaders fade out smoothly and are replaced by the actual tables, cards, and forms.
* **Expected Outcome**: Immediate, layout-matched loader rendering, smooth hydration transition, no visible page layout shifts (no Cumulative Layout Shift).

### Scenario 2: Light and Dark Theme Alignment
* **Prerequisites**: Active application.
* **Execution**:
  1. Trigger the dark mode toggle from the header menu.
  2. Navigate between updated pages and refresh.
  3. Observe the colors of the skeleton loader animations.
* **Expected Outcome**: 
  - Light mode: loaders render with soft slate/zinc borders (`bg-slate-200/80`).
  - Dark mode: loaders adapt to a muted dark slate (`bg-slate-800/80`), maintaining WCAG AA contrast compliance.
