<script setup lang="ts">
import { ref, computed } from 'vue';
import type { StatusPermohonanBarang } from '@/types/penyaluranBarang';
import Modal from '@/components/ui/Modal.vue';
import Button from '@/components/ui/Button.vue';
import ProposalAuditTimeline from '@/components/proposal/ProposalAuditTimeline.vue';
import {
  FileText,
  UserCheck,
  Building,
  ShoppingCart,
  FileSignature,
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  History,
} from 'lucide-vue-next';

const props = defineProps<{
  status: StatusPermohonanBarang;
  compact?: boolean;
  proposalId?: number | string;
}>();

const showAuditModal = ref(false);

interface StepInfo {
  key: string;
  label: string;
  subLabel: string;
  role: string;
  icon: any;
}

const steps: StepInfo[] = [
  {
    key: 'permohonan',
    label: 'Permohonan Pekebun',
    subLabel: 'Input RAB & Upload Surat',
    role: 'Pekebun',
    icon: FileText,
  },
  {
    key: 'verifikasi',
    label: 'Verifikasi & Nota Dinas',
    subLabel: 'Telaah Teknis & Disposisi',
    role: 'BPDP Teknis',
    icon: UserCheck,
  },
  {
    key: 'ppk',
    label: 'Disposisi Pengadaan',
    subLabel: 'Penetapan Jalur Tender',
    role: 'BPDP PPK',
    icon: Building,
  },
  {
    key: 'ulp',
    label: 'Tender e-Catalog',
    subLabel: 'Pemilihan & Pemenang Vendor',
    role: 'BPDP ULP',
    icon: ShoppingCart,
  },
  {
    key: 'kontrak',
    label: 'Kontrak Dokumen "A"',
    subLabel: 'PKS & Jangka Waktu',
    role: 'BPDP Teknis',
    icon: FileSignature,
  },
  {
    key: 'surveyor',
    label: 'Sampling & Monitoring',
    subLabel: 'Pengawasan Lapangan',
    role: 'Surveyor',
    icon: Compass,
  },
];

const currentStepIndex = computed(() => {
  switch (props.status) {
    case 'DRAFT':
      return 0;
    case 'MENUNGGU_VERIFIKASI_TEKNIS':
      return 1;
    case 'PERLU_REVISI':
      return 0;
    case 'DISPOSISI_PPK':
      return 2;
    case 'DISPOSISI_ULP':
    case 'PROSES_PEMILIHAN_PENYEDIA':
      return 3;
    case 'PENETAPAN_PEMENANG':
    case 'PROSES_PELAKSANAAN_KONTRAK':
      return 4;
    case 'SURVEYOR_DITUGASKAN':
    case 'SELESAI':
      return 5;
    default:
      return 0;
  }
});

const isRevision = computed(() => props.status === 'PERLU_REVISI');
const isDone = computed(() => props.status === 'SURVEYOR_DITUGASKAN' || props.status === 'SELESAI');

const statusBadgeConfig = computed(() => {
  switch (props.status) {
    case 'DRAFT':
      return { label: 'Draft Pengajuan', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300' };
    case 'MENUNGGU_VERIFIKASI_TEKNIS':
      return { label: 'Menunggu Verifikasi Teknis', bg: 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200' };
    case 'PERLU_REVISI':
      return { label: 'Perlu Revisi Pekebun', bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300' };
    case 'DISPOSISI_PPK':
      return { label: 'Disposisi ke PPK', bg: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200' };
    case 'DISPOSISI_ULP':
      return { label: 'Disposisi ke ULP', bg: 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200' };
    case 'PROSES_PEMILIHAN_PENYEDIA':
      return { label: 'Proses Pemilihan Penyedia (e-Catalog)', bg: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200' };
    case 'PENETAPAN_PEMENANG':
      return { label: 'Pemenang Ditetapkan (Siap Kontrak)', bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300' };
    case 'PROSES_PELAKSANAAN_KONTRAK':
      return { label: 'Pelaksanaan Kontrak (Dokumen A)', bg: 'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border-teal-300' };
    case 'SURVEYOR_DITUGASKAN':
      return { label: 'Surveyor Ditugaskan (Sampling & Monitoring)', bg: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-400' };
    case 'SELESAI':
      return { label: 'Penyaluran Selesai Penuh', bg: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-400' };
    default:
      return { label: props.status, bg: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
});
</script>

<template>
  <div class="bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/90 dark:to-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
    <!-- Header Status Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Alur Penyelenggaraan Pengadaan Barang
        </span>
      </div>

      <div class="flex items-center gap-2">
        <Button
          v-if="props.proposalId"
          type="button"
          variant="outline"
          size="sm"
          class="gap-1.5 text-xs rounded-full h-7 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 border-slate-300 dark:border-slate-700 shadow-2xs"
          @click="showAuditModal = true"
        >
          <History class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span class="font-semibold text-slate-700 dark:text-slate-200">Riwayat Audit</span>
        </Button>
        <span
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border shadow-2xs transition-all',
            statusBadgeConfig.bg,
          ]"
        >
          <AlertCircle v-if="isRevision" class="w-3.5 h-3.5 text-amber-600 animate-bounce" />
          <CheckCircle2 v-else-if="isDone" class="w-3.5 h-3.5 text-emerald-600" />
          <Clock v-else class="w-3.5 h-3.5 text-slate-500" />
          {{ statusBadgeConfig.label }}
        </span>
      </div>
    </div>

    <!-- Stepper Desktop: Interconnected Linear Stepper with Glowing Active State -->
    <div class="hidden lg:grid grid-cols-6 gap-2.5 relative pt-1">
      <div
        v-for="(step, idx) in steps"
        :key="step.key"
        :class="[
          'relative p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between group',
          idx < currentStepIndex
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/90 dark:border-emerald-800/80 shadow-2xs hover:border-emerald-300'
            : idx === currentStepIndex
            ? isRevision
              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30'
              : 'bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30'
            : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-80',
        ]"
      >
        <!-- Top Indicator Bar -->
        <div class="flex items-center justify-between mb-2.5">
          <div
            :class="[
              'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105',
              idx < currentStepIndex
                ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                : idx === currentStepIndex
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
            ]"
          >
            <CheckCircle2 v-if="idx < currentStepIndex" class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-200" />
            <span v-else>{{ idx + 1 }}</span>
          </div>

          <component
            :is="step.icon"
            :class="[
              'w-4 h-4 transition-colors',
              idx === currentStepIndex ? 'text-white' : idx < currentStepIndex ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400',
            ]"
          />
        </div>

        <!-- Labels -->
        <div class="space-y-0.5">
          <p
            :class="[
              'text-xs font-bold line-clamp-1',
              idx === currentStepIndex ? 'text-white' : idx < currentStepIndex ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500',
            ]"
          >
            {{ step.label }}
          </p>
          <p
            :class="[
              'text-[10.5px] line-clamp-1',
              idx === currentStepIndex ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500',
            ]"
          >
            {{ step.subLabel }}
          </p>
        </div>

        <!-- Role Pill Bottom -->
        <div class="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <span
            :class="[
              'text-[9.5px] font-semibold px-1.5 py-0.5 rounded',
              idx === currentStepIndex
                ? 'bg-white/20 text-white'
                : idx < currentStepIndex
                ? 'bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
            ]"
          >
            {{ step.role }}
          </span>

          <ArrowRight
            v-if="idx < steps.length - 1"
            :class="[
              'w-3 h-3',
              idx === currentStepIndex ? 'text-white/60' : 'text-slate-300 dark:text-slate-700',
            ]"
          />
        </div>
      </div>
    </div>

    <!-- Stepper Mobile / Tablet View: Compact List with Progress Pills -->
    <div class="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        v-for="(step, idx) in steps"
        :key="step.key"
        :class="[
          'flex items-center gap-3 p-3 rounded-xl border text-xs transition-all',
          idx === currentStepIndex
            ? isRevision
              ? 'bg-amber-500 text-white font-semibold border-amber-600 shadow-sm'
              : 'bg-emerald-600 text-white font-semibold border-emerald-600 shadow-sm'
            : idx < currentStepIndex
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 opacity-75',
        ]"
      >
        <div
          :class="[
            'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
            idx === currentStepIndex ? 'bg-white text-emerald-700' : idx < currentStepIndex ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-500',
          ]"
        >
          <CheckCircle2 v-if="idx < currentStepIndex" class="w-3.5 h-3.5 text-emerald-800" />
          <span v-else>{{ idx + 1 }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-bold truncate">{{ step.label }}</p>
          <p :class="['text-[10px] truncate', idx === currentStepIndex ? 'text-emerald-100' : 'text-slate-400']">
            {{ step.role }} • {{ step.subLabel }}
          </p>
        </div>
      </div>
    </div>

    <!-- Audit History Modal -->
    <Modal
      v-if="props.proposalId"
      :is-open="showAuditModal"
      title="Riwayat Audit Resmi Proposal & Penyaluran Barang"
      size="xl"
      @close="showAuditModal = false"
    >
      <ProposalAuditTimeline :proposal-id="props.proposalId" />
    </Modal>
  </div>
</template>
