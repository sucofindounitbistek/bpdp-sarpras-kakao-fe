<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StepIdentitasPekebun from '@/components/master-data/StepIdentitasPekebun.vue';
import StepUploadDokumenPekebun from '@/components/master-data/StepUploadDokumenPekebun.vue';
import StepDataLahanPekebun from '@/components/master-data/StepDataLahanPekebun.vue';
import Button from '@/components/ui/Button.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { usePekebunStore } from '@/stores/pekebun';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { useFormWizard } from '@/composables/useFormWizard';
import { LOCALIZATION } from '@/config/localization';
import { identitasPekebunSchema, identitasPekebunSikpSchema, lahanPekebunListSchema } from '@/schemas/pekebun.schema';
import { IdentitasFormData, DokumenFormData, LahanFormData, DokumenPekebun, TipeDokumenPekebun } from '@/types/pekebun';
import { ChevronLeft, ChevronRight, Check, UserPlus, Upload, MapPin } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const store = usePekebunStore();
const authStore = useAuthStore();
const toast = useToast();

const userKelembagaanId = computed(() => {
  return (
    (authStore.user?.kelembagaan_id ? Number(authStore.user.kelembagaan_id) : undefined) ??
    (authStore.user?.kelembagaanId ? Number(authStore.user.kelembagaanId) : undefined)
  );
});

const isSubmitting = ref(false);
const isValidating = ref(false);
const editingDraftId = ref<string | null>(null);
const isEditingRegistered = ref(false);
const isLahanEditing = ref(false);
const validationErrors = ref<Record<string, string>>({});

const steps = [
  { id: 1, title: 'Identitas Pekebun', description: 'Verifikasi NIK & Kontak', icon: UserPlus },
  { id: 2, title: 'Upload Dokumen', description: 'KTP, KK & Surat Kuasa', icon: Upload },
  { id: 3, title: 'Data Lahan', description: 'Legalitas & Wilayah Lahan', icon: MapPin },
];

const identitasData = ref<IdentitasFormData>({
  nik: '',
  nama: '',
  nomorKK: '',
  jenisKelamin: '',
  statusPernikahan: '',
  tempatLahir: '',
  tanggalLahir: '',
  alamat: '',
  kodepos: '',
  nomorHP: '',
  kelembagaanId: userKelembagaanId.value,
});

const dokumenData = ref<DokumenFormData>({
  scanKTP: null,
  scanKK: null,
  swafoto: null,
  suratKuasa: null,
});

const lahanDataList = ref<LahanFormData[]>([]);
const existingLahanIds = ref<string[]>([]);

onMounted(async () => {
  const idParam = (route.query.draftId || route.params.id) as string | undefined;
  if (!idParam) return;

  editingDraftId.value = idParam;
  try {
    const result = await store.resumeDraft(idParam);
    if (!result) {
      toast.error('Gagal memuat data pekebun', 'Error');
      return;
    }

    const { pekebun, lahanList } = result;
    if (pekebun && (pekebun.isInProposal || lahanList.some((l) => l.isInProposal))) {
      toast.error('Pekebun ini sudah terdaftar dalam proposal dan tidak dapat diubah.', 'Aksi Ditolak');
      router.push('/master-data/pekebun');
      return;
    }

    if (pekebun && !pekebun.isDraft) {
      isEditingRegistered.value = true;
    }

    identitasData.value = {
      nik: pekebun.nik || '',
      nama: pekebun.nama || '',
      nomorKK: pekebun.nomorKK || '',
      jenisKelamin: '',
      statusPernikahan: pekebun.statusPernikahan || '',
      tempatLahir: pekebun.tempatLahir || '',
      tanggalLahir: pekebun.tanggalLahir || '',
      alamat: pekebun.alamat || '',
      kodepos: pekebun.kodepos || '',
      nomorHP: pekebun.nomorHP || '',
      kelembagaanId: pekebun.kelembagaanId || userKelembagaanId.value,
    };

    const ktpDoc = pekebun.dokumen?.find((d) => d.documentType === TipeDokumenPekebun.SCAN_KTP) || null;
    const kkDoc = pekebun.dokumen?.find((d) => d.documentType === TipeDokumenPekebun.SCAN_KK) || null;
    const swafotoDoc = pekebun.dokumen?.find((d) => d.documentType === TipeDokumenPekebun.SWAFOTO) || null;
    const suratKuasaDoc = pekebun.dokumen?.find((d) => d.documentType === TipeDokumenPekebun.SURAT_KUASA) || null;

    dokumenData.value = {
      scanKTP: ktpDoc,
      scanKK: kkDoc,
      swafoto: swafotoDoc,
      suratKuasa: suratKuasaDoc,
    };

    if (lahanList.length > 0) {
      existingLahanIds.value = lahanList.map((l) => l.id);
      lahanDataList.value = lahanList.map((l) => {
        const scanLegalitasDoc = l.dokumen?.find((d) => d.tipeDokumen === 'SCAN_LEGALITAS');
        const scanBedaNamaDoc = l.dokumen?.find((d) => d.tipeDokumen === 'SURAT_KETERANGAN_BEDA_NAMA');

        // console.log(scanLegalitasDoc);
        // console.log(scanBedaNamaDoc);

        return {
          jenisLegalitas: l.jenisLegalitas || '',
          nomorLegalitas: l.nomorLegalitas || '',
          tanggalPenerbitanLegalitas: l.tanggalPenerbitanLegalitas || '',
          luasLahan: l.luasLahan || '',
          provinsiKode: l.provinsiKode || '',
          kabupatenKode: l.kabupatenKode || '',
          kecamatanKode: l.kecamatanKode || '',
          desaKode: l.desaKode || '',
          alamatKebun: l.alamatKebun || '',
          tahunTanam: l.tahunTanam ? String(l.tahunTanam) : '',
          jenisBibit: l.jenisBibit || '',
          scanLegalitas: scanLegalitasDoc
            ? ({ id: scanLegalitasDoc.id, documentType: scanLegalitasDoc.tipeDokumen, fileName: scanLegalitasDoc.fileName, fileUrl: scanLegalitasDoc.fileUrl, fileSize: 0, fileExtension: scanLegalitasDoc.mimeType } as DokumenPekebun)
            : null,
          existingScanLegalitasUrl: scanLegalitasDoc?.fileUrl || '',
          scanBedaNamaLahan: scanBedaNamaDoc
            ? ({ id: scanBedaNamaDoc.id, documentType: scanBedaNamaDoc.tipeDokumen, fileName: scanBedaNamaDoc.fileName, fileUrl: scanBedaNamaDoc.fileUrl, fileSize: 0, fileExtension: scanBedaNamaDoc.mimeType } as DokumenPekebun)
            : null,
          nomorSuratBedaNama: l.nomorSuratBedaNama || '',
          coordinates: l.coordinates || [],
          _id: l.id,
        } as LahanFormData & { _id?: string };
      });
    }

    console.log(lahanDataList.value);

    toast.info(`Melanjutkan pengisian draft Pekebun: ${pekebun.nama || pekebun.nik}`, 'Draft Dimuat');
  } catch (err: any) {
    handleApiError(err, 'Gagal memuat data pekebun');
  }
});

const wizard = useFormWizard(3);

// Gate for leaving the identitas step (step 1 → 2): local schema validation,
// duplicate NIK check, then — for new/draft registrations — a one-shot
// demographic validation against SIKP/Dukcapil via POST /sikp/validate-nik.
// Already-registered Pekebun skip the SIKP call (data was verified at
// registration and BE does not store email/gender).
const validateStepIdentitas = async (): Promise<boolean> => {
  validationErrors.value = {};

  const schema = isEditingRegistered.value ? identitasPekebunSchema : identitasPekebunSikpSchema;
  const resultIdentitas = schema.safeParse(identitasData.value);
  if (!resultIdentitas.success) {
    const errObj: Record<string, string> = {};
    resultIdentitas.error.errors.forEach((err) => {
      if (err.path[0]) {
        errObj[err.path[0] as string] = err.message;
      }
    });
    validationErrors.value = errObj;
    toast.error('Lengkapi data identitas dengan benar.', 'Validasi Identitas');
    return false;
  }

  if (store.isNikRegistered(identitasData.value.nik, editingDraftId.value)) {
    validationErrors.value.nik = 'Nomor KTP sudah terdaftar dalam Master Data';
    toast.error('Nomor KTP sudah terdaftar di sistem!', 'Validasi Duplikat');
    return false;
  }

  if (!editingDraftId.value) {
    const existingDraft = store.findDraftByNik(identitasData.value.nik);
    if (existingDraft) {
      editingDraftId.value = existingDraft.id;
      existingLahanIds.value = existingDraft.daftarLahan?.map((l: any) => l.id).filter(Boolean) || [];
      router.replace({ query: { ...route.query, draftId: existingDraft.id } });
    }
  }

  if (isEditingRegistered.value) return true;

  isValidating.value = true;
  try {
    const res = await store.validateNikSikp(identitasData.value);
    if (!res.valid) {
      validationErrors.value.nik = res.message;
      toast.error(res.message, 'Verifikasi Dukcapil Gagal');
      return false;
    }
    toast.success('Data identitas terverifikasi melalui SIKP/Dukcapil.', 'Verifikasi Berhasil');
    return true;
  } finally {
    isValidating.value = false;
  }
};

const handleNext = async () => {
  if (wizard.currentStepIndex.value === 0) {
    const isValid = await validateStepIdentitas();
    if (!isValid) return;
  }
  if (!wizard.isLastStep.value) {
    wizard.goToStep(wizard.currentStepIndex.value + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const handleStepClick = async (idx: number) => {
  if (wizard.currentStepIndex.value === 0 && idx > 0) {
    const isValid = await validateStepIdentitas();
    if (!isValid) return;
  }
  wizard.goToStep(idx);
};

const handlePrev = () => {
  if (!wizard.isFirstStep.value) {
    wizard.goToStep(wizard.currentStepIndex.value - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function getErrorMessage(err: any, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  let data = err.response?.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // ignore
    }
  }
  return (
    data?.error?.message ||
    (typeof data?.error === 'string' ? data.error : null) ||
    data?.message ||
    (typeof data === 'string' ? data : null) ||
    err.message ||
    fallback
  );
}

function handleApiError(err: any, defaultMsg: string) {
  const errorMsg = getErrorMessage(err, defaultMsg);

  if (errorMsg.includes(':')) {
    const colonIdx = errorMsg.indexOf(':');
    const fieldKey = errorMsg.slice(0, colonIdx).trim();
    const fieldMsg = errorMsg.slice(colonIdx + 1).trim();

    const fieldMap: Record<string, string> = {
      surat_kuasa: 'suratKuasa',
      scan_ktp: 'scanKTP',
      scan_kk: 'scanKK',
      swafoto: 'swafoto',
      nik: 'nik',
      nomor_kk: 'nomorKK',
      name: 'nama',
      nama: 'nama',
      phone_number: 'nomorHP',
      address: 'alamat',
      postcode: 'kodepos',
      place_of_birth: 'tempatLahir',
      date_of_birth: 'tanggalLahir',
    };

    const targetField = fieldMap[fieldKey] || fieldKey;
    validationErrors.value[targetField] = fieldMsg;

    if (['suratKuasa', 'scanKTP', 'scanKK', 'swafoto'].includes(targetField)) {
      wizard.goToStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (['nik', 'nama', 'nomorKK', 'nomorHP', 'alamat', 'kodepos', 'tempatLahir', 'tanggalLahir'].includes(targetField)) {
      wizard.goToStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toast.error(errorMsg, 'Error');
}

const handleSubmit = async () => {
  validationErrors.value = {};

  const resultIdentitas = identitasPekebunSchema.safeParse(identitasData.value);
  if (!resultIdentitas.success) {
    const errObj: Record<string, string> = {};
    resultIdentitas.error.errors.forEach((err) => {
      if (err.path[0]) {
        errObj[err.path[0] as string] = err.message;
      }
    });
    validationErrors.value = errObj;
    wizard.goToStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.error('Lengkapi data identitas dengan benar.', 'Validasi Identitas');
    return;
  }

  if (store.isNikRegistered(identitasData.value.nik, editingDraftId.value)) {
    validationErrors.value.nik = 'Nomor KTP sudah terdaftar dalam Master Data';
    wizard.goToStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.error('Nomor KTP sudah terdaftar di sistem!', 'Validasi Duplikat');
    return;
  }

  const docsErrObj: Record<string, string> = {};
  if (!dokumenData.value.scanKTP) docsErrObj.scanKTP = 'Scan KTP wajib diunggah';
  if (!dokumenData.value.scanKK) docsErrObj.scanKK = 'Scan KK wajib diunggah';
  if (!dokumenData.value.swafoto) docsErrObj.swafoto = 'Swafoto wajib diunggah';
  if (!dokumenData.value.suratKuasa) docsErrObj.suratKuasa = 'Surat kuasa ke ketua wajib diunggah';

  if (Object.keys(docsErrObj).length > 0) {
    validationErrors.value = docsErrObj;
    wizard.goToStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.error('Semua dokumen wajib diunggah.', 'Validasi Dokumen');
    return;
  }

  const resultLahan = lahanPekebunListSchema.safeParse(lahanDataList.value);
  const lahanErrObj: Record<string, string> = {};

  if (!resultLahan.success) {
    resultLahan.error.errors.forEach((err) => {
      const pathKey = err.path.join('.');
      lahanErrObj[pathKey] = err.message;
    });
  }

  console.log(lahanErrObj);

  lahanDataList.value.forEach((lahan, index) => {
    if (!lahan.scanLegalitas && !lahan.existingScanLegalitasUrl) {
      lahanErrObj[`${index}.scanLegalitas`] = 'Scan legalitas lahan wajib diunggah';
    }
  });

  if (Object.keys(lahanErrObj).length > 0 || lahanDataList.value.length === 0) {
    if (lahanDataList.value.length === 0) {
      toast.error('Minimal harus menambahkan 1 data lahan.', 'Validasi Lahan');
    } else {
      toast.error('Lengkapi data lahan dengan benar.', 'Validasi Lahan');
    }
    validationErrors.value = lahanErrObj;
    wizard.goToStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (!editingDraftId.value) {
    const existingDraft = store.findDraftByNik(identitasData.value.nik);
    if (existingDraft) {
      editingDraftId.value = existingDraft.id;
      existingLahanIds.value = existingDraft.daftarLahan?.map((l: any) => l.id).filter(Boolean) || [];
      router.replace({ query: { ...route.query, draftId: existingDraft.id } });
    }
  }

  isSubmitting.value = true;
  try {
    if (!identitasData.value.kelembagaanId && userKelembagaanId.value) {
      identitasData.value.kelembagaanId = userKelembagaanId.value;
    }
    let result;
    if (editingDraftId.value) {
      result = await store.updatePekebunWithLahan(editingDraftId.value, identitasData.value, dokumenData.value, lahanDataList.value, existingLahanIds.value, false, userKelembagaanId.value);
    } else {
      result = await store.createPekebunWithLahan(identitasData.value, dokumenData.value, lahanDataList.value, false, userKelembagaanId.value);
    }
    if (result) {
      toast.success('Data Pekebun berhasil disimpan.', 'Registrasi Berhasil');
      router.push('/master-data/pekebun');
    } else {
      toast.error('Gagal menyimpan data pekebun', 'Error');
    }
  } catch (err: any) {
    if (err?.createdPekebun?.id) {
      editingDraftId.value = String(err.createdPekebun.id);
      existingLahanIds.value = lahanDataList.value.map((l: any) => l._id).filter(Boolean);
      router.replace({ query: { ...route.query, draftId: String(err.createdPekebun.id) } });
    }
    handleApiError(err, 'Gagal menyimpan data pekebun');
  } finally {
    isSubmitting.value = false;
  }
};

const handleSaveDraft = async () => {
  if (!identitasData.value.nik || identitasData.value.nik.length !== 16) {
    toast.error('Masukkan 16 digit NIK sebelum menyimpan draft.', 'Validasi NIK');
    return;
  }

  console.log(lahanDataList.value);

  if (!editingDraftId.value) {
    const existingDraft = store.findDraftByNik(identitasData.value.nik);
    if (existingDraft) {
      editingDraftId.value = existingDraft.id;
      existingLahanIds.value = existingDraft.daftarLahan?.map((l: any) => l.id).filter(Boolean) || [];
      router.replace({ query: { ...route.query, draftId: existingDraft.id } });
    }
  }

  isSubmitting.value = true;
  try {
    if (!identitasData.value.kelembagaanId && userKelembagaanId.value) {
      identitasData.value.kelembagaanId = userKelembagaanId.value;
    }
    let result;
    if (editingDraftId.value) {
      result = await store.updatePekebunWithLahan(editingDraftId.value, identitasData.value, dokumenData.value, lahanDataList.value, existingLahanIds.value, true, userKelembagaanId.value);
    } else {
      result = await store.createPekebunWithLahan(identitasData.value, dokumenData.value, lahanDataList.value, true, userKelembagaanId.value);
    }
    if (result) {
      editingDraftId.value = String(result.id);
      existingLahanIds.value = lahanDataList.value.map((l: any) => l._id).filter(Boolean);
      router.replace({ query: { ...route.query, draftId: String(result.id) } });
      toast.success(LOCALIZATION.pekebunDraft.saveDraftSuccess, 'Draft Disimpan');
    } else {
      toast.error('Gagal menyimpan draft pekebun', 'Error');
    }
  } catch (err: any) {
    if (err?.createdPekebun?.id) {
      editingDraftId.value = String(err.createdPekebun.id);
      existingLahanIds.value = lahanDataList.value.map((l: any) => l._id).filter(Boolean);
      router.replace({ query: { ...route.query, draftId: String(err.createdPekebun.id) } });
    }
    handleApiError(err, 'Gagal menyimpan draft pekebun');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header -->
    <header class="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-1.5">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 font-apple-display-lg mt-0.5">
        {{ editingDraftId ? LOCALIZATION.pekebunDraft.editTitle : LOCALIZATION.pekebunDraft.createTitle }}
      </h1>
      <p class="text-xs text-slate-500 font-apple-caption">Tambahkan data pekebun beserta lahan untuk dimasukkan ke dalam Master Data Pekebun.</p>
    </header>

    <!-- Step Progress Bar -->
    <div class="bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
      <div class="flex items-center justify-between min-w-[500px] gap-2">
        <div v-for="(st, idx) in steps" :key="st.id" class="flex items-center gap-2 flex-1 cursor-pointer hover:opacity-80 transition-all duration-200" @click="handleStepClick(idx)">
          <div
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-200 shrink-0',
              wizard.currentStep.value === st.id ? 'bg-[#066C2A] text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-200' : wizard.currentStep.value > st.id ? 'bg-emerald-100 text-[#066C2A]' : 'bg-slate-100 text-slate-400',
            ]"
          >
            <component :is="st.icon" class="w-4 h-4" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-bold text-slate-800 leading-tight truncate">{{ st.title }}</span>
            <span class="text-[10px] text-slate-400 font-apple-caption truncate">{{ st.description }}</span>
          </div>
          <div v-if="idx < steps.length - 1" class="h-1.5 flex-1 mx-3 rounded-full relative overflow-hidden bg-slate-200 shrink-0 min-w-12">
            <div class="h-full bg-[#066C2A] transition-all duration-500 ease-in-out" :style="{ width: wizard.currentStep.value > st.id ? '100%' : '0%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Active Step Content Area -->
    <div class="flex flex-col gap-6">
      <StepIdentitasPekebun v-if="wizard.currentStep.value === 1" v-model="identitasData" :errors="validationErrors" :is-loading="isValidating" />
      <StepUploadDokumenPekebun v-else-if="wizard.currentStep.value === 2" v-model="dokumenData" :errors="validationErrors" />
      <StepDataLahanPekebun v-show="wizard.currentStepIndex.value === 2" v-model="lahanDataList" :errors="validationErrors" @update:is-editing="isLahanEditing = $event" />

      <!-- Navigation Step Controls Footer -->
      <div class="flex items-center justify-between bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center gap-3">
          <Button v-if="!wizard.isFirstStep.value" variant="outline" @click="handlePrev" class="flex items-center gap-2 font-bold"> <ChevronLeft class="w-4 h-4" /> Kembali </Button>

          <Button v-if="!isEditingRegistered" variant="outline" :disabled="isSubmitting || (wizard.isLastStep.value && isLahanEditing)" @click="handleSaveDraft" class="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 active:bg-amber-100 font-bold"> Simpan Draft </Button>
        </div>

        <Button v-if="!wizard.isLastStep.value" variant="primary" :loading="isValidating" :disabled="isSubmitting" @click="handleNext" class="flex items-center gap-2"> {{ isValidating ? 'Memverifikasi Data...' : 'Lanjut Tahap Berikutnya' }} <ChevronRight v-if="!isValidating" class="w-4 h-4" /> </Button>

        <Button
          v-slot
          v-else
          variant="primary"
          :disabled="isSubmitting || isLahanEditing"
          :title="isLahanEditing ? 'Selesaikan atau batalkan input data lahan sebelum menyimpan pekebun' : undefined"
          @click="handleSubmit"
          class="flex items-center gap-2"
        >
          <Check class="w-4 h-4" /> Simpan Pekebun
        </Button>
      </div>
    </div>
  </div>
</template>
