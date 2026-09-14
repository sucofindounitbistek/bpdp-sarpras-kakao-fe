# Phase 1 Data Model & RAB Contracts

## RAB Payload Structure

```typescript
export interface CreateRabPayload {
  proposal_id: number | string;
  flag: 'FINAL'; // Set to FINAL for Kabupaten verification RAB
  items: CreateRabItemPayload[];
}
```
