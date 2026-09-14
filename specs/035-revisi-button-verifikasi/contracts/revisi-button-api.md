# Interface Contract: Dynamic Verification Action Button (035-revisi-button-verifikasi)

## Component Contract: `StepVerifikasiPekebunDanDokumenProposal.vue`

### Dynamic Primary Action Button
Renders at bottom-right of the verification step layout:

```html
<button
  type="button"
  @click="hasRejectedItems ? submitRejection() : validateAndProceed()"
  :class="[
    'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm',
    hasRejectedItems
      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20'
      : 'bg-[#066C2A] hover:bg-emerald-800 text-white shadow-emerald-900/20'
  ]"
>
  <template v-if="hasRejectedItems">
    <RotateCcw class="w-4 h-4" />
    {{ LOCALIZATION.verification.returnForRevision }}
  </template>
  <template v-else>
    Simpan & Lanjut ke SK CPCL
    <span class="text-lg leading-none">&rarr;</span>
  </template>
</button>
```

---

## Localization Contract: `src/config/localization.ts`

```typescript
verification: {
  returnForRevision: 'Kembalikan Untuk Revisi',
  rejectionNotesWarning: 'Harap berikan catatan alasan penolakan pada item yang ditolak.',
  rejectionSuccessToast: 'Proposal berhasil dikembalikan ke Pemohon untuk perbaikan berkas.'
}
```
