<script setup lang="ts">
import { computed } from 'vue';
import Card from '@/components/ui/Card.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import Badge from '@/components/ui/Badge.vue';
import { DokumenPersyaratan } from '@/types/pengusulan';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const props = defineProps<{
  modelValue: DokumenPersyaratan[];
  proposalNumber?: string | null;
  institutionName?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: DokumenPersyaratan[]): void;
}>();

const resolvedInstitutionName = computed(() => props.institutionName || authStore.user?.kelembagaan_name || authStore.user?.name || 'Kelembagaan');

const handleFileUploaded = (tipe: DokumenPersyaratan['tipeDokumen'], file: File) => {
  const existing = props.modelValue.filter((d) => d.tipeDokumen !== tipe);
  const prev = props.modelValue.find((d) => d.tipeDokumen === tipe);
  const updated: DokumenPersyaratan[] = [
    ...existing,
    {
      id: prev?.id || `DOC-${Date.now()}`,
      tipeDokumen: tipe,
      namaFile: file.name,
      urlFile: URL.createObjectURL(file),
      ukuranBytes: file.size,
      uploadedAt: new Date().toISOString().split('T')[0],
      isValid: true,
      source: 'MANUAL',
      isVerifiedFromIam: false,
    },
  ];
  emit('update:modelValue', updated);
};

const getFileStatus = (tipe: DokumenPersyaratan['tipeDokumen']) => {
  return props.modelValue.find((d) => d.tipeDokumen === tipe);
};

const handleViewFile = (url: string) => {
  window.open(url, '_blank');
};
</script>

<template>
  <Card title="Tahap 4: Upload Dokumen Persyaratan Wajib" subtitle="Unggah berkas legalitas kelembagaan dan proposal pengusulan (PDF/JPG max 5MB)">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Slot 1: KTP -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-800">1. KTP Pengurus & Anggota</span>
          <Badge v-if="getFileStatus('KTP')" variant="success">Sudah Diunggah</Badge>
          <Badge v-else variant="danger">Wajib</Badge>
        </div>
        <FileUpload
          id="docKTP"
          document-label="KTP"
          :proposal-number="props.proposalNumber || 'DRAFT'"
          :institution-name="resolvedInstitutionName"
          :initial-file-name="getFileStatus('KTP')?.namaFile || ''"
          placeholder="Unggah scan KTP pengurus (PDF/JPG max 5MB)"
          @file-selected="handleFileUploaded('KTP', $event)"
        />
        <button
          v-if="getFileStatus('KTP')?.urlFile"
          type="button"
          class="text-xs font-semibold text-[#066C2A] hover:underline self-start"
          @click="handleViewFile(getFileStatus('KTP')!.urlFile)"
        >
          Lihat Dokumen KTP
        </button>
      </div>

      <!-- Slot 2: KK -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-800">2. Kartu Keluarga (KK) Pekebun</span>
          <Badge v-if="getFileStatus('KK')" variant="success">Sudah Diunggah</Badge>
          <Badge v-else variant="danger">Wajib</Badge>
        </div>
        <FileUpload
          id="docKK"
          document-label="KK"
          :proposal-number="props.proposalNumber || 'DRAFT'"
          :institution-name="resolvedInstitutionName"
          :initial-file-name="getFileStatus('KK')?.namaFile || ''"
          placeholder="Unggah scan KK anggota (PDF/JPG max 5MB)"
          @file-selected="handleFileUploaded('KK', $event)"
        />
        <button
          v-if="getFileStatus('KK')?.urlFile"
          type="button"
          class="text-xs font-semibold text-[#066C2A] hover:underline self-start"
          @click="handleViewFile(getFileStatus('KK')!.urlFile)"
        >
          Lihat Dokumen KK
        </button>
      </div>

      <!-- Slot 3: Proposal -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-800">3. Proposal Pengajuan Sarpras</span>
          <Badge v-if="getFileStatus('PROPOSAL')" variant="success">Sudah Diunggah</Badge>
          <Badge v-else variant="danger">Wajib</Badge>
        </div>
        <FileUpload
          id="docProposal"
          document-label="Proposal-Usulan"
          :proposal-number="props.proposalNumber || 'DRAFT'"
          :institution-name="resolvedInstitutionName"
          :initial-file-name="getFileStatus('PROPOSAL')?.namaFile || ''"
          placeholder="Unggah Proposal Pengajuan Resmi (PDF max 5MB)"
          @file-selected="handleFileUploaded('PROPOSAL', $event)"
        />
        <button
          v-if="getFileStatus('PROPOSAL')?.urlFile"
          type="button"
          class="text-xs font-semibold text-[#066C2A] hover:underline self-start"
          @click="handleViewFile(getFileStatus('PROPOSAL')!.urlFile)"
        >
          Lihat Dokumen Proposal
        </button>
      </div>

      <!-- Slot 4: Legalitas Kelembagaan / Akta -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-800">4. Legalitas Kelembagaan / Akta</span>
          <Badge v-if="getFileStatus('AKTA_LEMBAGA')?.isVerifiedFromIam" variant="info" class="bg-blue-50 text-blue-700 border-blue-200">
            ✓ Terverifikasi dari IAM
          </Badge>
          <Badge v-else-if="getFileStatus('AKTA_LEMBAGA')" variant="success">Sudah Diunggah</Badge>
          <Badge v-else variant="danger">Wajib</Badge>
        </div>
        <FileUpload
          id="docAkta"
          document-label="Akta-Lembaga"
          :proposal-number="props.proposalNumber || 'DRAFT'"
          :institution-name="resolvedInstitutionName"
          :initial-file-name="getFileStatus('AKTA_LEMBAGA')?.namaFile || ''"
          placeholder="Unggah Akta Koperasi / SK Dinas (PDF max 5MB)"
          @file-selected="handleFileUploaded('AKTA_LEMBAGA', $event)"
        />
        <div class="flex items-center justify-between">
          <button
            v-if="getFileStatus('AKTA_LEMBAGA')?.urlFile"
            type="button"
            class="text-xs font-semibold text-[#066C2A] hover:underline self-start"
            @click="handleViewFile(getFileStatus('AKTA_LEMBAGA')!.urlFile)"
          >
            👁 Pratinjau Dokumen Akta
          </button>
          <span v-if="getFileStatus('AKTA_LEMBAGA')?.isVerifiedFromIam" class="text-[10px] text-slate-400 italic">
            Dapat diganti dengan unggah manual jika ada pembaruan
          </span>
        </div>
      </div>

      <!-- Slot 5: Surat Penunjukan Ketua / SK Pengurus -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-800">5. Surat Penunjukan Ketua / SK Pengurus</span>
          <Badge v-if="getFileStatus('PENUNJUKAN_KETUA')?.isVerifiedFromIam" variant="info" class="bg-blue-50 text-blue-700 border-blue-200">
            ✓ Terverifikasi dari IAM
          </Badge>
          <Badge v-else-if="getFileStatus('PENUNJUKAN_KETUA')" variant="success">Sudah Diunggah</Badge>
          <Badge v-else variant="danger">Wajib</Badge>
        </div>
        <FileUpload
          id="docPenunjukanKetua"
          document-label="Penunjukan-Ketua"
          :proposal-number="props.proposalNumber || 'DRAFT'"
          :institution-name="resolvedInstitutionName"
          :initial-file-name="getFileStatus('PENUNJUKAN_KETUA')?.namaFile || ''"
          placeholder="Unggah SK Penunjukan Ketua / Pengurus (PDF max 5MB)"
          @file-selected="handleFileUploaded('PENUNJUKAN_KETUA', $event)"
        />
        <div class="flex items-center justify-between">
          <button
            v-if="getFileStatus('PENUNJUKAN_KETUA')?.urlFile"
            type="button"
            class="text-xs font-semibold text-[#066C2A] hover:underline self-start"
            @click="handleViewFile(getFileStatus('PENUNJUKAN_KETUA')!.urlFile)"
          >
            👁 Pratinjau Surat Penunjukan Ketua
          </button>
          <span v-if="getFileStatus('PENUNJUKAN_KETUA')?.isVerifiedFromIam" class="text-[10px] text-slate-400 italic">
            Dapat diganti dengan unggah manual jika ada pembaruan
          </span>
        </div>
      </div>
    </div>
  </Card>
</template>