# Research & Architecture Decisions: Modul Penyaluran Dashboard Mockup

## Summary of Decisions

This document details the architectural and layout patterns chosen for implementing the multi-role Penyaluran dashboard mockup.

---

## 1. Dynamic Sidebar Navigation

- **Decision**: Filter the sidebar items Reactively using the Pinia `authStore.user.role` state.
- **Rationale**: Vue 3's reactive system automatically recalculates computed lists. Keeping routing path security client-simulated via state is standard for mock builds.
- **Alternatives Considered**: 
  - *Hardcoded multiple sidebar components*: Avoided. Creates duplicate code and violates Principle I (Component-Driven Architecture).
  - *Dynamic routing updates on change*: Unnecessary overhead. Hiding elements from UI is simpler and perfectly fits the mockup context.

---

## 2. Desktop & Mobile Role Selector

- **Decision**: Add a unified `<select>` element to both the mobile header and a new global desktop header in `App.vue`.
- **Rationale**: Fulfills the clarified requirement of having a global role selector in the top header. It ensures the reviewer can switch contexts from any view.
- **Alternatives Considered**:
  - *Dashboard-only switcher*: Rejected because navigating away from the dashboard would hide the selector.

---

## 3. UI/UX Pro Max Styling Alignment

- **Decision**: 
  - Standardize colors around Forest Green `#066C2A`.
  - Use custom cards for role-specific landing metrics.
  - Implement smooth transition animations (`transition-all duration-200`) and hover states.
- **Rationale**: Conforms to Principle X of the project constitution.

---

## 4. BPDP User Management & Role Profiles

- **Decision**: Design a dual-column layout on desktop (flex-col on mobile):
  - Left column: User Directory table with columns Name, Email, Role (Badge), Status (Active/Inactive).
  - Right column: Interactive list detailing the 5 roles and their respective access descriptions.
- **Rationale**: Clean visual structure that addresses all requirements of FR-005 and FR-006.
