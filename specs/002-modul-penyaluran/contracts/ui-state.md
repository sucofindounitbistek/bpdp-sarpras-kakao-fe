# UI State & Component Contract: Modul Penyaluran Dashboard

This document details the interface contracts between the dynamic layouts and the Pinia state management layer.

---

## 1. Pinia State Contract (`authStore`)

All components needing access to the current role context or switching logic MUST communicate through the `authStore`.

### State Properties

- `user.role`: Reactive string of type `'PEMOHON' | 'DINAS_KAB' | 'DINAS_PROV' | 'DITJENBUN' | 'BPDPKS'`.

### Actions

- `setRole(role: User['role'])`: Function that sets the active role and triggers dynamic reactivity across all components.

---

## 2. Dynamic Sidebar Interface Contract

The sidebar receives component updates reactively from `authStore`. It resolves sections using this mapping pattern:

```typescript
const roleMenuMapping: Record<User['role'], string[]> = {
  PEMOHON: ['/dashboard', '/pengusulan/baru', '/pengusulan/tracking'],
  DINAS_KAB: ['/dashboard', '/dinas/verifikasi'],
  DINAS_PROV: ['/dashboard', '/dinas/verifikasi'],
  DITJENBUN: ['/dashboard', '/ditjenbun/penetapan'],
  BPDPKS: ['/dashboard', '/bpdpks/penyaluran', '/bpdpks/user-management'],
};
```
