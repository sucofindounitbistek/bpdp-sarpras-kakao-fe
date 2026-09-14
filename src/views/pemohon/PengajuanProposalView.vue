<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import CPCLForm from '@/components/penyaluran/CPCLForm.vue';
import PolygonMap from '@/components/penyaluran/PolygonMap.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import { useToast } from '@/composables/useToast';
import { FilePlus, Send } from 'lucide-vue-next';

const router = useRouter();
const toast = useToast();

const jenisPaket = ref('Benih & Pupuk Kelapa Unggul 2026');
const catatanUsulan = ref('Usulan bantuan bibit kelapa klon unggul tahan hama untuk kelompok tani Harapan Maju.');

const handleSubmitProposal = () => {
  toast.success('Proposal berhasil dikirim ke Dinas Kabupaten/Kota!', 'Usulan Terkirim');
  router.push('/pengusulan/pengajuan-proposal');
};

const pageLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    pageLoading.value = false;
  }, 400);
});
</script>

<template>
  <div class="min-h-screen bg-transparent p-4 md:p-6 flex flex-col gap-6">
    <header class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
      <Breadcrumb />
      <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
        <FilePlus class="w-6 h-6 text-[#066C2A]" /> Form Pengajuan Usulan Sarpras BPDPKS
      </h1>
      <p class="text-xs text-slate-500">Lengkapi data profil kelembagaan, calon petani calon lokasi (CPCL), dan unggah dokumen legalitas.</p>
    </header>

    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-60 w-full rounded-2xl" />
      <Skeleton class="h-40 w-full rounded-2xl" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 flex flex-col gap-6">
        <CPCLForm />
        <PolygonMap />
      </div>

      <!-- Submission Panel -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-6 shadow-xs h-fit">
        <div>
          <h3 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Ringkasan Paket Usulan</h3>

          <div class="mt-4 flex flex-col gap-4 text-xs">
            <div>
              <label class="font-semibold text-slate-600">Pilih Paket Sarpras</label>
              <select v-model="jenisPaket" class="w-full h-10 px-3 border rounded-xl bg-slate-50 text-slate-800 font-medium mt-1">
                <option value="Benih & Pupuk Kelapa Unggul 2026">Benih & Pupuk Kelapa Unggul 2026</option>
                <option value="Alat & Mesin Pertanian (Alsin Kelapa)">Alat & Mesin Pertanian (Alsin Kelapa)</option>
                <option value="Infrastruktur / Unit Pengolahan Hasil">Infrastruktur / Unit Pengolahan Hasil</option>
              </select>
            </div>

            <div>
              <label class="font-semibold text-slate-600">Catatan Permohonan</label>
              <textarea v-model="catatanUsulan" rows="4" class="w-full p-3 border rounded-xl bg-slate-50 text-slate-800 mt-1"></textarea>
            </div>
          </div>
        </div>

        <button
          @click="handleSubmitProposal"
          class="w-full bg-[#066C2A] hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#066C2A]/20 transition-all"
        >
          <Send class="w-4 h-4" /> Kirim Proposal Usulan
        </button>
      </div>
    </div>
  </div>
</template>
