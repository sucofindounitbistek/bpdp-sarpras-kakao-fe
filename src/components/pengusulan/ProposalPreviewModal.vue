<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void;
}>();
import { computed, ref } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import Button from '@/components/ui/Button.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import SatelliteMapPreview from '@/components/ui/SatelliteMapPreview.vue';
import { usePengusulanDraftStore } from '@/stores/pengusulanDraft';
import { usePekebunStore } from '@/stores/pekebun';
import { useLahanStore } from '@/stores/lahan';
import { PAKET_OPTIONS, PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';

const store = usePengusulanDraftStore();
const pekebunStore = usePekebunStore();
const lahanStore = useLahanStore();

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showDocPreview = ref(false);

const selectedPaketLabel = computed(() => PAKET_OPTIONS.find((p) => p.id === store.selectedPaket)?.label ?? store.selectedPaket ?? '-');

const allPekebun = computed(() => (lahanStore.pekebunList.length > 0 ? lahanStore.pekebunList : pekebunStore.listPekebun));
const selectedPekebunList = computed(() => allPekebun.value.filter((p) => store.selectedPekebunIds.includes(String(p.id))));

function openDocPreview(doc: { dataUrl: string; mimeType: string; namaFile: string }) {
  previewDoc.value = { dataUrl: doc.dataUrl, mimeType: doc.mimeType, title: doc.namaFile };
  showDocPreview.value = true;
}

const docLabelMap = computed(() => {
  const map: Record<string, string> = {
    RAB_PROPOSAL: 'RAB Bertandatangan',
    SPTJM: 'RAB Bertandatangan (SPTJM)',
    RAB_SIGNED: 'RAB Bertandatangan',
    'rab-signed': 'RAB Bertandatangan',
  };
  if (!store.selectedPaket) return map;
  const persyaratan = PAKET_PERSYARATAN_CONFIG[store.selectedPaket] ?? [];
  persyaratan.forEach((p) => {
    map[p.id] = p.nama;
  });
  return map;
});

function getDocLabel(doc: { persyaratanId: string; namaFile: string }) {
  return docLabelMap.value[doc.persyaratanId] || doc.namaFile;
}
</script>

<template>
  <Modal :isOpen="true" title="Pratinjau Proposal" @close="emit('close')" :closeOnOverlay="true">
    <div class="max-h-[70vh] overflow-y-auto flex flex-col gap-5 pr-1">
      <!-- Section 1: Paket -->
      <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <p class="text-xs font-bold text-[#066C2A] uppercase tracking-wider mb-1">Paket Sarpras</p>
        <p class="text-sm font-semibold text-slate-800">{{ selectedPaketLabel }}</p>
      </div>

      <!-- Section 2: Dokumen Persyaratan -->
      <div class="flex flex-col gap-2">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen Persyaratan</p>
        <div v-for="doc in store.dokumenUploads" :key="doc.persyaratanId" class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span class="text-xs text-slate-700 truncate">{{ getDocLabel(doc) }}</span>
          <button @click="openDocPreview(doc)" class="text-xs text-[#066C2A] font-semibold hover:underline ml-2 shrink-0">Pratinjau</button>
        </div>
        <p v-if="store.dokumenUploads.length === 0" class="text-xs text-slate-400">Tidak ada dokumen diunggah.</p>
      </div>

      <!-- Section 3: Gudang Serah Terima (Storage Area) -->
      <div v-if="store.storage_area || store.gudangSerahTerima" class="flex flex-col gap-2">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Gudang Serah Terima</p>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-1">
          <div><span class="font-semibold">Alamat:</span> {{ store.storage_area?.address || store.storage_area?.alamat || store.gudangSerahTerima?.alamat }}</div>
          <div><span class="font-semibold">Koordinat:</span> {{ store.storage_area?.coordinate || store.storage_area?.koordinat || store.gudangSerahTerima?.koordinat }}</div>
          <div class="flex gap-2 mt-1">
            <button v-if="store.storage_area?.fotoTampakDepan || store.gudangSerahTerima?.fotoTampakDepan" @click="openDocPreview((store.storage_area?.fotoTampakDepan || store.gudangSerahTerima?.fotoTampakDepan)!)" class="text-[#066C2A] font-semibold hover:underline">📷 Tampak Depan</button>
            <button v-if="store.storage_area?.fotoTampakDalam || store.gudangSerahTerima?.fotoTampakDalam" @click="openDocPreview((store.storage_area?.fotoTampakDalam || store.gudangSerahTerima?.fotoTampakDalam)!)" class="text-[#066C2A] font-semibold hover:underline">📷 Tampak Dalam</button>
          </div>
        </div>
      </div>

      <!-- Section 4: Pekebun & Lahan -->
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pekebun & Lahan</p>
          <span class="text-xs font-mono font-semibold text-[#066C2A]"> {{ store.step2TotalPekebun }} Pekebun &bull; {{ store.step2TotalLuasHa.toFixed(1) }} Ha </span>
        </div>
        <div v-if="selectedPekebunList.length === 0" class="text-xs text-slate-400">Belum ada pekebun dipilih.</div>
        <div v-for="pekebun in selectedPekebunList" :key="pekebun.id" class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
          <p class="font-semibold">{{ pekebun.nama }} ({{ pekebun.nik }})</p>
          <div v-for="lahan in lahanStore.getPekebunLands(pekebun)" :key="lahan.id" class="flex flex-col gap-1 border-t border-slate-200/60 pt-2 first:border-0 first:pt-0">
            <p class="text-slate-500">{{ lahan.jenisLegalitas }} &bull; {{ (lahan.luasLahan ?? 0).toLocaleString('id-ID') }} Ha &bull; {{ lahan.desaNama || lahan.desaKode || lahan.alamatKebun || '-' }}{{ lahan.kecamatanNama ? ', ' + lahan.kecamatanNama : '' }}</p>
            <p v-if="store.selectedLahanIds.includes(String(lahan.id))" class="text-[#066C2A] font-medium">
              {{ store.selectedLahanDocs[String(lahan.id)]?.jenisDokumen === 'DOKUMEN_LAINNYA' ? store.selectedLahanDocs[String(lahan.id)]?.jenisDokumenLainnya || 'Dokumen Lainnya' : 'SHM' }}:
              {{ store.selectedLahanDocs[String(lahan.id)]?.nomorDokumen || lahan.nomorLegalitas || '-' }}
            </p>
            <p v-else class="text-slate-400">Lahan tidak dipilih</p>

            <SatelliteMapPreview v-if="lahan.coordinates && lahan.coordinates.length > 0" :coordinates="lahan.coordinates" :luas-lahan="lahan.luasLahan" height="180px" class="mt-1.5 rounded-lg overflow-hidden border border-slate-200" />
          </div>
        </div>
      </div>

      <!-- Section 5: RAB -->
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">RAB</p>
          <div class="flex flex-col items-end text-xs">
            <span class="font-mono font-bold text-[#066C2A]"> Total: Rp {{ store.rabTotal.toLocaleString('id-ID') }} </span>
          </div>
        </div>

        <div v-if="store.rabDitandatangani" class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span class="text-xs text-slate-700 truncate"> RAB Bertandatangan: {{ getDocLabel(store.rabDitandatangani) }} </span>
          <button @click="openDocPreview(store.rabDitandatangani)" class="text-xs text-[#066C2A] font-semibold hover:underline ml-2 shrink-0">Pratinjau</button>
        </div>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" @click="emit('close')">Tutup</Button>
    </template>
  </Modal>

  <DocumentPreviewModal :isOpen="showDocPreview" :title="previewDoc?.title || ''" :dataUrl="previewDoc?.dataUrl || ''" :mimeType="previewDoc?.mimeType || ''" @close="showDocPreview = false" />
</template>
