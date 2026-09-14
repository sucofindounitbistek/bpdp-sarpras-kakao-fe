<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import { useToast } from '@/composables/useToast';
import type { MasterDokumenCatalog } from '@/types/masterSarpras';
import {
  FileText,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  HardDrive,
  Loader2,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-vue-next';

const masterStore = useMasterSarprasStore();
const toast = useToast();

const searchQuery = ref('');
const statusFilter = ref<'ALL' | 'ACTIVE' | 'INACTIVE' | 'HAS_TEMPLATE'>('ALL');
const viewMode = ref<'table' | 'grid'>('table');

// Modal Form (Create / Edit) State
const showFormModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);

interface FormDocState {
  code: string;
  name: string;
  description: string;
  format_download_url: string;
  max_size_mb: number;
  allowed_types: string[];
  is_active: boolean;
  is_wajib: boolean;
}

const formState = ref<FormDocState>({
  code: '',
  name: '',
  description: '',
  format_download_url: '',
  max_size_mb: 5,
  allowed_types: ['PDF', 'DOCX', 'XLSX', 'IMAGE'],
  is_active: true,
  is_wajib: true,
});

// Delete Confirmation Modal State
const showDeleteModal = ref(false);
const deleteTargetDoc = ref<MasterDokumenCatalog | null>(null);
const isDeleting = ref(false);

onMounted(async () => {
  await masterStore.fetchMasterData(true);
});

// ─── Filtered Data ────────────────────────────────────────────────────────────
const filteredDocs = computed(() => {
  return masterStore.dokumenCatalog.filter((doc) => {
    // Search query filter
    const matchesSearch =
      !searchQuery.value ||
      doc.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.value.toLowerCase()));

    // Status filter
    let matchesStatus = true;
    if (statusFilter.value === 'ACTIVE') {
      matchesStatus = doc.is_active;
    } else if (statusFilter.value === 'INACTIVE') {
      matchesStatus = !doc.is_active;
    } else if (statusFilter.value === 'HAS_TEMPLATE') {
      matchesStatus = !!doc.format_download_url && doc.format_download_url.trim() !== '';
    }

    return matchesSearch && matchesStatus;
  });
});

// ─── Statistics ───────────────────────────────────────────────────────────────
const stats = computed(() => {
  const total = masterStore.dokumenCatalog.length;
  const active = masterStore.dokumenCatalog.filter((d) => d.is_active).length;
  const withTemplate = masterStore.dokumenCatalog.filter(
    (d) => d.format_download_url && d.format_download_url.trim() !== ''
  ).length;
  return { total, active, withTemplate };
});

// ─── Format Helpers ───────────────────────────────────────────────────────────
function formatBytesToMB(bytes?: number): string {
  if (!bytes || bytes <= 0) return '5 MB';
  const mb = bytes / (1024 * 1024);
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
}

function parseMimeTypes(mimeStr?: string | null): { label: string; bg: string; text: string }[] {
  if (!mimeStr) return [{ label: 'PDF', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' }];
  const badges: { label: string; bg: string; text: string }[] = [];
  const lower = mimeStr.toLowerCase();
  if (lower.includes('pdf')) {
    badges.push({ label: 'PDF', bg: 'bg-rose-50 border-rose-200/60', text: 'text-rose-700' });
  }
  if (lower.includes('word') || lower.includes('docx') || lower.includes('msword')) {
    badges.push({ label: 'DOCX', bg: 'bg-blue-50 border-blue-200/60', text: 'text-blue-700' });
  }
  if (lower.includes('sheet') || lower.includes('excel') || lower.includes('xlsx')) {
    badges.push({ label: 'XLSX', bg: 'bg-emerald-50 border-emerald-200/60', text: 'text-emerald-700' });
  }
  if (lower.includes('image') || lower.includes('jpeg') || lower.includes('png') || lower.includes('webp')) {
    badges.push({ label: 'GAMBAR', bg: 'bg-amber-50 border-amber-200/60', text: 'text-amber-700' });
  }
  return badges.length ? badges : [{ label: 'SEMUA', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600' }];
}

function buildMimeString(types: string[]): string {
  const mimeMap: Record<string, string> = {
    PDF: 'application/pdf',
    IMAGE: 'image/jpeg,image/png,image/webp',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return types.map((t) => mimeMap[t] || '').filter(Boolean).join(',');
}

// ─── Modal Actions ────────────────────────────────────────────────────────────
function openCreateModal() {
  isEditing.value = false;
  formState.value = {
    code: '',
    name: '',
    description: '',
    format_download_url: '',
    max_size_mb: 5,
    allowed_types: ['PDF', 'DOCX', 'XLSX', 'IMAGE'],
    is_active: true,
    is_wajib: true,
  };
  showFormModal.value = true;
}

function openEditModal(doc: MasterDokumenCatalog) {
  isEditing.value = true;

  const currentTypes: string[] = [];
  const mimeStr = (doc.allowed_mime_types || '').toLowerCase();
  if (mimeStr.includes('pdf')) currentTypes.push('PDF');
  if (mimeStr.includes('word') || mimeStr.includes('docx')) currentTypes.push('DOCX');
  if (mimeStr.includes('sheet') || mimeStr.includes('excel') || mimeStr.includes('xlsx')) currentTypes.push('XLSX');
  if (mimeStr.includes('image') || mimeStr.includes('jpeg') || mimeStr.includes('png')) currentTypes.push('IMAGE');

  const maxMb = doc.max_size_bytes ? Math.round(doc.max_size_bytes / (1024 * 1024)) : 5;

  formState.value = {
    code: doc.code,
    name: doc.name,
    description: doc.description || '',
    format_download_url: doc.format_download_url || '',
    max_size_mb: maxMb > 0 ? maxMb : 5,
    allowed_types: currentTypes.length ? currentTypes : ['PDF', 'IMAGE'],
    is_active: doc.is_active,
    is_wajib: doc.is_wajib !== false,
  };
  showFormModal.value = true;
}

function closeFormModal() {
  showFormModal.value = false;
}

async function handleSaveDocument() {
  const code = formState.value.code.trim().toUpperCase();
  const name = formState.value.name.trim();

  if (!code) {
    toast.error('Kode dokumen persyaratan wajib diisi');
    return;
  }
  if (!name) {
    toast.error('Nama dokumen persyaratan wajib diisi');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      code,
      name,
      description: formState.value.description.trim() || undefined,
      format_download_url: formState.value.format_download_url.trim() || undefined,
      allowed_mime_types: buildMimeString(formState.value.allowed_types),
      max_size_bytes: formState.value.max_size_mb * 1024 * 1024,
      is_active: formState.value.is_active,
      is_wajib: formState.value.is_wajib,
    };

    if (isEditing.value) {
      await masterStore.updateDokumen(code, payload);
      toast.success('Dokumen persyaratan berhasil diperbarui');
    } else {
      await masterStore.createDokumen(payload);
      toast.success('Dokumen persyaratan baru berhasil ditambahkan');
    }

    closeFormModal();
  } catch (err: any) {
    console.error('Failed to save document:', err);
    toast.error(err?.response?.data?.error?.message || err?.message || 'Gagal menyimpan dokumen persyaratan');
  } finally {
    isSubmitting.value = false;
  }
}

// ─── Status Toggle ────────────────────────────────────────────────────────────
async function handleToggleStatus(doc: MasterDokumenCatalog) {
  const nextStatus = !doc.is_active;
  try {
    await masterStore.toggleDokumenStatus(doc.code, nextStatus);
    toast.success(`Status dokumen ${doc.name} diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}`);
  } catch (err: any) {
    console.error('Failed to update document status:', err);
    toast.error(err?.response?.data?.error?.message || 'Gagal mengubah status dokumen');
  }
}

// ─── Delete Actions ───────────────────────────────────────────────────────────
function confirmDelete(doc: MasterDokumenCatalog) {
  deleteTargetDoc.value = doc;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  deleteTargetDoc.value = null;
}

async function executeDelete() {
  if (!deleteTargetDoc.value) return;

  isDeleting.value = true;
  try {
    await masterStore.deleteDokumen(deleteTargetDoc.value.code);
    toast.success(`Dokumen "${deleteTargetDoc.value.name}" berhasil dihapus`);
    closeDeleteModal();
  } catch (err: any) {
    console.error('Failed to delete document:', err);
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      'Gagal menghapus dokumen. Pastikan dokumen tidak sedang digunakan pada paket aktif.';
    toast.error(msg);
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Page Card -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-emerald-50 rounded-xl text-[#066C2A]">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">Master Dokumen Persyaratan</h1>
            <p class="text-xs text-slate-500 mt-0.5">
              Kelola master berkas persyaratan, template format resmi, batas ukuran berkas, dan tipe MIME untuk pengajuan proposal sarpras.
            </p>
          </div>
        </div>
      </div>

      <!-- Action & Metrics -->
      <div class="flex items-center gap-3 shrink-0">
        <button
          @click="openCreateModal"
          class="px-4 py-2.5 bg-[#066C2A] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95 shrink-0"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Dokumen Baru</span>
        </button>

        <div class="flex items-center gap-2 shrink-0">
          <div class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[60px]">
            <span class="block text-[10px] text-slate-500 font-medium uppercase leading-tight">Total</span>
            <span class="text-sm font-bold text-slate-900 leading-tight">{{ stats.total }}</span>
          </div>
          <div class="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center min-w-[60px]">
            <span class="block text-[10px] text-emerald-600 font-medium uppercase leading-tight">Aktif</span>
            <span class="text-sm font-bold text-emerald-700 leading-tight">{{ stats.active }}</span>
          </div>
          <div class="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-center min-w-[60px]">
            <span class="block text-[10px] text-blue-600 font-medium uppercase leading-tight">Template</span>
            <span class="text-sm font-bold text-blue-700 leading-tight">{{ stats.withTemplate }}</span>
          </div>
        </div>
      </div>
    </div>


    <!-- Filters & Search Bar -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode atau nama dokumen..."
          class="w-full pl-10 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Status Filter Tabs & View Toggle -->
      <div class="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
        <div class="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold">
          <button
            @click="statusFilter = 'ALL'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              statusFilter === 'ALL' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900',
            ]"
          >
            Semua ({{ stats.total }})
          </button>
          <button
            @click="statusFilter = 'ACTIVE'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              statusFilter === 'ACTIVE' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900',
            ]"
          >
            Aktif ({{ stats.active }})
          </button>
          <button
            @click="statusFilter = 'HAS_TEMPLATE'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              statusFilter === 'HAS_TEMPLATE' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900',
            ]"
          >
            Ada Template ({{ stats.withTemplate }})
          </button>
        </div>

        <div class="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
          <button
            @click="viewMode = 'table'"
            :class="[
              'p-1.5 rounded-lg transition-all',
              viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700',
            ]"
            title="Tampilan Tabel"
          >
            <TableIcon class="w-4 h-4" />
          </button>
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-1.5 rounded-lg transition-all',
              viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700',
            ]"
            title="Tampilan Grid"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="masterStore.isLoading && masterStore.dokumenCatalog.length === 0" class="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <Loader2 class="w-8 h-8 text-[#066C2A] animate-spin mb-3" />
      <p class="text-sm font-semibold text-slate-700">Memuat Katalog Dokumen Persyaratan...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredDocs.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center"
    >
      <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <FileText class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-slate-800">Tidak ada dokumen ditemukan</h3>
      <p class="text-xs text-slate-500 mt-1 max-w-sm">
        Tidak ditemukan dokumen persyaratan yang cocok dengan kata kunci atau filter status yang dipilih.
      </p>
      <button
        v-if="searchQuery || statusFilter !== 'ALL'"
        @click="searchQuery = ''; statusFilter = 'ALL'"
        class="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        Reset Filter
      </button>
    </div>

    <!-- Table View Mode -->
    <div
      v-else-if="viewMode === 'table'"
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="px-5 py-3.5 w-14 text-center">No</th>
              <th class="px-5 py-3.5">Dokumen & Kode</th>
              <th class="px-5 py-3.5 w-48">Format Template</th>
              <th class="px-5 py-3.5 w-28">Batas File</th>
              <th class="px-5 py-3.5 w-52">Tipe Berkas</th>
              <th class="px-5 py-3.5 w-28 text-center">Status</th>
              <th class="px-5 py-3.5 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(doc, idx) in filteredDocs"
              :key="doc.id || doc.code"
              class="hover:bg-slate-50/70 transition-colors group"
            >
              <td class="px-5 py-3.5 text-center text-xs font-semibold text-slate-400">
                {{ idx + 1 }}
              </td>
              <td class="px-5 py-3.5">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 text-xs">{{ doc.name }}</span>
                    <span
                      :class="[
                        'px-1.5 py-0.5 rounded text-[10px] font-bold',
                        doc.is_wajib !== false
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200',
                      ]"
                    >
                      {{ doc.is_wajib !== false ? 'WAJIB' : 'OPSIONAL' }}
                    </span>
                    <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {{ doc.code }}
                    </span>
                  </div>
                  <p v-if="doc.description" class="text-[11px] text-slate-500 line-clamp-1">
                    {{ doc.description }}
                  </p>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <a
                  v-if="doc.format_download_url"
                  :href="doc.format_download_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Download class="w-3.5 h-3.5 text-blue-600" />
                  <span>Unduh Format</span>
                  <ExternalLink class="w-3 h-3 text-blue-400" />
                </a>
                <span v-else class="text-[11px] text-slate-400 italic">
                  Tanpa Format
                </span>
              </td>
              <td class="px-5 py-3.5 text-xs font-medium text-slate-700">
                <div class="inline-flex items-center gap-1 text-slate-700 font-semibold">
                  <HardDrive class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ formatBytesToMB(doc.max_size_bytes) }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="badge in parseMimeTypes(doc.allowed_mime_types)"
                    :key="badge.label"
                    :class="['px-1.5 py-0.5 rounded text-[10px] font-bold border', badge.bg, badge.text]"
                  >
                    {{ badge.label }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-center">
                <button
                  @click="handleToggleStatus(doc)"
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer',
                    doc.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200',
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="doc.is_active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  <span>{{ doc.is_active ? 'Aktif' : 'Nonaktif' }}</span>
                </button>
              </td>
              <td class="px-5 py-3.5 text-right">
                <div class="inline-flex items-center gap-1">
                  <button
                    @click="openEditModal(doc)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-[#066C2A] hover:bg-emerald-50 transition-colors"
                    title="Edit Dokumen"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="confirmDelete(doc)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Grid View Mode -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="doc in filteredDocs"
        :key="doc.id || doc.code"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all group"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {{ doc.code }}
              </span>
              <span
                :class="[
                  'px-1.5 py-0.5 rounded text-[10px] font-bold',
                  doc.is_wajib !== false
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200',
                ]"
              >
                {{ doc.is_wajib !== false ? 'WAJIB' : 'OPSIONAL' }}
              </span>
            </div>
            <button
              @click="handleToggleStatus(doc)"
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all',
                doc.is_active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200',
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="doc.is_active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
              <span>{{ doc.is_active ? 'Aktif' : 'Nonaktif' }}</span>
            </button>
          </div>

          <div>
            <h3 class="font-bold text-slate-900 group-hover:text-[#066C2A] transition-colors line-clamp-2 text-sm">
              {{ doc.name }}
            </h3>
            <p v-if="doc.description" class="text-xs text-slate-500 mt-1 line-clamp-2">
              {{ doc.description }}
            </p>
          </div>

          <div class="pt-2 border-t border-slate-100 flex flex-col gap-2 text-xs">
            <div class="flex items-center justify-between text-slate-600">
              <span class="text-slate-400 text-xs">Batas Ukuran:</span>
              <span class="font-semibold text-slate-700">{{ formatBytesToMB(doc.max_size_bytes) }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span class="text-slate-400 text-xs">Tipe Berkas:</span>
              <div class="flex gap-1">
                <span
                  v-for="badge in parseMimeTypes(doc.allowed_mime_types)"
                  :key="badge.label"
                  :class="['px-1.5 py-0.2 rounded text-[10px] font-bold border', badge.bg, badge.text]"
                >
                  {{ badge.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <a
            v-if="doc.format_download_url"
            :href="doc.format_download_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Format Unduhan</span>
          </a>
          <span v-else class="text-[11px] text-slate-400 italic">Tanpa format</span>

          <div class="flex items-center gap-1">
            <button
              @click="openEditModal(doc)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-[#066C2A] hover:bg-emerald-50 transition-colors"
              title="Edit Dokumen"
            >
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button
              @click="confirmDelete(doc)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus Dokumen"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Modal Form (Create / Edit) ─────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="showFormModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          class="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Modal Header -->
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 class="font-bold text-slate-900 text-base">
                {{ isEditing ? 'Edit Dokumen Persyaratan' : 'Tambah Dokumen Persyaratan Baru' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ isEditing ? 'Perbarui informasi dan tautan template format dokumen' : 'Definisikan jenis dokumen persyaratan baru untuk katalog master' }}
              </p>
            </div>
            <button
              @click="closeFormModal"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body Form -->
          <div class="p-6 overflow-y-auto space-y-4">
            <!-- Kode Dokumen -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Kode Unik Dokumen <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="formState.code"
                :disabled="isEditing"
                type="text"
                placeholder="Contoh: LEGALITAS_KP, SURAT_MINAT_OFFTAKER"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] disabled:bg-slate-100 disabled:text-slate-500 uppercase font-mono transition-colors"
              />
              <p class="text-[11px] text-slate-400 mt-1">
                Format UPPERCASE snake_case. Kode unik berfungsi sebagai identifier teknis dan tidak dapat diubah setelah disimpan.
              </p>
            </div>

            <!-- Nama Dokumen -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Dokumen <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="formState.name"
                type="text"
                placeholder="Contoh: Surat Rekomendasi Dinas Perkebunan Provinsi"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] transition-colors"
              />
            </div>

            <!-- Deskripsi / Petunjuk Dokumen -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi / Petunjuk Pengisian
              </label>
              <textarea
                v-model="formState.description"
                rows="2"
                placeholder="Instruksi berkas atau catatan tambahan bagi pemohon proposal..."
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] transition-colors"
              ></textarea>
            </div>

            <!-- Format Download URL / Template -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                URL / Tautan Template Format Dokumen
              </label>
              <div class="relative">
                <input
                  v-model="formState.format_download_url"
                  type="text"
                  placeholder="Contoh: /templates/format-surat-pernyataan.docx atau https://..."
                  class="w-full pl-3.5 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] transition-colors"
                />
                <a
                  v-if="formState.format_download_url"
                  :href="formState.format_download_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1 border border-blue-200"
                >
                  <ExternalLink class="w-3 h-3" />
                  <span>Uji Link</span>
                </a>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                Opsional. Isi tautan template agar pemohon dapat mengunduh format berkas standar.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Batas Maksimal File (MB) -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Maksimal Ukuran (MB)
                </label>
                <div class="relative">
                  <input
                    v-model.number="formState.max_size_mb"
                    type="number"
                    min="1"
                    max="50"
                    class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] transition-colors"
                  />
                  <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">MB</span>
                </div>
              </div>

              <!-- Status Aktif -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Status Ketersediaan
                </label>
                <label class="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    v-model="formState.is_active"
                    type="checkbox"
                    class="w-4 h-4 rounded text-[#066C2A] focus:ring-[#066C2A] border-slate-300"
                  />
                  <span class="text-xs font-semibold text-slate-700">Aktif untuk Dipetakan</span>
                </label>
              </div>
            </div>

            <!-- Sifat Dokumen Persyaratan (Wajib vs Opsional) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Sifat Dokumen Persyaratan <span class="text-rose-500">*</span>
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  :class="[
                    'p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all select-none',
                    formState.is_wajib
                      ? 'bg-rose-50/70 border-rose-300 text-rose-900 ring-1 ring-rose-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                  ]"
                >
                  <input
                    type="radio"
                    name="is_wajib_radio"
                    :value="true"
                    v-model="formState.is_wajib"
                    class="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300 mt-0.5"
                  />
                  <div>
                    <span class="block text-xs font-bold text-rose-700">Wajib Diunggah</span>
                    <span class="block text-[11px] text-slate-500 mt-0.5">Pemohon wajib melengkapi berkas ini saat pengajuan proposal</span>
                  </div>
                </label>

                <label
                  :class="[
                    'p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all select-none',
                    !formState.is_wajib
                      ? 'bg-slate-100/80 border-slate-300 text-slate-900 ring-1 ring-slate-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                  ]"
                >
                  <input
                    type="radio"
                    name="is_wajib_radio"
                    :value="false"
                    v-model="formState.is_wajib"
                    class="w-4 h-4 text-slate-600 focus:ring-slate-500 border-slate-300 mt-0.5"
                  />
                  <div>
                    <span class="block text-xs font-bold text-slate-700">Opsional / Pendukung</span>
                    <span class="block text-[11px] text-slate-500 mt-0.5">Berkas tambahan, tidak memblokir submit jika belum tersedia</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Tipe Berkas yang Diizinkan -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Tipe Berkas yang Diizinkan
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label
                  v-for="type in [
                    { id: 'PDF', label: 'PDF (.pdf)' },
                    { id: 'DOCX', label: 'Word (.docx)' },
                    { id: 'XLSX', label: 'Excel (.xlsx)' },
                    { id: 'IMAGE', label: 'Gambar (JPG/PNG)' },
                  ]"
                  :key="type.id"
                  :class="[
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all',
                    formState.allowed_types.includes(type.id)
                      ? 'border-[#066C2A] bg-emerald-50/60 text-[#066C2A]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  ]"
                >
                  <input
                    type="checkbox"
                    :value="type.id"
                    v-model="formState.allowed_types"
                    class="w-3.5 h-3.5 rounded text-[#066C2A] focus:ring-[#066C2A] border-slate-300"
                  />
                  <span>{{ type.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/70">
            <button
              @click="closeFormModal"
              type="button"
              class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              @click="handleSaveDocument"
              :disabled="isSubmitting"
              type="button"
              class="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#066C2A] hover:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <CheckCircle2 v-else class="w-3.5 h-3.5" />
              <span>{{ isEditing ? 'Simpan Perubahan' : 'Tambah Dokumen' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ─── Modal Delete Confirmation ──────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          class="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4"
        >
          <div class="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
            <Trash2 class="w-6 h-6" />
          </div>

          <div class="text-center space-y-1">
            <h3 class="font-bold text-slate-900 text-base">Hapus Dokumen Persyaratan?</h3>
            <p class="text-xs text-slate-500">
              Apakah Anda yakin ingin menghapus dokumen persyaratan
              <span class="font-bold text-slate-800">"{{ deleteTargetDoc?.name }}"</span>
              (<code class="font-mono font-semibold">{{ deleteTargetDoc?.code }}</code>)?
            </p>
          </div>

          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Penghapusan akan ditolak oleh sistem jika dokumen ini masih digunakan / dipetakan pada salah satu paket sarpras aktif.
            </span>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button
              @click="closeDeleteModal"
              type="button"
              class="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              @click="executeDelete"
              :disabled="isDeleting"
              type="button"
              class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 animate-spin" />
              <Trash2 v-else class="w-3.5 h-3.5" />
              <span>Hapus Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
