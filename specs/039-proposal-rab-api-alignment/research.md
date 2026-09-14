# Implementation Research: Proposal & RAB Store API Alignment

**Feature**: `039-proposal-rab-api-alignment`  
**Date**: 2026-08-24  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Domain Model & Contract Alignment Strategy

### Decision
Directly adopt the canonical snake_case property names (`nomor_proposal`, `storage_area`, `detail_usulan`, `total_anggaran`, `paket_sarpras`, `status`, `documents`, `rabs`) across TypeScript type definitions and Pinia stores, providing non-breaking backward compatibility getters during the transition.

### Rationale
- Eliminates translation layer complexity and serialization overhead between the frontend and backend.
- Strictly adheres to the backend contract defined in `PROPOSAL_API_CONTRACT.md`.
- Allows Vue component templates to bind directly to backend response data without error-prone bidirectional mappings.

### Alternatives Considered
- **Bidirectional camelCase-to-snake_case Axios interceptors**: Rejected due to implicit performance costs, edge cases with nested arrays/objects (such as dynamic `details` JSONB), and debugging opacity.
- **Manual client-side mapping on every API call**: Rejected due to boilerplate duplication and fragility as API models evolve.

---

## 2. Proposal Submission Orchestration (3-Step Pipeline)

### Decision
Implement a unified orchestrator action (`submitProposal` in `usePengusulanDraftStore` / `usePengusulanStore`) that sequentially invokes:
1. `POST /api/v1/proposals` (Creates proposal header, assigns `lahan_ids`, and uploads storage metadata with `interior_photo_file_id` and `exterior_photo_file_id`).
2. `POST /api/v1/proposals/:id/documents/bulk` (Attaches uploaded document `file_id`s with canonical uppercase `document_type`s).
3. `POST /api/v1/rabs` (Creates the budget plan with computed total prices and stage distribution details).
4. `GET /api/v1/proposals/:id` (Loads the complete aggregated proposal into `activeProposal`).

### Rationale
- Matches the backend resource architecture where documents and budget line items are separate relational aggregates linked by `proposal_id`.
- Keeps presentation components lean by encapsulating multi-step network coordination inside the Pinia store.
- Enables granular error feedback if a specific sub-resource fails validation.

### Alternatives Considered
- **Individual component-driven sequential API calls**: Rejected because UI components should not orchestrate transactional multi-resource network flows.
- **Monolithic single-payload backend endpoint**: Rejected because the backend contract specifies discrete endpoints (`/proposals`, `/documents/bulk`, `/rabs`).

---

## 3. Dedicated Budget Plan (RAB) Store Architecture

### Decision
Create a dedicated Pinia store `useRabStore` (`src/stores/rab.ts`) and API service `rabService` (`src/services/rab.service.ts`) accompanied by explicit types (`src/types/rab.ts`).

### Rationale
- Aligns with Constitution Principle III (Mandatory Pinia State Management) and Principle V (Modular Simplicity).
- Budget Plan (RAB) has distinct CRUD actions (`POST /rabs`, `GET /rabs/proposal/:id`, `PUT /rabs/:id`, `DELETE /rabs/:id`) and multiple review flags (`PROPOSAL`, `VERIFIKASI`, `REKOMTEK`, `FINAL`) used across both farmer submission and multi-tier government verification.
- Encapsulates live subtotal calculations (`total_price = volume * price_per_unit`) and overall budget aggregation.

### Alternatives Considered
- **Embedding all RAB logic within `usePengusulanStore`**: Rejected because verification views and rekomtek modules require isolated RAB state and adjustment tools without loading the entire proposal tree.

---

## 4. Multi-Stage Breakdown Serialization (`RabItem.details`)

### Decision
Encode multi-stage distribution (`jumlahTahap1`, `jumlahTahap2`, `jenis`) within the `details` JSONB object on each RAB line item while computing the top-level `volume` as `(jumlahTahap1 ?? 0) + (jumlahTahap2 ?? 0)` and `total_price = volume * price_per_unit`.

### Rationale
- Adheres 100% to backend schema (`uraian`, `volume`, `unit`, `price_per_unit`, `item_type`, `total_price`, `details`) while preserving rich multi-stage data for disbursement tracking.
- Guarantees backward compatibility with single-stage items when `jumlahTahap1` and `jumlahTahap2` are not supplied.

### Alternatives Considered
- **Split stages into separate line items**: Rejected because it causes duplicate line items for the same agricultural supply and complicates item categorization.

---

## 5. Error Propagation & Constitution Compliance

### Decision
Enforce strict backend error response fidelity (Constitution Principle IX) across `proposal.service.ts` and `rab.service.ts`. Axios response errors must unwrap the backend error envelope (`error.message` / `message`) and propagate to stores and UI components for reactive Toaster display (`useToast()`).

### Rationale
- Prevents silent fallback failures that mask validation issues (e.g., duplicate land assignments, negative quantities, missing required files).
- Ensures user receives clear, actionable feedback when an API call fails.
