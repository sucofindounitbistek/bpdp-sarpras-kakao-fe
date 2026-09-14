# Phase 0 Research: Contextual Rejection Notes Display

## Research Task 1: Rejection Note Parsing & Categorization

- **Decision**: Build helper utility `parseRejectionNotes(catatanRaw: string)`:
  - Parses formatted rejection strings (e.g. `[Nama Pekebun] - Scan KTP: <catatan>`, `Surat Permohonan: <catatan>`, `Gudang (Alamat): <catatan>`).
  - Categorizes notes into:
    - `pekebunNotes`: Map of farmer ID/NIK -> list of document/land rejection notes.
    - `proposalNotes`: Map of requirement ID/document type -> rejection note.
- **Rationale**: Works seamlessly with both server-returned `catatanDinas` strings and active draft store `verifications`.
- **Alternatives Considered**: Raw regex parsing inside template — rejected because centralized helper keeps templates clean and reusable across views.

## Research Task 2: UI Presentation Component Strategy

- **Decision**: Create lightweight alert banner component / inline template snippet using Tailwind `bg-rose-50 border-rose-200 text-rose-800`:
  - Renders inline under affected Pekebun file inputs or proposal document rows.
  - Displays icon (`AlertCircle`), item label, and explicit verifier note.
- **Rationale**: High contrast, readable, WCAG AA compliant design.
