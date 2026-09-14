# Data Model: Modul Penyaluran Mockup

This document outlines the local/client-simulated data shapes used to back the mockup dashboard view, dynamic sidebars, and user management tables.

---

## 1. Role Definition Shape

Defines the attributes and permissions assigned to each of the 5 roles.

```typescript
interface Role {
  id: string; // e.g., 'PEMOHON', 'DINAS_KAB', 'DINAS_PROV', 'DITJENBUN', 'BPDPKS'
  name: string; // e.g., 'Lembaga Pekebun'
  description: string; // Narrative of duties
  allowedRoutes: string[]; // List of navigation paths this role can view
}
```

---

## 2. Simulated User Account

Mock data shape representing registered users visible in the BPDP User Management view.

```typescript
interface SimulatedUser {
  id: string | number;
  name: string;
  email: string;
  role: 'PEMOHON' | 'DINAS_KAB' | 'DINAS_PROV' | 'DITJENBUN' | 'BPDPKS';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}
```

---

## 3. Mock Dashboard Metrics

Data shape dynamically loaded based on the selected role to populate dashboard cards.

```typescript
interface DashboardMetricCard {
  label: string;
  value: string | number;
  change?: string; // e.g., '+12% dibanding bulan lalu'
  type: 'success' | 'warning' | 'info' | 'primary';
}

interface RoleDashboardMetrics {
  cards: DashboardMetricCard[];
  chartData: {
    labels: string[];
    datasets: number[];
  };
}
```
