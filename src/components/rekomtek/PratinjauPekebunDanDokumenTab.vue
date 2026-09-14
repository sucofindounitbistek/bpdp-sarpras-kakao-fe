<script setup lang="ts">
import GeneralPratinjauPekebunDanDokumenProposal from '@/components/verification/PratinjauPekebunDanDokumenProposal.vue';

interface PolygonData {
  coordinates: Array<[number, number]>;
  label?: string;
}

interface OtherProposalData {
  proposalId: string;
  proposalNumber: string;
  proposalName: string;
  polygons: PolygonData[];
  distance?: number;
}

withDefaults(
  defineProps<{
    usulan: any;
    activePolygons?: PolygonData[];
    otherProposals?: OtherProposalData[];
  }>(),
  {
    activePolygons: () => [],
    otherProposals: () => [],
  },
);
</script>

<template>
  <GeneralPratinjauPekebunDanDokumenProposal
    :usulan="usulan"
    :active-polygons="activePolygons"
    :other-proposals="otherProposals"
  />
</template>
