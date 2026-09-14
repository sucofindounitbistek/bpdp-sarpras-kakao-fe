<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import { auditService, type AuditChange, type AuditLogDetail, type AuditLogSummary } from '@/services/audit.service';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Code2,
  Eye,
  FileDiff,
  Search,
  ShieldCheck,
  X,
} from 'lucide-vue-next';

const logs = ref<AuditLogSummary[]>([]);
const total = ref(0);
const page = ref(1);
const limit = 20;
const loading = ref(false);
const errorMessage = ref('');
const detailLoadingId = ref<number | null>(null);
const searchQuery = ref('');
const methodFilter = ref('ALL');
const statusCodeFilter = ref('');
const selectedLog = ref<AuditLogDetail | null>(null);
const showRawData = ref(false);

const mutationCount = computed(() => logs.value.filter((log) => log.method !== 'GET').length);
const failedCount = computed(() => logs.value.filter((log) => log.status_code >= 400).length);
const changeCount = computed(() => logs.value.reduce((count, log) => count + log.change_count, 0));
const hasPreviousPage = computed(() => page.value > 1);
const hasNextPage = computed(() => page.value * limit < total.value);

const loadLogs = async (targetPage = 1) => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await auditService.getList({
      page: targetPage,
      limit,
      request_id: searchQuery.value.trim() || undefined,
      method: methodFilter.value === 'ALL' ? undefined : methodFilter.value,
      status_code: statusCodeFilter.value ? Number(statusCodeFilter.value) : undefined,
    });
    logs.value = response.data;
    total.value = response.meta.total;
    page.value = response.meta.page;
  } catch (error) {
    logs.value = [];
    total.value = 0;
    errorMessage.value = error instanceof Error ? error.message : 'Gagal memuat audit log.';
  } finally {
    loading.value = false;
  }
};

const methodVariant = (method: string): 'info' | 'danger' | 'warning' | 'success' => {
  if (method === 'GET') return 'info';
  if (method === 'DELETE') return 'danger';
  if (method === 'PATCH' || method === 'PUT') return 'warning';
  return 'success';
};

const actionVariant = (action: AuditChange['action']): 'danger' | 'warning' | 'success' => {
  if (action === 'DELETE') return 'danger';
  if (action === 'UPDATE') return 'warning';
  return 'success';
};

const formatBytes = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(date);
};

const openDetail = async (log: AuditLogSummary) => {
  detailLoadingId.value = log.id;
  showRawData.value = false;
  try {
    selectedLog.value = await auditService.getById(log.id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Gagal memuat detail audit log.';
  } finally {
    detailLoadingId.value = null;
  }
};

const fieldLabels: Record<string, string> = {
  name: 'Nama',
  status: 'Status',
  access_token: 'Access Token',
  nomor_proposal: 'Nomor Proposal',
  total_anggaran: 'Total Anggaran',
  luas_lahan: 'Luas Lahan',
  status_kepemilikan: 'Status Kepemilikan',
  document_type: 'Jenis Dokumen',
  file_id: 'ID File',
};

const fieldLabel = (field: string) =>
  fieldLabels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const changeFields = (change: AuditChange) =>
  [...new Set([...Object.keys(change.before || {}), ...Object.keys(change.after || {})])];

const isRedacted = (value: unknown) => value === '[REDACTED]';

const formatValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined) return 'Tidak ada';
  if (isRedacted(value)) return 'Disensor';
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  if (field.includes('anggaran') || field.includes('harga')) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
  }
  if (Array.isArray(value)) return value.map((item) => formatValue(field, item)).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${fieldLabel(key)}: ${formatValue(key, item)}`)
      .join(' · ');
  }
  return String(value).replace(/_/g, ' ');
};

onMounted(() => loadLogs());
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <Breadcrumb />
        <div class="flex items-center gap-2 mt-0.5">
          <ShieldCheck class="size-5 text-[#066C2A]" />
          <h1 class="text-base md:text-lg font-bold text-slate-900 font-apple-display-lg">Audit Log API</h1>
        </div>
        <p class="text-xs text-slate-500 font-apple-caption">Catatan teknis request dan perubahan data sistem. Hanya dapat diakses oleh BPDP.</p>
      </div>
      <Badge variant="success" custom-class="self-start md:self-auto">Terhubung ke API</Badge>
    </header>

    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Ringkasan audit log">
      <div class="bg-white/95 rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
        <div class="size-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><Activity class="size-5" /></div>
        <div><p class="text-[10px] uppercase tracking-wide font-bold text-slate-400">Request</p><p class="text-xl font-bold text-slate-900">{{ total }}</p></div>
      </div>
      <div class="bg-white/95 rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
        <div class="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ShieldCheck class="size-5" /></div>
        <div><p class="text-[10px] uppercase tracking-wide font-bold text-slate-400">Mutasi</p><p class="text-xl font-bold text-slate-900">{{ mutationCount }}</p></div>
      </div>
      <div class="bg-white/95 rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
        <div class="size-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><AlertTriangle class="size-5" /></div>
        <div><p class="text-[10px] uppercase tracking-wide font-bold text-slate-400">Gagal</p><p class="text-xl font-bold text-slate-900">{{ failedCount }}</p></div>
      </div>
      <div class="bg-white/95 rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
        <div class="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><FileDiff class="size-5" /></div>
        <div><p class="text-[10px] uppercase tracking-wide font-bold text-slate-400">Perubahan</p><p class="text-xl font-bold text-slate-900">{{ changeCount }}</p></div>
      </div>
    </section>

    <form class="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col lg:flex-row gap-3" aria-label="Filter audit log" @submit.prevent="loadLogs(1)">
      <label class="relative flex-1">
        <span class="sr-only">Cari audit log</span>
        <Search class="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          data-testid="audit-search"
          type="search"
          placeholder="Cari request ID..."
          class="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
        />
      </label>
      <select v-model="methodFilter" aria-label="Filter method" class="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20">
        <option value="ALL">Semua Method</option>
        <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
      </select>
      <input v-model="statusCodeFilter" type="number" min="100" max="599" aria-label="Filter status HTTP" placeholder="Status HTTP" class="h-10 w-full lg:w-36 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20" />
      <Button type="submit" :loading="loading">Terapkan</Button>
    </form>

    <section class="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex-1">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th class="py-3.5 px-4">Waktu</th>
              <th class="py-3.5 px-4">Request ID</th>
              <th class="py-3.5 px-4">Aktor</th>
              <th class="py-3.5 px-4">Request</th>
              <th class="py-3.5 px-4 text-center">Status</th>
              <th class="py-3.5 px-4 text-center">Perubahan</th>
              <th class="py-3.5 px-4 text-center">Durasi</th>
              <th class="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            <tr v-if="loading">
              <td colspan="8" class="py-14 text-center text-slate-400">Memuat audit log...</td>
            </tr>
            <tr v-else-if="errorMessage">
              <td colspan="8" class="py-14 text-center text-rose-600">
                <p>{{ errorMessage }}</p>
                <Button variant="outline" size="sm" custom-class="mt-3" @click="loadLogs(page)">Coba Lagi</Button>
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="8" class="py-14 text-center text-slate-400">Tidak ada audit log yang sesuai dengan filter.</td>
            </tr>
            <tr v-for="log in logs" v-else :key="log.id" data-testid="audit-row" class="hover:bg-slate-50/60 transition-colors">
              <td class="py-3.5 px-4 whitespace-nowrap text-slate-500">{{ formatDate(log.created_at) }}</td>
              <td class="py-3.5 px-4 font-mono font-semibold text-slate-800">{{ log.request_id }}</td>
              <td class="py-3.5 px-4"><p class="font-bold text-slate-900">{{ log.actor_name || 'Sistem' }}</p><p class="text-[10px] font-mono text-slate-400">{{ log.actor_role || '-' }}</p></td>
              <td class="py-3.5 px-4"><div class="flex items-center gap-2"><Badge :variant="methodVariant(log.method)">{{ log.method }}</Badge><span class="font-mono text-[11px] text-slate-600">{{ log.path }}</span></div></td>
              <td class="py-3.5 px-4 text-center"><Badge :variant="log.status_code >= 400 ? 'danger' : 'success'">{{ log.status_code }}</Badge></td>
              <td class="py-3.5 px-4 text-center"><span class="font-bold" :class="log.change_count ? 'text-[#066C2A]' : 'text-slate-400'">{{ log.change_count }}</span></td>
              <td class="py-3.5 px-4 text-center"><span class="inline-flex items-center gap-1 text-slate-500"><Clock3 class="size-3.5" />{{ log.duration_ms }} ms</span></td>
              <td class="py-3.5 px-4 text-center">
                <Button :data-testid="`audit-detail-${log.id}`" variant="outline" size="sm" custom-class="p-2" :loading="detailLoadingId === log.id" :aria-label="`Lihat detail ${log.request_id}`" @click="openDetail(log)"><Eye v-if="detailLoadingId !== log.id" class="size-4" /></Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
        <p class="text-[11px] text-slate-400">Menampilkan {{ logs.length }} dari {{ total }} request</p>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" :disabled="!hasPreviousPage || loading" aria-label="Halaman sebelumnya" @click="loadLogs(page - 1)"><ChevronLeft class="size-4" /></Button>
          <span class="size-8 rounded-lg bg-[#066C2A] text-white text-xs font-bold flex items-center justify-center">{{ page }}</span>
          <Button variant="outline" size="sm" :disabled="!hasNextPage || loading" aria-label="Halaman berikutnya" @click="loadLogs(page + 1)"><ChevronRight class="size-4" /></Button>
        </div>
      </footer>
    </section>

    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
      <div v-if="selectedLog" class="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="audit-detail-title">
        <button class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" aria-label="Tutup detail audit" @click="selectedLog = null" />
        <aside class="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
          <header class="shrink-0 p-5 border-b border-slate-200 flex items-start justify-between gap-4">
            <div><p class="text-[10px] font-bold tracking-wider text-[#066C2A] uppercase">Detail Request</p><h2 id="audit-detail-title" class="text-lg font-bold text-slate-900 mt-1">{{ selectedLog.request_id }}</h2><p class="text-xs text-slate-500 mt-1">{{ formatDate(selectedLog.created_at) }}</p></div>
            <Button variant="ghost" size="sm" custom-class="p-2" aria-label="Tutup" @click="selectedLog = null"><X class="size-5" /></Button>
          </header>

          <div data-testid="audit-detail-scroll" class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-8 flex flex-col gap-5">
            <section class="grid grid-cols-2 gap-3 text-xs">
              <div class="rounded-xl bg-slate-50 border border-slate-100 p-3"><p class="text-[10px] uppercase font-bold text-slate-400">Aktor</p><p class="font-bold text-slate-900 mt-1">{{ selectedLog.actor_name || 'Sistem' }}</p><p class="font-mono text-[10px] text-slate-500">{{ selectedLog.actor_role || '-' }}</p></div>
              <div class="rounded-xl bg-slate-50 border border-slate-100 p-3"><p class="text-[10px] uppercase font-bold text-slate-400">Request</p><div class="flex items-center gap-2 mt-1"><Badge :variant="methodVariant(selectedLog.method)">{{ selectedLog.method }}</Badge><span class="font-mono text-[10px] break-all">{{ selectedLog.path }}</span></div></div>
              <div class="rounded-xl bg-slate-50 border border-slate-100 p-3"><p class="text-[10px] uppercase font-bold text-slate-400">Client</p><p class="font-mono text-slate-700 mt-1">{{ selectedLog.ip_address || '-' }}</p><p class="text-[10px] text-slate-400 truncate">{{ selectedLog.user_agent || '-' }}</p></div>
              <div class="rounded-xl bg-slate-50 border border-slate-100 p-3"><p class="text-[10px] uppercase font-bold text-slate-400">Respons</p><p class="font-bold mt-1" :class="selectedLog.status_code >= 400 ? 'text-rose-600' : 'text-emerald-600'">HTTP {{ selectedLog.status_code }} · {{ selectedLog.duration_ms }} ms</p><p class="text-[10px] text-slate-400">{{ formatBytes(selectedLog.request_size_bytes) }} masuk · {{ formatBytes(selectedLog.response_size_bytes) }} keluar</p></div>
            </section>

            <section class="flex flex-col gap-3">
              <div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2"><FileDiff class="size-4 text-[#066C2A]" /><h3 class="text-sm font-bold text-slate-900">Perubahan Data</h3></div><Badge variant="secondary">{{ selectedLog.changes.length }} entitas</Badge></div>
              <div v-if="selectedLog.changes.length === 0" class="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">Request gagal tanpa perubahan data yang tersimpan.</div>
              <article v-for="(change, index) in selectedLog.changes" v-else :key="`${change.entity_type}-${change.entity_id}-${index}`" class="rounded-2xl border border-slate-200 overflow-hidden">
                <header class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3"><div><p class="font-bold text-sm text-slate-900">{{ change.entity_type }}</p><p class="font-mono text-[10px] text-slate-400">ID: {{ change.entity_id }}</p></div><Badge :variant="actionVariant(change.action)">{{ change.action }}</Badge></header>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="border-b border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th class="px-4 py-2.5">Field</th>
                        <th v-if="change.action !== 'CREATE'" class="px-4 py-2.5">{{ change.action === 'DELETE' ? 'Data Sebelum Dihapus' : 'Sebelum' }}</th>
                        <th v-if="change.action !== 'DELETE'" class="px-4 py-2.5">{{ change.action === 'CREATE' ? 'Data Baru' : 'Sesudah' }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="field in changeFields(change)" :key="field" class="align-top">
                        <th class="px-4 py-3 font-semibold text-slate-700 bg-slate-50/50 min-w-36">{{ fieldLabel(field) }}</th>
                        <td v-if="change.action !== 'CREATE'" class="px-4 py-3 text-slate-600 min-w-44">
                          <span v-if="isRedacted(change.before?.[field])" class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">Disensor</span>
                          <span v-else>{{ formatValue(field, change.before?.[field]) }}</span>
                        </td>
                        <td v-if="change.action !== 'DELETE'" class="px-4 py-3 text-slate-900 font-medium min-w-44">
                          <span v-if="isRedacted(change.after?.[field])" class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">Disensor</span>
                          <span v-else>{{ formatValue(field, change.after?.[field]) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>
            </section>

            <section class="rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                data-testid="audit-raw-toggle"
                class="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-left transition-colors"
                :aria-expanded="showRawData"
                @click="showRawData = !showRawData"
              >
                <span class="flex items-center gap-2">
                  <Code2 class="size-4 text-slate-500" />
                  <span><span class="block text-xs font-bold text-slate-800">{{ showRawData ? 'Sembunyikan' : 'Lihat' }} Data Teknis</span><span class="block text-[10px] text-slate-400 mt-0.5">Record audit yang sudah disanitasi</span></span>
                </span>
                <ChevronUp v-if="showRawData" class="size-4 text-slate-400" />
                <ChevronDown v-else class="size-4 text-slate-400" />
              </button>
              <div v-if="showRawData" class="border-t border-slate-200 bg-slate-950 p-4 overflow-x-auto">
                <pre class="text-[11px] leading-relaxed text-emerald-300 font-mono whitespace-pre-wrap break-all">{{ JSON.stringify(selectedLog, null, 2) }}</pre>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </Transition>
  </div>
</template>
