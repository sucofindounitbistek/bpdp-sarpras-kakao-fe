<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  X,
  Clock,
  UserCheck,
  FileText,
  RefreshCw,
  XCircle,
  CheckCircle2,
  ArrowRightLeft,
  Download,
} from 'lucide-vue-next';
import { LOCALIZATION } from '@/config/localization';
import {
  proposalAuditService,
  type ProposalAuditEvent,
  type AuditDocumentRef,
} from '@/services/proposalAudit.service';

export interface AuditEntry {
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  detail: string;
  type: 'submit' | 'verify' | 'approve' | 'reject' | 'revision' | 'change';
}

const props = withDefaults(
  defineProps<{
    entries?: AuditEntry[];
    proposalId?: number | string;
  }>(),
  {
    entries: () => [],
    proposalId: undefined,
  }
);

const emit = defineEmits<{
  close: [];
}>();

const loading = ref(false);
const realEvents = ref<ProposalAuditEvent[]>([]);
const downloadingDocId = ref<number | null>(null);

function formatDateWib(isoStr: string) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return (
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d) + ' WIB'
  );
}

function mapActionToType(action: string, _stage?: string): AuditEntry['type'] {
  const a = (action || '').toUpperCase();
  if (a.includes('REVISE') || a.includes('RETURN') || a.includes('KEMBALIKAN') || a.includes('REVISI')) return 'revision';
  if (a.includes('REJECT') || a.includes('TOLAK')) return 'reject';
  if (a.includes('APPROVE') || a.includes('SETUJUI') || a.includes('PUBLISH') || a.includes('SELESAI') || a.includes('VALID')) return 'approve';
  if (a.includes('SUBMIT') || a.includes('AJUKAN') || a.includes('CREATE')) return 'submit';
  if (a.includes('VERIFY') || a.includes('VALIDASI') || a.includes('ASISTENSI') || a.includes('TELAAH')) return 'verify';
  return 'change';
}

async function fetchRealLogs() {
  if (!props.proposalId) return;
  loading.value = true;
  try {
    const res = await proposalAuditService.getAuditLogs(props.proposalId, { limit: 50 });
    realEvents.value = res.data || [];
  } catch (err) {
    console.warn('Gagal memuat log audit real:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.proposalId) {
    fetchRealLogs();
  }
});

watch(
  () => props.proposalId,
  (newVal) => {
    if (newVal) fetchRealLogs();
  }
);

async function downloadDoc(eventId: number, doc: AuditDocumentRef) {
  if (!props.proposalId) return;
  downloadingDocId.value = doc.id;
  try {
    await proposalAuditService.downloadDocument(props.proposalId, eventId, doc.id, doc.name);
  } catch (err: any) {
    alert('Gagal mengunduh dokumen bukti: ' + (err?.message || 'Error'));
  } finally {
    downloadingDocId.value = null;
  }
}

const typeIcons: Record<AuditEntry['type'], typeof CheckCircle2> = {
  submit: FileText,
  verify: UserCheck,
  approve: CheckCircle2,
  reject: XCircle,
  revision: RefreshCw,
  change: ArrowRightLeft,
};

const typeColors: Record<AuditEntry['type'], string> = {
  submit: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300',
  verify: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300',
  approve: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300',
  reject: 'text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300',
  revision: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300',
  change: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
};

const typeLabels: Record<AuditEntry['type'], string> = {
  submit: LOCALIZATION.auditTrailSidebar.types.submit,
  verify: LOCALIZATION.auditTrailSidebar.types.verify,
  approve: LOCALIZATION.auditTrailSidebar.types.approve,
  reject: LOCALIZATION.auditTrailSidebar.types.reject,
  revision: LOCALIZATION.auditTrailSidebar.types.revision,
  change: LOCALIZATION.auditTrailSidebar.types.change,
};
</script>

<template>
  <Transition name="sidebar">
    <div class="fixed top-0 right-0 z-50 h-screen w-96 max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <Clock class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.auditTrailSidebar.title }}</h3>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            v-if="props.proposalId"
            type="button"
            title="Muat Ulang Riwayat"
            @click="fetchRealLogs"
            class="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-500"
          >
            <RefreshCw :class="['w-4 h-4', loading ? 'animate-spin text-emerald-600' : '']" />
          </button>
          <button
            type="button"
            @click="emit('close')"
            class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X class="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <!-- Loading Indicator -->
        <div v-if="loading && realEvents.length === 0" class="flex flex-col gap-3 py-6 items-center justify-center text-slate-400 text-xs">
          <RefreshCw class="w-5 h-5 animate-spin text-emerald-600" />
          <span>Memuat riwayat audit dari server...</span>
        </div>

        <!-- Real DB Events List -->
        <template v-else-if="realEvents.length > 0">
          <div v-for="(event, idx) in realEvents" :key="event.id" class="flex gap-3">
            <div class="flex flex-col items-center gap-1 shrink-0">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0', typeColors[mapActionToType(event.action, event.stage)]]">
                <component :is="typeIcons[mapActionToType(event.action, event.stage)]" class="w-4 h-4" />
              </div>
              <div v-if="idx < realEvents.length - 1" class="w-px flex-1 bg-slate-200 dark:bg-slate-800 my-1" />
            </div>

            <div class="flex flex-col gap-1.5 pb-4 flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 flex-wrap">
                <span class="text-[10px] font-semibold text-slate-400 font-mono">{{ formatDateWib(event.created_at) }}</span>
                <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-full', typeColors[mapActionToType(event.action, event.stage)]]">
                  {{ typeLabels[mapActionToType(event.action, event.stage)] }}
                </span>
              </div>
              <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span class="font-bold text-slate-900 dark:text-white">{{ event.actor_name }}</span>
                <span class="text-slate-400 text-[11px]"> ({{ event.actor_role_name || event.actor_role_code }})</span>:
                {{ event.summary }}
              </p>

              <!-- Document Evidence Pills -->
              <div v-if="event.documents && event.documents.length > 0" class="flex flex-wrap gap-1.5 mt-1">
                <button
                  v-for="doc in event.documents"
                  :key="doc.id"
                  type="button"
                  @click="downloadDoc(event.id, doc)"
                  :disabled="downloadingDocId === doc.id"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Download class="w-3 h-3 text-emerald-600" />
                  <span class="truncate max-w-[160px]">{{ doc.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Fallback Static Entries (only if no proposalId provided) -->
        <template v-else-if="!props.proposalId && props.entries && props.entries.length > 0">
          <div v-for="(entry, idx) in props.entries" :key="idx" class="flex gap-3">
            <div class="flex flex-col items-center gap-1 shrink-0">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0', typeColors[entry.type]]">
                <component :is="typeIcons[entry.type]" class="w-4 h-4" />
              </div>
              <div v-if="idx < props.entries.length - 1" class="w-px flex-1 bg-slate-200 dark:bg-slate-800 my-1" />
            </div>

            <div class="flex flex-col gap-1 pb-4 flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 flex-wrap">
                <span class="text-[10px] font-semibold text-slate-400 font-mono">{{ entry.timestamp }}</span>
                <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-full', typeColors[entry.type]]">{{ typeLabels[entry.type] }}</span>
              </div>
              <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span class="font-bold text-slate-900 dark:text-white">{{ entry.actor }}</span> {{ LOCALIZATION.auditTrailSidebar.asRole }} <span class="font-medium text-slate-600 dark:text-slate-400">{{ entry.role }}</span>
                {{ entry.detail }}
              </p>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center text-center py-12 px-4 text-slate-400 gap-2">
          <Clock class="w-8 h-8 text-slate-300 dark:text-slate-700" />
          <p class="text-xs font-semibold">Belum Ada Riwayat Audit</p>
          <p class="text-[11px] text-slate-400">Setiap mutasi atau tindakan pada usulan ini akan otomatis tercatat di sini.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.25s ease;
}
.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(100%);
}
</style>
