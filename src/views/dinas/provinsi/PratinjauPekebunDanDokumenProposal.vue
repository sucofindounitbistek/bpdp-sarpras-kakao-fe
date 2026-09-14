<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useVerifikasiProvinsiDraftStore } from '@/stores/verifikasiProvinsiDraft';
import GeneralPratinjauPekebunDanDokumenProposal from '@/components/verification/PratinjauPekebunDanDokumenProposal.vue';

const route = useRoute();
const verifikasiStore = useVerifikasiProvinsiDraftStore();
const proposalId = route.params.id as string;

function lanjut() {
  verifikasiStore.currentStep = 3;
}
</script>

<template>
  <GeneralPratinjauPekebunDanDokumenProposal
    :proposal-id="proposalId"
    :show-next-button="true"
    next-button-text="Lanjut ke Surat Pengantar SK CPCL"
    @next="lanjut"
  />
</template>
