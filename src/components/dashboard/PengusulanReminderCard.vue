<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  BellRing,
  ArrowRight,
  Plus,
  FileEdit,
  FileSearch,
  PencilLine,
  ClipboardEdit,
  History,
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { proposalService } from '@/services/proposal.service';
import { LOCALIZATION } from '@/config/localization';

interface ReminderItem {
  id: string;
  nomor: string;
  paket: string;
  updatedAt: string;
  status: string;
}

const KP_ROLES = ['KELEMBAGAAN_PEKEBUN', 'PEMOHON'];
const ACTIONABLE_STATUSES = [
  'DRAFT',
  'REV_FROM_KAB',
  'REV_FROM_PROV',
  'REV_FROM_DITJEN_VERIF',
  'REV_FROM_DITJEN_APPR',
  'REV_FROM_BPDP_VERIF',
  'REV_FROM_BPDP_APPR',
];

const router = useRouter();
const authStore = useAuthStore();

const isKpRole = computed(() => KP_ROLES.includes(authStore.activeRole));
const isExpanded = ref(false);
const isLoading = ref(true);
const items = ref<ReminderItem[]>([]);

const drafts = computed(() => items.value.filter((it) => it.status === 'DRAFT'));
const revisions = computed(() => items.value.filter((it) => it.status !== 'DRAFT'));
const latestDraft = computed(() => drafts.value[0] ?? null);

const subtitle = computed(() => {
  const t = LOCALIZATION.dashboard.reminder;
  return items.value.length === 1 ? t.subtitleOne : t.subtitleMany.replace('{count}', String(items.value.length));
});

const isVisible = computed(() => isKpRole.value && !isLoading.value && items.value.length > 0);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function formatRelative(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays <= 0) return 'hari ini';
  if (diffDays === 1) return 'kemarin';
  if (diffDays < 30) return `${diffDays} hari lalu`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} bulan lalu`;
}

function itemAction(item: ReminderItem): { label: string; icon: any; run: () => void } {
  if (item.status === 'DRAFT') {
    return { label: LOCALIZATION.dashboard.reminder.actionContinue, icon: FileEdit, run: () => router.push(`/pengusulan/baru?draft_id=${item.id}`) };
  }
  if (item.status === 'REV_FROM_KAB') {
    return { label: LOCALIZATION.dashboard.reminder.actionFix, icon: PencilLine, run: () => router.push(`/pemohon/revisi-proposal/${item.id}`) };
  }
  return { label: LOCALIZATION.dashboard.reminder.actionReview, icon: FileSearch, run: () => router.push(`/pengusulan/pengajuan-proposal/${item.id}`) };
}

function continueLatestDraft() {
  if (latestDraft.value) {
    router.push(`/pengusulan/baru?draft_id=${latestDraft.value.id}`);
  } else {
    router.push('/pengusulan/baru');
  }
}

onMounted(async () => {
  if (!isKpRole.value) {
    isLoading.value = false;
    return;
  }
  try {
    const kelembagaanId = authStore.user?.kelembagaan_id ?? authStore.user?.kelembagaanId;
    const res = await proposalService.getList({
      status: ACTIONABLE_STATUSES,
      sort_by: 'updated_at',
      sort_order: 'desc',
      limit: 50,
      ...(kelembagaanId ? { kelembagaan_id: kelembagaanId } : {}),
    });
    const raw = (res as any)?.data;
    if (Array.isArray(raw)) {
      items.value = raw
        .filter((p: any) => ACTIONABLE_STATUSES.includes(String(p.status ?? p.currentStatus ?? '')))
        .map((p: any) => ({
          id: String(p.id),
          nomor: p.nomor_proposal || p.nomorProposal || `Proposal #${p.id}`,
          paket: p.paket_sarpras || p.jenisSarpras || '-',
          updatedAt: p.updated_at || p.updatedAt || p.created_at || p.createdAt || '',
          status: String(p.status ?? p.currentStatus ?? ''),
        }));
    }
  } catch {
    items.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section
    v-if="isVisible"
    class="reminder-card relative overflow-hidden rounded-2xl text-white shadow-lg shadow-emerald-900/20 cursor-pointer select-none"
    role="button"
    tabindex="0"
    :aria-expanded="isExpanded"
    :aria-label="isExpanded ? LOCALIZATION.dashboard.reminder.collapse : LOCALIZATION.dashboard.reminder.expand"
    @click="toggleExpanded"
    @keydown.enter.prevent="toggleExpanded"
    @keydown.space.prevent="toggleExpanded"
  >
    <!-- Decorative gradient & blobs -->
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 via-[#066C2A] to-teal-800 pointer-events-none" />
    <div class="blob absolute -top-12 -right-10 w-44 h-44 rounded-full bg-emerald-300/20 blur-2xl pointer-events-none" />
    <div class="blob-delayed absolute -bottom-14 left-1/3 w-40 h-40 rounded-full bg-amber-300/15 blur-2xl pointer-events-none" />
    <!-- Animated shine sweep -->
    <div class="shine absolute inset-y-0 w-1/3 pointer-events-none" />

    <div class="relative z-10 p-5 md:p-6 flex flex-col gap-4">
      <div class="flex items-start gap-4">
        <!-- Animated bell -->
        <div class="relative shrink-0">
          <span class="absolute inset-0 rounded-2xl bg-white/40 animate-ping" />
          <div class="relative w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
            <BellRing class="w-5 h-5 md:w-6 md:h-6 bell-swing" />
          </div>
        </div>

        <!-- Copy -->
        <div class="flex-1 min-w-0">
          <h2 class="text-base md:text-lg font-bold leading-snug tracking-tight">
            {{ LOCALIZATION.dashboard.reminder.title }}
          </h2>
          <p class="text-xs md:text-sm text-emerald-50/90 mt-0.5">{{ subtitle }}</p>

          <!-- Status chips -->
          <div class="flex flex-wrap items-center gap-2 mt-3">
            <span
              v-if="drafts.length > 0"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold backdrop-blur-sm"
            >
              <ClipboardEdit class="w-3.5 h-3.5" />
              {{ drafts.length }} {{ LOCALIZATION.dashboard.reminder.chipDraft }}
            </span>
            <span
              v-if="revisions.length > 0"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/90 text-amber-950 text-[11px] font-bold"
            >
              <History class="w-3.5 h-3.5" />
              {{ revisions.length }} {{ LOCALIZATION.dashboard.reminder.chipRevision }}
            </span>
          </div>
        </div>
      </div>

      <!-- CTAs -->
      <div class="flex flex-wrap items-center gap-2.5" @click.stop>
        <button
          type="button"
          class="group inline-flex items-center gap-2 h-10 px-4 md:px-5 rounded-xl bg-white text-[#066C2A] text-xs md:text-sm font-bold shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all duration-200 active:scale-[0.98]"
          @click="continueLatestDraft"
        >
          <component :is="latestDraft ? FileEdit : Plus" class="w-4 h-4" />
          {{ latestDraft ? LOCALIZATION.dashboard.reminder.actionContinue : LOCALIZATION.dashboard.reminder.actionCreate }}
          <ArrowRight class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-xs md:text-sm font-semibold backdrop-blur-sm transition-all duration-200 active:scale-[0.98]"
          @click="router.push('/pengusulan/pengajuan-proposal')"
        >
          {{ LOCALIZATION.dashboard.reminder.viewAll }}
        </button>
      </div>

      <!-- Expandable pending list -->
      <div class="grid transition-all duration-300 ease-out" :class="isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
        <div class="overflow-hidden">
          <ul class="flex flex-col gap-2 pt-1">
            <li
              v-for="item in items"
              :key="item.id"
              class="group/row flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur-sm transition-colors duration-200 cursor-pointer"
              @click.stop="itemAction(item).run()"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <component :is="itemAction(item).icon" class="w-4 h-4 shrink-0 text-emerald-100" />
                <span class="text-xs md:text-[13px] font-bold truncate">{{ item.nomor }}</span>
                <span class="text-[11px] text-emerald-100/80 hidden md:inline truncate">{{ item.paket }}</span>
              </div>
              <div class="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
                <span class="text-[10px] text-emerald-50/70 font-medium">
                  {{ LOCALIZATION.dashboard.reminder.updatedLabel }} {{ formatRelative(item.updatedAt) }}
                </span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="item.status === 'DRAFT' ? 'bg-white/20 text-white' : 'bg-amber-400/90 text-amber-950'"
                >
                  {{ item.status === 'DRAFT' ? LOCALIZATION.dashboard.reminder.draftBadge : LOCALIZATION.dashboard.reminder.revisionBadge }}
                </span>
                <span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-50 group-hover/row:text-white transition-colors">
                  {{ itemAction(item).label }}
                  <ArrowRight class="w-3 h-3 transition-transform duration-200 group-hover/row:translate-x-0.5" />
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reminder-card {
  animation: reminder-in 0.45s cubic-bezier(0.21, 1.02, 0.73, 1) both;
  will-change: transform, opacity;
}

@keyframes reminder-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Shine sweep across the card */
.shine {
  background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.18) 50%, transparent 60%);
  animation: shine-sweep 4.5s ease-in-out infinite;
}

@keyframes shine-sweep {
  0%,
  55% {
    transform: translateX(-160%) skewX(-12deg);
  }
  85%,
  100% {
    transform: translateX(420%) skewX(-12deg);
  }
}

/* Gentle floating decorative blobs */
.blob {
  animation: blob-float 7s ease-in-out infinite alternate;
}

.blob-delayed {
  animation: blob-float 9s ease-in-out 1.2s infinite alternate-reverse;
}

@keyframes blob-float {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(10px, -8px) scale(1.12);
  }
}

/* Subtle bell swing */
.bell-swing {
  animation: bell-swing 2.4s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes bell-swing {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(12deg);
  }
  20% {
    transform: rotate(-10deg);
  }
  30% {
    transform: rotate(6deg);
  }
  40% {
    transform: rotate(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reminder-card,
  .shine,
  .blob,
  .blob-delayed,
  .bell-swing {
    animation: none;
  }
}
</style>
