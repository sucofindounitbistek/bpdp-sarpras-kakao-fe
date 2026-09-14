# Quickstart & Validation Guide: Land Legal Document Preview (033-preview-legalitas-lahan)

## Overview
This document outlines manual validation scenarios to verify land legal document previewing in Step 3 of Proposal Submission ("Pilih Pekebun & Lahan").

## Prerequisites & Setup
1. Development server running: `npm run dev`
2. Open browser at `http://localhost:5173/pengusulan/baru`

---

## Validation Scenarios

### Test Scenario 1: Open Land Legal Document Preview
1. Navigate to Proposal Submission `/pengusulan/baru`.
2. Complete Step 1 (Paket & Persyaratan) and Step 2 (RAB).
3. Proceed to Step 3 ("Pilih Pekebun & Lahan").
4. Select a Pekebun to expand their land items list.
5. Click **"Pratinjau Legalitas"** button on a land item.
6. **Expected Outcome**:
   - `DocumentPreviewModal` opens smoothly.
   - Header shows *"Legalitas Lahan - [Jenis] ([Nomor])"*.
   - Document content (PDF or Image) is rendered inside the modal.

---

### Test Scenario 2: Close Preview Modal
1. With the land document preview modal open, click the close button (X) or click outside the modal overlay.
2. **Expected Outcome**:
   - Modal closes cleanly.
   - Focus returns to the land list in Step 3.

---

### Test Scenario 3: Missing Document Fallback
1. Select a land item that has no uploaded legal document (or empty `scanLegalitasUrl`).
2. **Expected Outcome**:
   - The button shows **"Belum Ada Dokumen"** and is disabled (or displays toast alert without crashing).
