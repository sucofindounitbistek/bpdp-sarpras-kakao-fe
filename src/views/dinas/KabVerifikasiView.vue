<script setup lang="ts">
import { ref } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import KabVerifikasiChecklist from '@/components/dinas/KabVerifikasiChecklist.vue';
import RevisiModal from '@/components/dinas/RevisiModal.vue';
import { useToast } from '@/composables/useToast';
import { CheckSquare, Award, AlertTriangle, Send } from 'lucide-vue-next';

const toast = useToast();

const showRevisiModal = ref(false);
const nomorRekomtek = ref('REKOMTEK-KAB/LU/2026/042');

const handleApprove = () => {
  toast.success(`Surat Rekomtek ${nomorRekomtek.value} berhasil diterbitkan & dikirim ke Dinas Provinsi!`, 'Rekomtek Diterbitkan');
};

const handleRevisiSubmit = (note: string) => {
  showRevisiModal.value = false;
  toast.info(`Proposal dikembalikan ke Lembaga Pekebun dengan catatan: ${note}`, 'Catatan Dikirim');
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
        <CheckSquare class="w-5 h-5 text-[#066C2A]" /> Verifikasi & Penerbitan Rekomtek Kabupaten/Kota
      </h1>
      <p class="text-xs text-slate-500">Pemeriksaan berkas administrasi, lapangan CPCL, dan rekomendasi teknis daerah.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 flex flex-col gap-6">
        <KabVerifikasiChecklist />
      </div>

      <!-- Rekomtek Issuance Panel -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-6 shadow-xs h-fit">
        <div>
          <h3 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Award class="w-5 h-5 text-[#066C2A]" /> Penerbitan Rekomtek
          </h3>

          <div class="mt-4 flex flex-col gap-3 text-xs">
            <div>
              <label class="font-semibold text-slate-600">Nomor Surat Rekomtek Kabupaten</label>
              <input v-model="nomorRekomtek" type="text" class="w-full h-10 px-3 border rounded-xl bg-slate-50 font-mono text-slate-900 mt-1 font-bold" />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <button
            @click="handleApprove"
            class="w-full bg-[#066C2A] hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#066C2A]/20 transition-all text-xs"
          >
            <Send class="w-4 h-4" /> Terbitkan Rekomtek & Teruskan ke Prov
          </button>

          <button
            @click="showRevisiModal = true"
            class="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs"
          >
            <AlertTriangle class="w-4 h-4 text-amber-600" /> Kembalikan / Catatan Revisi
          </button>
        </div>
      </div>
    </div>

    <RevisiModal :is-open="showRevisiModal" @close="showRevisiModal = false" @submit-revisi="handleRevisiSubmit" />
  </div>
</template>
