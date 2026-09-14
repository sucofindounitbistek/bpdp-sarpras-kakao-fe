<script setup lang="ts">
import { ref, watch } from 'vue';
import Input from '@/components/ui/Input.vue';
import Card from '@/components/ui/Card.vue';
import { LOCALIZATION } from '@/config/localization';
import { IdentitasFormData } from '@/types/pekebun';

const props = defineProps<{
  modelValue: IdentitasFormData;
  errors?: Record<string, string>;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: IdentitasFormData): void;
}>();

const form = ref<IdentitasFormData>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newVal) => {
    form.value = { ...newVal };
  },
  { deep: true },
);

const updateField = (key: keyof IdentitasFormData, val: string) => {
  (form.value as any)[key] = val;
  emit('update:modelValue', form.value);
};

const updateNumericField = (key: keyof IdentitasFormData, valOrEvent: string | Event) => {
  let cleanVal = '';
  if (typeof valOrEvent === 'string') {
    cleanVal = valOrEvent.replace(/\D/g, '');
  } else if (valOrEvent && valOrEvent.target) {
    const target = valOrEvent.target as HTMLInputElement;
    cleanVal = target.value.replace(/\D/g, '');
    target.value = cleanVal;
  }
  (form.value as any)[key] = cleanVal;
  emit('update:modelValue', form.value);
};
</script>

<template>
  <Card :title="LOCALIZATION.stepIdentitasPekebun.title" :subtitle="LOCALIZATION.stepIdentitasPekebun.subtitle">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <!-- NIK -->
      <div class="flex flex-col gap-1.5">
        <label for="nik" class="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-1 font-apple-caption"> {{ LOCALIZATION.stepIdentitasPekebun.fields.nik.label }} <span class="text-rose-500">*</span> </label>
        <input
          id="nik"
          type="text"
          inputmode="numeric"
          v-model="form.nik"
          maxlength="16"
          :placeholder="LOCALIZATION.stepIdentitasPekebun.fields.nik.placeholder"
          class="w-full h-10 px-3.5 rounded-xl border bg-white text-slate-900 text-xs md:text-sm transition-colors duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed border-slate-200"
          :disabled="isLoading"
          @input="updateNumericField('nik', $event)"
        />
        <p v-if="errors?.nik" class="text-xs text-rose-600 font-apple-fine-print mt-0.5">
          {{ errors.nik }}
        </p>
        <p v-else class="text-xs text-slate-400 font-apple-fine-print">{{ LOCALIZATION.stepIdentitasPekebun.fields.nik.hint }}</p>
      </div>

      <!-- Nama Pekebun -->
      <Input id="nama" :label="LOCALIZATION.stepIdentitasPekebun.fields.nama.label" v-model="form.nama" :placeholder="LOCALIZATION.stepIdentitasPekebun.fields.nama.placeholder" required :error="errors?.nama" :disabled="isLoading" @update:modelValue="updateField('nama', $event)" />

      <!-- Nomor KK -->
      <Input id="nomorKK" only-digits maxlength="16" :label="LOCALIZATION.stepIdentitasPekebun.fields.nomorKK.label" v-model="form.nomorKK" :placeholder="LOCALIZATION.stepIdentitasPekebun.fields.nomorKK.placeholder" required :error="errors?.nomorKK" :disabled="isLoading" @update:modelValue="updateNumericField('nomorKK', $event)" />

      <!-- Jenis Kelamin -->
      <div class="flex flex-col gap-1.5">
        <label for="jenisKelamin" class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption"> {{ LOCALIZATION.stepIdentitasPekebun.fields.jenisKelamin.label }} <span class="text-rose-500">*</span> </label>
        <select id="jenisKelamin" v-model="form.jenisKelamin" class="h-10 px-3.5 rounded-xl border bg-white text-slate-900 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" :class="errors?.jenisKelamin ? 'border-rose-500' : 'border-slate-200'" :disabled="isLoading" @change="updateField('jenisKelamin', form.jenisKelamin)">
          <option value="">{{ LOCALIZATION.stepIdentitasPekebun.fields.jenisKelamin.label }}</option>
          <option value="LAKI_LAKI">{{ LOCALIZATION.stepIdentitasPekebun.fields.jenisKelamin.options.LAKI_LAKI }}</option>
          <option value="PEREMPUAN">{{ LOCALIZATION.stepIdentitasPekebun.fields.jenisKelamin.options.PEREMPUAN }}</option>
        </select>
        <p v-if="errors?.jenisKelamin" class="text-xs text-rose-600 font-apple-fine-print mt-0.5">
          {{ errors.jenisKelamin }}
        </p>
      </div>

      <!-- Status Pernikahan -->
      <div class="flex flex-col gap-1.5">
        <label for="statusPernikahan" class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption"> {{ LOCALIZATION.stepIdentitasPekebun.fields.statusPernikahan.label }} <span class="text-rose-500">*</span> </label>
        <select id="statusPernikahan" v-model="form.statusPernikahan" class="h-10 px-3.5 rounded-xl border bg-white text-slate-900 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" :class="errors?.statusPernikahan ? 'border-rose-500' : 'border-slate-200'" :disabled="isLoading" @change="updateField('statusPernikahan', form.statusPernikahan)">
          <option value="">{{ LOCALIZATION.stepIdentitasPekebun.fields.statusPernikahan.label }}</option>
          <option value="BELUM_MENIKAH">{{ LOCALIZATION.stepIdentitasPekebun.fields.statusPernikahan.options.BELUM_MENIKAH }}</option>
          <option value="MENIKAH">{{ LOCALIZATION.stepIdentitasPekebun.fields.statusPernikahan.options.MENIKAH }}</option>
          <option value="CERAI_HIDUP">{{ LOCALIZATION.stepIdentitasPekebun.fields.statusPernikahan.options.CERAI_HIDUP }}</option>
          <option value="CERAI_MATI">{{ LOCALIZATION.stepIdentitasPekebun.fields.statusPernikahan.options.CERAI_MATI }}</option>
        </select>
        <p v-if="errors?.statusPernikahan" class="text-xs text-rose-600 font-apple-fine-print mt-0.5">
          {{ errors.statusPernikahan }}
        </p>
      </div>

      <!-- Tempat & Tanggal Lahir -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption"> {{ LOCALIZATION.stepIdentitasPekebun.fields.ttl.label }} <span class="text-rose-500">*</span> </label>
        <div class="flex flex-col gap-2">
          <input type="text" v-model="form.tempatLahir" :placeholder="LOCALIZATION.stepIdentitasPekebun.fields.ttl.tempatPlaceholder" class="h-10 px-3.5 rounded-xl border bg-white text-slate-900 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" :class="errors?.tempatLahir ? 'border-rose-500' : 'border-slate-200'" :disabled="isLoading" @input="updateField('tempatLahir', form.tempatLahir)" />
          <input type="date" v-model="form.tanggalLahir" class="h-10 px-3.5 rounded-xl border bg-white text-slate-900 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" :class="errors?.tanggalLahir ? 'border-rose-500' : 'border-slate-200'" :disabled="isLoading" @input="updateField('tanggalLahir', form.tanggalLahir)" />
        </div>
        <p v-if="errors?.tempatLahir || errors?.tanggalLahir" class="text-xs text-rose-600 font-apple-fine-print mt-0.5">{{ LOCALIZATION.stepIdentitasPekebun.fields.ttl.errorMsg }}</p>
      </div>

      <!-- Alamat -->
      <div class="flex flex-col gap-1.5 md:col-span-2">
        <label for="alamat" class="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-1 font-apple-caption"> {{ LOCALIZATION.stepIdentitasPekebun.fields.alamat.label }} <span class="text-rose-500">*</span> </label>
        <textarea
          id="alamat"
          v-model="form.alamat"
          :placeholder="LOCALIZATION.stepIdentitasPekebun.fields.alamat.placeholder"
          required
          rows="3"
          :disabled="isLoading"
          class="w-full p-3.5 rounded-xl border bg-white text-slate-900 text-xs md:text-sm transition-colors duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed border-slate-200"
          @input="updateField('alamat', form.alamat)"
        ></textarea>
        <p v-if="errors?.alamat" class="text-xs text-rose-600 font-apple-fine-print mt-0.5">
          {{ errors.alamat }}
        </p>
      </div>

      <!-- Kodepos -->
      <Input id="kodepos" only-digits maxlength="5" :label="LOCALIZATION.stepIdentitasPekebun.fields.kodepos.label" v-model="form.kodepos" :placeholder="LOCALIZATION.stepIdentitasPekebun.fields.kodepos.placeholder" required :error="errors?.kodepos" :disabled="isLoading" @update:modelValue="updateNumericField('kodepos', $event)" />

      <!-- Nomor Handphone -->
      <Input id="nomorHP" only-digits maxlength="15" :label="LOCALIZATION.stepIdentitasPekebun.fields.nomorHP.label" v-model="form.nomorHP" :placeholder="LOCALIZATION.stepIdentitasPekebun.fields.nomorHP.placeholder" required :error="errors?.nomorHP" :disabled="isLoading" @update:modelValue="updateNumericField('nomorHP', $event)" />
    </div>
  </Card>
</template>
