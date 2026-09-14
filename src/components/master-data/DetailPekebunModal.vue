<script setup lang="ts">
import { ref } from 'vue';
import { X, FileText, CheckCircle2 } from 'lucide-vue-next';
import { Pekebun } from '@/types/pekebun';
import { LOCALIZATION } from '@/config/localization';
import Button from '@/components/ui/Button.vue';
import SatelliteMapPreview from '@/components/ui/SatelliteMapPreview.vue';

defineProps<{
  isOpen: boolean;
  pekebun: Pekebun | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', pekebun: Pekebun): void;
}>();

const activeTab = ref<'identitas' | 'lahan' | 'dokumen'>('identitas');

const handleViewFile = (url: string) => {
  window.open(url, '_blank');
};
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="emit('close')">
        <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div class="flex flex-col gap-0.5">
              <h3 class="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">{{ LOCALIZATION.detailPekebunModal.title.replace('{nama}', pekebun?.nama || '') }}</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-apple-caption">
                {{ LOCALIZATION.detailPekebunModal.subtitle.replace('{nik}', pekebun?.nik || '').replace('{date}', pekebun?.createdAt ? new Date(pekebun.createdAt).toLocaleDateString('id-ID') : '-') }}
              </p>
            </div>
            <button type="button" @click="emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-100 dark:border-slate-800 px-4">
            <button
              v-for="tab in ['identitas', 'lahan', 'dokumen'] as const"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'px-4 py-3 text-xs font-bold capitalize transition-all border-b-2 -mb-px',
                activeTab === tab ? 'border-[#066C2A] text-[#066C2A] dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-200',
              ]"
            >
              {{ LOCALIZATION.detailPekebunModal.tabs[tab] }}
            </button>
          </div>

          <!-- Body Scroll Area -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="pekebun">
              <!-- Tab 1: Identitas -->
              <div v-if="activeTab === 'identitas'" class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.nama }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Nomor KK</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.nomorKK }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Status Pernikahan</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 capitalize">{{ pekebun.statusPernikahan.replace('_', ' ').toLowerCase() }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Tempat & Tanggal Lahir</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1"> {{ pekebun.tempatLahir }}, {{ new Date(pekebun.tanggalLahir).toLocaleDateString('id-ID') }} </span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Alamat Lengkap</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.alamat }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Kode pos</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.kodepos }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Nomor Handphone</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.nomorHP }}</span>
                  </div>
                </div>
              </div>

              <!-- Tab 2: Lahan -->
              <div v-else-if="activeTab === 'lahan'" class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Jenis Legalitas Lahan</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.lahan.jenisLegalitas }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Nomor Legalitas</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.lahan.nomorLegalitas }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Tanggal Penerbitan Legalitas</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {{ new Date(pekebun.lahan.tanggalPenerbitanLegalitas).toLocaleDateString('id-ID') }}
                    </span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Luas Lahan</span>
                    <span class="text-xs md:text-sm font-semibold text-[#066C2A] dark:text-emerald-400 mt-1">{{ pekebun.lahan.luasLahan }} Hektar</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Lokasi Kebun (Provinsi, Kabupaten, Kecamatan, Desa)</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {{ pekebun.lahan.provinsiNama }} • {{ pekebun.lahan.kabupatenNama }} • {{ pekebun.lahan.kecamatanNama }} • {{ pekebun.lahan.desaNama }}
                    </span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Alamat Kebun / Blok</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.lahan.alamatKebun }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Tahun Tanam</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.lahan.tahunTanam }}</span>
                  </div>
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Jenis Bibit</span>
                    <span class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{{ pekebun.lahan.jenisBibit }}</span>
                  </div>

                  <!-- Satellite Map Embed -->
                  <div class="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2 gap-2">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Peta Poligon Lahan Kebun (Mode Satelit)</span>
                    <SatelliteMapPreview :coordinates="pekebun.lahan.coordinates" :luas-lahan="pekebun.lahan.luasLahan" height="300px" />
                    <div class="mt-1">
                      <span class="text-[10px] uppercase font-bold text-slate-400">Data Koordinat (Raw)</span>
                      <pre class="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-24">{{
                        pekebun.lahan.coordinates
                      }}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 3: Dokumen -->
              <div v-else-if="activeTab === 'dokumen'" class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div v-for="doc in pekebun.dokumen" :key="doc.id" class="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3 justify-between">
                    <div class="flex items-start gap-2.5">
                      <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 flex items-center justify-center shrink-0">
                        <FileText class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" />
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="text-[10px] uppercase font-bold text-slate-400 leading-none">
                          {{ doc.documentType.replace('_', ' ') }}
                        </span>
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 truncate">{{ doc.fileName }}</span>
                        <span class="text-[10px] text-slate-400 mt-0.5">{{ (doc.fileSize / (1024 * 1024)).toFixed(2) }} MB</span>
                      </div>
                    </div>
                    <Button v-if="doc.fileUrl !== '#'" size="sm" variant="outline" class="w-full flex items-center justify-center gap-1 mt-1 text-[11px]" @click="handleViewFile(doc.fileUrl)">
                      <CheckCircle2 class="w-3.5 h-3.5" /> Lihat Berkas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            v-if="pekebun && !pekebun.isDraft"
            variant="outline"
            size="md"
            :disabled="pekebun.isInProposal"
            :class="pekebun.isInProposal ? 'border-slate-200 text-slate-300 cursor-not-allowed opacity-50' : 'border-emerald-500 text-emerald-700 hover:bg-emerald-50'"
            :title="pekebun.isInProposal ? 'Pekebun sudah terdaftar dalam proposal dan tidak dapat diubah' : LOCALIZATION.detailPekebunModal.buttons.edit"
            @click="!pekebun.isInProposal && emit('edit', pekebun)"
          >
            {{ LOCALIZATION.detailPekebunModal.buttons.edit }}
          </Button>
          <Button variant="outline" size="md" @click="emit('close')"> {{ LOCALIZATION.detailPekebunModal.buttons.close }} </Button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
