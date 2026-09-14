<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useToast } from '@/composables/useToast';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import { PengajuanStatus } from '@/types/pengusulan';

const router = useRouter();
const store = usePengusulanStore();
const toast = useToast();

const activePengajuan = computed(() => store.activePengajuan || store.listPengajuan[0] || null);
const proposalNumber = computed(() => activePengajuan.value?.nomor_proposal || (activePengajuan.value as any)?.nomorProposal || 'DRAFT');
const institutionName = computed(() => activePengajuan.value?.lembaga?.namaLembaga || (activePengajuan.value as any)?.namaLembaga || 'Kelembagaan');

const handleUploadBAST = () => {
  if (store.listPengajuan[0]) {
    store.updateStatus(store.listPengajuan[0].id, PengajuanStatus.COMPLETED);
  }
  toast.success('BAST & Laporan Pertanggungjawaban (LPJ) terverifikasi selesai!', 'Pengusulan Completed');
  router.push('/bpdp/penyaluran');
};

const pageLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    pageLoading.value = false;
  }, 400);
});
</script>

<template>
  <div class="min-h-screen bg-transparent p-4 md:p-8 flex flex-col gap-6 max-w-4xl mx-auto">
    <div class="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <Breadcrumb />
    </div>

    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-80 w-full rounded-2xl" />
    </div>

    <Card v-else title="Upload BAST & LPJ Pelaksanaan Pekerjaan" subtitle="Verifikasi Berita Acara Serah Terima Pekerjaan dan Laporan Fisik">
      <div class="flex flex-col gap-4 mt-2">
        <FileUpload
          id="fileBAST"
          label="Upload Scan BAST Pekerjaan Selesai (.pdf)"
          placeholder="Pilih berkas BAST yang telah ditandatangani Lembaga & Dinas"
          document-label="BAST"
          :proposal-number="proposalNumber"
          :institution-name="institutionName"
        />

        <FileUpload
          id="fileLPJ"
          label="Upload Laporan Pertanggungjawaban (LPJ) Keuangan (.pdf)"
          placeholder="Pilih berkas LPJ keuangan & bukti fisik pekerjaan"
          document-label="LPJ"
          :proposal-number="proposalNumber"
          :institution-name="institutionName"
        />

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
          <Button variant="outline" size="md" @click="router.push('/bpdp/penyaluran')">Batal</Button>
          <Button variant="primary" size="md" @click="handleUploadBAST">
            Verifikasi Selesai (Close Project)
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>
