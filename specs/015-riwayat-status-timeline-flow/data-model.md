# Data Model & Interfaces: Penyambungan Alur Riwayat Status & Catatan Timeline

**Feature Branch**: `015-riwayat-status-timeline-flow`  
**Date**: 2026-08-05  

## Data Interface

### `StatusLog` (`src/types/rekomtek.ts`)

```typescript
export interface StatusLog {
  id: string;
  usulanId: string;
  fromStatus: UsulanStatus;
  toStatus: UsulanStatus;
  actorName: string;
  actorRole: 'VERIFIKATOR_DITJENBUN' | 'APPROVAL_DITJENBUN' | 'VERIFIKATOR_BPDP' | 'APPROVAL_BPDP' | 'DITJENBUN_VERIFIKATOR' | 'DITJENBUN_APPROVAL' | 'BPDP_VERIFIKATOR' | 'BPDP_APPROVAL' | 'SYSTEM';
  note: string;
  createdAt: string;
}
```

---

## Component Interface (`LogStatusUsulan.vue`)

### Component Location
`src/components/rekomtek/LogStatusUsulan.vue`

### Component Props
```typescript
defineProps<{
  logs?: StatusLog[];
}>();
```

---

## Timeline Item Track Layout Model

```html
<div class="flex flex-col gap-6 relative">
  <div v-for="(log, index) in logs" :key="log.id" class="relative flex gap-4">
    <!-- Left Column: Node Dot & Connecting Track Line -->
    <div class="flex flex-col items-center shrink-0 w-8 relative">
      <!-- Connected Vertical Line to Next Item -->
      <div 
        v-if="index !== logs.length - 1" 
        class="absolute top-6 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-700/80" 
      />
      <!-- Node Circle Icon -->
      <div 
        :class="[
          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-2 border-white dark:border-slate-900 shadow-xs',
          isReturnLog(log) 
            ? 'bg-amber-500 text-white ring-4 ring-amber-50 dark:ring-amber-950/40' 
            : 'bg-[#066C2A] text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40'
        ]"
      >
        <span>{{ index + 1 }}</span>
      </div>
    </div>

    <!-- Right Column: Log Content -->
    <div class="flex flex-col gap-1.5 flex-1 min-w-0 pb-2">
      <!-- Actor & Time Header -->
      ...
    </div>
  </div>
</div>
```
