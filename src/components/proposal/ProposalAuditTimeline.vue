<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  proposalAuditService,
  type ProposalAuditEvent,
  type AuditDocumentRef,
} from '@/services/proposalAudit.service';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import {
  Clock,
  User,
  Shield,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
} from 'lucide-vue-next';

const props = defineProps<{
  proposalId: number | string;
}>();

const loading = ref(true);
const refreshing = ref(false);
const error = ref<string | null>(null);
const events = ref<ProposalAuditEvent[]>([]);
const selectedDomain = ref<'ALL' | 'PROPOSAL' | 'PENYALURAN_BARANG'>('ALL');
const expandedChanges = ref<Record<number, boolean>>({});

async function loadAuditLogs() {
  if (!props.proposalId) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await proposalAuditService.getAuditLogs(props.proposalId, {
      domain: selectedDomain.value === 'ALL' ? undefined : selectedDomain.value,
    });
    events.value = res.data || [];
  } catch (err: any) {
    error.value = err?.message || 'Gagal memuat riwayat audit proposal';
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function handleRefresh() {
  refreshing.value = true;
  loadAuditLogs();
}

watch(
  () => props.proposalId,
  (newVal) => {
    if (newVal) loadAuditLogs();
  }
);

watch(
  () => selectedDomain.value,
  () => {
    loadAuditLogs();
  }
);

onMounted(() => {
  loadAuditLogs();
});

const filteredEvents = computed(() => {
  if (selectedDomain.value === 'ALL') return events.value;
  return events.value.filter((e) => e.domain === selectedDomain.value);
});

function toggleChanges(eventId: number) {
  expandedChanges.value[eventId] = !expandedChanges.value[eventId];
}

function formatDate(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(d) + ' WIB';
}

function getStageBadgeVariant(stage: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' {
  switch (stage) {
    case 'PENGAJUAN':
      return 'info';
    case 'VERIFIKASI_KABUPATEN':
    case 'ASISTENSI_PROVINSI':
      return 'warning';
    case 'REKOMTEK_DITJENBUN':
    case 'PENELITIAN_BPDP':
      return 'secondary';
    case 'SK_DIRUT':
    case 'SELESAI':
      return 'success';
    case 'PENYALURAN_BARANG':
      return 'primary';
    default:
      return 'secondary';
  }
}

const downloadingDocId = ref<number | null>(null);

async function downloadEvidence(eventId: number, doc: AuditDocumentRef) {
  downloadingDocId.value = doc.id;
  try {
    await proposalAuditService.downloadDocument(props.proposalId, eventId, doc.id, doc.name);
  } catch (err: any) {
    alert('Gagal mengunduh dokumen bukti: ' + (err?.message || 'Server error'));
  } finally {
    downloadingDocId.value = null;
  }
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Riwayat Bisnis & Audit Terpadu
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pencatatan resmi setiap perubahan status, verifikasi berkas, dan tahapan penyaluran barang.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Filter Domain Chips -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all',
              selectedDomain === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            ]"
            @click="selectedDomain = 'ALL'"
          >
            Semua
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all',
              selectedDomain === 'PROPOSAL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            ]"
            @click="selectedDomain = 'PROPOSAL'"
          >
            Proposal
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all',
              selectedDomain === 'PENYALURAN_BARANG'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
            ]"
            @click="selectedDomain = 'PENYALURAN_BARANG'"
          >
            Penyaluran Barang
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          class="gap-1.5 text-xs rounded-xl"
          :disabled="loading || refreshing"
          @click="handleRefresh"
        >
          <RefreshCw :class="['w-3.5 h-3.5', refreshing ? 'animate-spin text-emerald-600' : '']" />
          <span class="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
      <AlertCircle class="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <div class="text-xs text-rose-800 dark:text-rose-300">
        <p class="font-bold">Gagal memuat riwayat audit</p>
        <p class="mt-0.5">{{ error }}</p>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading && !refreshing" class="space-y-4 py-2">
      <div v-for="i in 3" :key="i" class="flex gap-4">
        <Skeleton class="w-8 h-8 rounded-full shrink-0" />
        <div class="space-y-2 flex-1">
          <Skeleton class="h-4 w-1/3" />
          <Skeleton class="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredEvents.length === 0" class="py-12 text-center">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
        <Clock class="w-6 h-6" />
      </div>
      <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Riwayat Audit</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
        Setiap aktivitas mutasi bisnis, verifikasi berkas, dan penyaluran barang resmi akan tercatat otomatis di sini.
      </p>
    </div>

    <!-- Timeline Event List -->
    <div v-else class="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      <div
        v-for="ev in filteredEvents"
        :key="ev.id"
        class="relative group"
      >
        <!-- Circle Icon Marker on Line -->
        <div
          :class="[
            'absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110',
            ev.domain === 'PENYALURAN_BARANG'
              ? 'bg-purple-600 text-white'
              : 'bg-emerald-600 text-white',
          ]"
        >
          <Package v-if="ev.domain === 'PENYALURAN_BARANG'" class="w-3.5 h-3.5" />
          <CheckCircle2 v-else class="w-3.5 h-3.5" />
        </div>

        <!-- Event Card -->
        <div class="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4 sm:p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-xs space-y-3">
          <!-- Row 1: Header (Action, Stage, Time) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <Badge :variant="getStageBadgeVariant(ev.stage)" class="text-3xs tracking-wider uppercase font-bold">
                {{ ev.stage_label || ev.stage }}
              </Badge>
              <span
                v-if="ev.domain === 'PENYALURAN_BARANG'"
                class="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
              >
                Penyaluran Barang
              </span>
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {{ ev.action_label || ev.action }}
              </span>
            </div>

            <span class="text-3xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {{ formatDate(ev.created_at) }}
            </span>
          </div>

          <!-- Row 2: Summary -->
          <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {{ ev.summary }}
          </p>

          <!-- Status Transition Pill (if any) -->
          <div v-if="ev.status_before || ev.status_after" class="flex items-center gap-2 text-xs">
            <span class="text-3xs uppercase font-bold text-slate-400">Status:</span>
            <div class="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
              <span class="text-3xs font-semibold text-slate-600 dark:text-slate-400">
                {{ ev.status_before || 'AWAL' }}
              </span>
              <ArrowRight class="w-3 h-3 text-slate-400" />
              <span class="text-3xs font-bold text-emerald-700 dark:text-emerald-400">
                {{ ev.status_after }}
              </span>
            </div>
          </div>

          <!-- Reason / Notes (if present) -->
          <div
            v-if="ev.reason"
            class="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"
          >
            <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div class="space-y-0.5">
              <span class="font-bold text-3xs uppercase tracking-wider text-amber-700 dark:text-amber-400">Catatan / Alasan:</span>
              <p>{{ ev.reason }}</p>
            </div>
          </div>

          <!-- Row 3: Actor Information -->
          <div class="flex items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
            <User class="w-3.5 h-3.5 text-slate-400" />
            <span class="font-medium text-slate-700 dark:text-slate-300">{{ ev.actor_name }}</span>
            <span class="text-slate-300 dark:text-slate-600">•</span>
            <span class="inline-flex items-center gap-1 text-3xs font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <Shield class="w-2.5 h-2.5 text-slate-500" />
              {{ ev.actor_role_name || ev.actor_role_code }}
            </span>
          </div>

          <!-- Changes (Diff View) -->
          <div v-if="ev.changes && ev.changes.length > 0" class="pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              class="flex items-center gap-1 text-3xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              @click="toggleChanges(ev.id)"
            >
              <span>{{ expandedChanges[ev.id] ? 'Sembunyikan' : 'Lihat' }} {{ ev.changes.length }} Perubahan Data</span>
              <ChevronUp v-if="expandedChanges[ev.id]" class="w-3 h-3" />
              <ChevronDown v-else class="w-3 h-3" />
            </button>

            <div v-if="expandedChanges[ev.id]" class="mt-2 space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
              <div
                v-for="(ch, idx) in ev.changes"
                :key="idx"
                class="text-xs flex flex-wrap items-baseline gap-2 bg-white/60 dark:bg-slate-900/40 p-2 rounded-lg"
              >
                <span class="font-semibold text-slate-600 dark:text-slate-400 min-w-28 text-3xs uppercase tracking-wider">
                  {{ ch.label || ch.field }}:
                </span>
                <span class="text-slate-500 line-through text-3xs">{{ ch.before ?? 'kosong' }}</span>
                <ArrowRight class="w-2.5 h-2.5 text-slate-400 inline" />
                <span class="font-semibold text-emerald-700 dark:text-emerald-400 text-3xs">{{ ch.after ?? 'dihapus' }}</span>
              </div>
            </div>
          </div>

          <!-- Evidence Documents -->
          <div v-if="ev.documents && ev.documents.length > 0" class="pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <span class="text-3xs uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
              Dokumen Bukti Lampiran:
            </span>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="doc in ev.documents"
                :key="doc.id"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <FileText class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span class="font-medium text-slate-700 dark:text-slate-300 max-w-44 truncate">
                  {{ doc.name }}
                </span>
                <button
                  type="button"
                  class="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  :title="'Unduh ' + doc.name"
                  :disabled="downloadingDocId === doc.id"
                  @click="downloadEvidence(ev.id, doc)"
                >
                  <RefreshCw v-if="downloadingDocId === doc.id" class="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <Download v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
