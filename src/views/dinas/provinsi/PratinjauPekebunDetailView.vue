<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePekebunStore } from '@/stores/pekebun';
import { usePengusulanStore } from '@/stores/pengusulan';
import { ArrowLeft } from 'lucide-vue-next';
import PratinjauPekebunDetail from '@/components/verification/PratinjauPekebunDetail.vue';

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const pekebunStore = usePekebunStore();

const pengajuanId = route.params.id as string;
const cpclId = route.params.cpclId as string;

const pageLoading = ref(true);

onMounted(async () => {
  pageLoading.value = true;
  try {
    await Promise.allSettled([
      pengusulanStore.getProposalDetail(pengajuanId),
      pekebunStore.fetchPekebunList(),
    ]);
  } catch (err) {
    console.error('Gagal memuat detail proposal:', err);
  } finally {
    pageLoading.value = false;
  }
});

const pengajuan = computed(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(pengajuanId)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(pengajuanId)) || null;
});

// Resolve the target pekebun matching cpclId
const targetPekebun = computed(() => {
  const p = pengajuan.value;
  if (!p) return null;

  const rawPekebuns: any[] = p.pekebuns || [];
  const rawLahans: any[] = p.lahans || [];
  const cleanId = String(cpclId || '').replace(/^CPCL-/i, '');

  // 1. Direct ID or NIK match in pekebuns
  let match = rawPekebuns.find(
    (pk: any) =>
      String(pk.id) === String(cpclId) ||
      String(pk.id) === cleanId ||
      String(pk.nik) === String(cpclId) ||
      String(pk.nik) === cleanId
  );
  if (match) return match;

  // 2. Check in lahans if cpclId refers to a lahan id
  const matchingLahan = rawLahans.find(
    (l: any) => String(l.id) === String(cpclId) || String(l.id) === cleanId
  );
  if (matchingLahan) {
    const pkFromLahan = rawPekebuns.find(
      (pk: any) => Number(pk.id) === Number(matchingLahan.pekebun_id) || String(pk.id) === String(matchingLahan.pekebun_id)
    );
    if (pkFromLahan) return pkFromLahan;
  }

  // 3. Fallback: Check pekebunStore listPekebun
  const enriched = pekebunStore.listPekebun.find(
    (pk) => pk.id === String(cpclId) || pk.id === cleanId || pk.nik === String(cpclId) || pk.nik === cleanId
  );
  if (enriched) return enriched;

  // 4. Fallback: Check daftarCPCL legacy
  const cpclMatch = (p.daftarCPCL || []).find(
    (c: any) => String(c.id) === String(cpclId) || String(c.id) === cleanId || c.nik === String(cpclId)
  );
  if (cpclMatch) {
    return {
      id: String(cpclMatch.id),
      nama: cpclMatch.namaPekebun,
      nik: cpclMatch.nik,
      nomorKK: cpclMatch.nomorKK,
      lahan: {
        id: cpclMatch.id,
        luas_lahan: cpclMatch.luasLahanHektar,
        jenis_legalitas: cpclMatch.jenisHakLahan,
        nomor_legalitas: cpclMatch.nomorSuratLahan,
        coordinates: cpclMatch.coordinates,
      },
    };
  }

  // 5. Fallback: if index number
  const numIdx = Number(cleanId);
  if (!isNaN(numIdx) && numIdx > 0 && numIdx <= rawPekebuns.length) {
    return rawPekebuns[numIdx - 1];
  }

  return rawPekebuns.length > 0 ? rawPekebuns[0] : null;
});

// Resolve all lahans belonging to target pekebun
const targetLahans = computed(() => {
  const p = pengajuan.value;
  const pk = targetPekebun.value;
  if (!pk) return [];

  const rawLahans: any[] = p?.lahans || [];
  const matching = rawLahans.filter(
    (l: any) => Number(l.pekebun_id) === Number(pk.id) || String(l.pekebun_id) === String(pk.id)
  );
  if (matching.length > 0) return matching;

  if (pk.lahans && Array.isArray(pk.lahans) && pk.lahans.length > 0) {
    return pk.lahans;
  }
  if (pk.lahan) {
    return [pk.lahan];
  }
  return [];
});

function goBack() {
  router.push(`/dinas/verifikasi/provinsi/${pengajuanId}`);
}
</script>

<template>
  <div class="min-h-screen bg-transparent p-4 md:p-8 flex flex-col gap-6 mx-auto">
    <!-- Skeleton Loading -->
    <div v-if="pageLoading" class="animate-pulse space-y-4">
      <div class="h-8 bg-slate-200 rounded-lg w-1/4"></div>
      <div class="h-4 bg-slate-200 rounded-lg w-1/2"></div>
      <div class="h-64 bg-slate-100 rounded-2xl"></div>
    </div>

    <!-- Error State -->
    <template v-else-if="!targetPekebun">
      <div class="flex items-center gap-4">
        <button
          type="button"
          @click="goBack"
          class="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4 text-slate-600" />
        </button>
        <div class="flex flex-col gap-0.5">
          <h2 class="text-lg font-bold text-slate-900">Pratinjau Pekebun</h2>
        </div>
      </div>
      <div class="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
        Data pekebun tidak ditemukan.
      </div>
    </template>

    <!-- Detail View -->
    <PratinjauPekebunDetail
      v-else
      :pekebun="targetPekebun"
      :lahans="targetLahans"
      :proposal-id="pengajuanId"
      :show-back-button="true"
      @back="goBack"
    />
  </div>
</template>
