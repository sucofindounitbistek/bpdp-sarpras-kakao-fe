<script setup lang="ts">
// EscrowSaldoCard — status penyaluran ke rekening escrow (mock Odoo: SPP + status pembayaran).
import { computed } from 'vue';
import { LOCALIZATION } from '@/config/localization';
import { formatRupiah } from '@/utils/exportProposal';
import type { PencairanTahap } from '@/types/penyaluranDana';
import { Wallet, RefreshCw } from 'lucide-vue-next';

const props = defineProps<{ tahap: PencairanTahap }>();

const escrow = computed(() => props.tahap.escrow);
const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[s] ?? s;
</script>

<template>
  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <Wallet class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.tahap.saldoEscrow }}
      </h4>
      <span class="text-[10px] font-mono text-slate-400">CLIENT-SIMULATED (mock pembayaran escrow)</span>
    </div>
    <template v-if="escrow">
      <div class="grid grid-cols-2 gap-2 text-[11px]">
        <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.tahap.noSpp }}</p>
          <p class="font-mono font-semibold text-slate-700 dark:text-slate-200">{{ escrow.odooSppNo }}</p>
        </div>
        <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.tahap.statusPembayaran }}</p>
          <p class="font-semibold inline-flex items-center gap-1.5" :class="escrow.statusPembayaran === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'">
            <RefreshCw v-if="escrow.statusPembayaran === 'PENDING'" class="w-3 h-3 animate-spin-slow" />
            {{ statusLabel(escrow.statusPembayaran) }}
          </p>
        </div>
        <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.tahap.nominal }}</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">{{ formatRupiah(escrow.nominal) }}</p>
        </div>
        <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5">
          <p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.common.escrowInfo }}</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">{{ escrow.rekeningEscrow }} ({{ escrow.bank }})</p>
        </div>
      </div>
      <p class="mt-2 text-[10px] text-slate-400">{{ new Date(escrow.waktu).toLocaleString('id-ID') }}</p>
    </template>
    <p v-else class="text-xs text-slate-400 py-2">{{ LOCALIZATION.penyaluranDana.common.kosong }} — tahap belum diproses penyalurannya.</p>
  </div>
</template>
