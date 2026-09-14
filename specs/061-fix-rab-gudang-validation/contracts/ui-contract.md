# UI Contract: RAB & Gudang Validation Rendering Interface

## Overview

This UI contract specifies the rendering conditions, DOM structures, and validation key contracts for Gudang (Storage Area) and RAB (Budget Proposal) verification sections in `StepVerifikasiPekebunDanDokumenProposal.vue`.

---

## 1. Gudang (Storage Area) Validation Interface

### Conditional Guard
Rendered if `hasStorageArea` evaluates to `true`.

### Component Elements
- **Container element**: `<div v-if="hasStorageArea" class="flex flex-col gap-4 mt-2">`
- **Address item card**: Displays `gudangAlamat` with approval/rejection toggle buttons bound to key `gudangAlamat`.
- **Coordinate item card**: Displays `gudangKoordinat` with approval/rejection toggle buttons bound to key `gudangKoordinat`.
- **Exterior photo item card**: Displays `fotoTampakDepan` filename (if uploaded) with preview button ("Lihat") and approval/rejection toggle buttons bound to key `fotoTampakDepan`.
- **Interior photo item card**: Displays `fotoTampakDalam` filename (if uploaded) with preview button ("Lihat") and approval/rejection toggle buttons bound to key `fotoTampakDalam`.

---

## 2. RAB Inspection & Regency RAB Table Interface

### Conditional Guard
- RAB Inspection section rendered if `hasRabContent` evaluates to `true`.
- RAB Kabupaten Editing table (`RabTable.vue`) rendered at the bottom of Step 1 for all proposals to allow verifier budget adjustment and document generation.

### Component Elements
- **RAB Inspection Container**: `<div v-if="hasRabContent" class="flex flex-col gap-4 mt-2">`
- **RAB Document Card**: Displays `RAB_RK` file details with preview button and approval/rejection toggle bound to key `rabDocument`.
- **RAB Proposal Summary**: Renders list of proposed items (`pengajuan.rabItems`) with volume, unit, price, and subtotal.
- **RAB Kabupaten Section**: Renders `RabTable` component bound to `verifikasiStore.rabItems`, step action buttons ("Generate & Unduh RAB", "Upload RAB Bertandatangan").
