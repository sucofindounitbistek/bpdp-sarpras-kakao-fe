# Research: Detail Verifikasi Kabupaten Backend Integration

## 1. Technical Decisions

### Decision: Encapsulate API Verification Calls in Pinia Store
- **Chosen**: Add actions `submitKabRevisi` and `submitSkCpcl` in `usePengusulanStore` that invoke the corresponding `proposalService` methods.
- **Rationale**: Strict compliance with Principle III (Mandatory Pinia State Management & API Integration Discipline) which prohibits direct service calls inside Vue single-file components.
- **Alternatives considered**: Direct `proposalService` calls inside the view components. Rejected as it violates Principle III.

### Decision: Async Mounting Lifecycle for Detail View
- **Chosen**: Load data on mount by awaiting `store.getProposalDetail(id)` inside `onMounted`, binding the view loading state to a reactive boolean.
- **Rationale**: Enables dynamic skeleton loading animations during network latency, preventing cumulative layout shift (Principle XII).
- **Alternatives considered**: Static timeout or synchronous load. Rejected as they cause layout shifts or fail on refresh.
