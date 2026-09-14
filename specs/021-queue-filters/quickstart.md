# Quickstart & Validation Guide: Verification Queue Filters

## Prerequisites
- The frontend development server must be running (`npm run dev`).
- Log in to the application and switch to any of the verifier roles (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, or BPDPKS).

## Validation Scenarios

### Scenario 1: Search Filter Validation
1. Open the Dinas Kabupaten Queue view.
2. Locate the Search text input inside the filter panel.
3. Type a keyword that matches one of the proposal numbers or cooperative names (e.g. typing a specific ID).
4. Verify that the table updates instantly, displaying only matching rows.
5. Clear the text input; verify that the complete list is displayed again.

### Scenario 2: Dropdown Status & Jenis Sarpras Filter Validation
1. Click the Status dropdown and select a status.
2. Verify that the table updates, filtering rows according to status.
3. Click the Jenis Sarpras dropdown and select a category (e.g. Alsintan).
4. Verify that combined filtering (Search AND Status AND Sarpras Type) works correctly using strict AND logical condition.
5. Click the "Reset Filter" button and verify that the filter values clear and the full list is restored.

### Scenario 3: Responsive Mobile Verification
1. Inspect the page in mobile emulation view (375px).
2. Verify that the filter controls stack vertically and adapt cleanly without horizontal overflow.
3. Verify click targets for the select boxes and inputs have a clickable height matching or exceeding 40px/44px.
