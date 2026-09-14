<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import {
  FileText,
  Building2,
  Landmark,
  Award,
  ShieldCheck,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-vue-next';

interface Props {
  currentRole?: string;
  defaultExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentRole: '',
  defaultExpanded: false,
});

const isExpanded = ref(props.defaultExpanded);
const authStore = useAuthStore();

const resolvedRole = computed(() => {
  if (props.currentRole) return props.currentRole.toUpperCase();
  return (authStore.activeRole || '').toUpperCase();
});

interface WorkflowStepItem {
  id: number;
  title: string;
  roleLabel: string;
  roleName: string;
  description: string;
  deliverables: string;
  roles: string[];
  icon: any;
}

const steps: WorkflowStepItem[] = [
  {
    id: 1,
    title: 'Pengusulan Proposal',
    roleLabel: 'Pemohon',
    roleName: 'Kelembagaan Pekebun',
    description: 'Penyusunan usulan mandiri oleh kelompok tani / koperasi.',
    deliverables: 'Dokumen legalitas, data CPCL (pekebun & lahan), serta RAB.',
    roles: ['KELEMBAGAAN_PEKEBUN', 'PEMOHON'],
    icon: FileText,
  },
  {
    id: 2,
    title: 'Verifikasi Kabupaten',
    roleLabel: 'Dinas Kab',
    roleName: 'Dinas Kab/Kota',
    description: 'Pemeriksaan administrasi & uji fisik lapangan calon pekebun & lahan.',
    deliverables: 'BA Verifikasi Administrasi, BA Lapangan, & Rekomtek Kab.',
    roles: ['DINAS_KAB'],
    icon: Building2,
  },
  {
    id: 3,
    title: 'Asistensi Provinsi',
    roleLabel: 'Dinas Prov',
    roleName: 'Dinas Perkebunan Provinsi',
    description: 'Asistensi kesiapan daerah & validasi rekonsiliasi data usulan CPCL.',
    deliverables: 'Surat Keterangan & Pengantar Validasi CPCL Provinsi.',
    roles: ['DINAS_PROV'],
    icon: Landmark,
  },
  {
    id: 4,
    title: 'Rekomtek Ditjenbun',
    roleLabel: 'Ditjenbun',
    roleName: 'Kementerian Pertanian',
    description: 'Review kepatuhan teknis perkebunan & penerbitan Rekomtek resmi.',
    deliverables: 'Surat Rekomendasi Teknis (Rekomtek) Ditjenbun.',
    roles: ['DITJENBUN', 'DITJENBUN_VERIFIKATOR', 'DITJENBUN_APPROVAL'],
    icon: Award,
  },
  {
    id: 5,
    title: 'Penelitian & SK Dirut',
    roleLabel: 'BPDPKS',
    roleName: 'Badan Pengelola Dana',
    description: 'Penelitian kepatuhan pencairan dana & penetapan SK Direktur Utama.',
    deliverables: 'Laporan Hasil Penelitian & Penerbitan SK Dirut BPDPKS.',
    roles: ['BPDP', 'BPDP_VERIFIKATOR', 'BPDP_APPROVAL', 'BPDP_KADIV', 'BPDP_STAFF', 'BPDPKS'],
    icon: ShieldCheck,
  },
];

function isStepActiveRole(step: WorkflowStepItem): boolean {
  const r = resolvedRole.value;
  if (!r) return false;
  return step.roles.some((roleKey) => r.includes(roleKey) || roleKey.includes(r));
}

const currentActiveStep = computed(() => {
  return steps.find(isStepActiveRole);
});
</script>

<template>
  <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200">
    <!-- Header bar -->
    <div class="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 via-white to-emerald-50/30 dark:from-slate-950/40 dark:via-slate-900 dark:to-emerald-950/20 border-b border-slate-100 dark:border-slate-800/80">
      <div class="flex items-start md:items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#066C2A]/10 dark:bg-emerald-500/10 text-[#066C2A] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#066C2A]/20 dark:border-emerald-500/20">
          <Info class="w-4 h-4" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white font-apple-display-md">
              Alur Tahapan Pengusulan & Tanggung Jawab Peran
            </h3>
            <span
              v-if="currentActiveStep"
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 dark:bg-emerald-950/60 text-[#066C2A] dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Peran Anda: {{ currentActiveStep.roleName }} (Tahap {{ currentActiveStep.id }})
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-apple-caption mt-0.5">
            Panduan rangkaian verifikasi proposal sejak pengusulan awal hingga penerbitan SK Direktur Utama BPDP.
          </p>
        </div>
      </div>

      <!-- <div class="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          type="button"
          @click="isExpanded = !isExpanded"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
        >
          <span>{{ isExpanded ? 'Sembunyikan Alur' : 'Lihat Alur Lengkap' }}</span>
          <ChevronUp v-if="isExpanded" class="w-3.5 h-3.5" />
          <ChevronDown v-else class="w-3.5 h-3.5" />
        </button>
      </div> -->
    </div>

    <!-- Collapsed preview strip -->
    <div
      v-if="!isExpanded"
      class="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-2 text-xs overflow-x-auto"
    >
      <template v-for="(step, idx) in steps" :key="'mini-' + step.id">
        <div
          :class="[
            'flex items-center gap-1.5 px-2 py-1 rounded-md shrink-0 text-xs transition-colors',
            isStepActiveRole(step)
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#066C2A] dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
              : 'text-slate-600 dark:text-slate-400 font-medium'
          ]"
        >
          <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" :class="isStepActiveRole(step) ? 'bg-[#066C2A] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'">
            {{ step.id }}
          </span>
          <span>{{ step.title }}</span>
          <component
            :is="step.icon"
            :class="[
              'w-3.5 h-3.5 shrink-0',
              isStepActiveRole(step) ? 'text-[#066C2A] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
            ]"
          />
        </div>
        <ArrowRight v-if="idx < steps.length - 1" class="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
      </template>
    </div>

    <!-- Expanded content: 5-step grid -->
    <div v-else class="p-4 md:p-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        <div
          v-for="step in steps"
          :key="step.id"
          :class="[
            'relative rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200 border',
            isStepActiveRole(step)
              ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-500/80 dark:border-emerald-500/60 ring-2 ring-[#066C2A]/15 dark:ring-emerald-400/20 shadow-xs'
              : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          ]"
        >
          <!-- Top card header: Step number, icon, and role tag -->
          <div>
            <div class="flex items-center justify-between gap-2 mb-2.5">
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                    isStepActiveRole(step)
                      ? 'bg-[#066C2A] text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  ]"
                >
                  {{ step.id }}
                </span>
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider',
                    isStepActiveRole(step)
                      ? 'bg-emerald-200/80 dark:bg-emerald-900/60 text-[#066C2A] dark:text-emerald-300'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  ]"
                >
                  {{ step.roleLabel }}
                </span>
              </div>

              <!-- Component Icon -->
              <component
                :is="step.icon"
                :class="[
                  'w-4 h-4 shrink-0',
                  isStepActiveRole(step) ? 'text-[#066C2A] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                ]"
              />
            </div>

            <!-- Role active indicator banner -->
            <div
              v-if="isStepActiveRole(step)"
              class="mb-2 flex items-center gap-1 text-[10px] font-bold text-[#066C2A] dark:text-emerald-400"
            >
              <CheckCircle2 class="w-3 h-3" />
              <span>Tahap Tanggung Jawab Anda</span>
            </div>

            <!-- Title & Institution -->
            <h4
              :class="[
                'text-xs font-bold leading-snug',
                isStepActiveRole(step) ? 'text-slate-900 dark:text-white font-apple-display-md' : 'text-slate-800 dark:text-slate-200'
              ]"
            >
              {{ step.title }}
            </h4>
            <p class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              {{ step.roleName }}
            </p>

            <!-- Description -->
            <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {{ step.description }}
            </p>
          </div>

          <!-- Bottom: Deliverables / Output -->
          <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80">
            <span class="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
              Hasil / Output:
            </span>
            <p class="text-[10px] text-slate-700 dark:text-slate-300 font-medium leading-normal">
              {{ step.deliverables }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
