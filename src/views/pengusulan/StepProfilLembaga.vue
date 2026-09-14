<script setup lang="ts">
import { ref } from 'vue';
import Input from '@/components/ui/Input.vue';
import Card from '@/components/ui/Card.vue';
import { LembagaPengusul } from '@/types/pengusulan';

const props = defineProps<{
  modelValue: LembagaPengusul;
  errors?: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: LembagaPengusul): void;
}>();

const form = ref<LembagaPengusul>({ ...props.modelValue });

const updateField = (key: keyof LembagaPengusul, val: string) => {
  (form.value as any)[key] = val;
  emit('update:modelValue', form.value);
};
</script>

<template>
  <Card title="Tahap 1: Profil Operator Kelembagaan Pekebun" subtitle="Masukkan informasi legalitas kelembagaan dan kontak penanggung jawab">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input id="namaLembaga" label="Nama Lembaga / Koperasi" v-model="form.namaLembaga" placeholder="Contoh: Koperasi Tani Kelapa Sejahtera" required :error="errors?.namaLembaga" @update:modelValue="updateField('namaLembaga', $event)" />

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-slate-700 font-apple-caption"> Jenis Kelembagaan <span class="text-rose-500">*</span> </label>
        <select
          v-model="form.jenisLembaga"
          @change="updateField('jenisLembaga', form.jenisLembaga)"
          class="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#066C2A] focus:ring-2 focus:ring-[#066C2A]/20"
        >
          <option value="KOPERASI">Koperasi Pekebun</option>
          <option value="POKTAN">Kelompok Tani (POKTAN)</option>
          <option value="GAPOKTAN">Gabungan Kelompok Tani (GAPOKTAN)</option>
        </select>
      </div>

      <Input id="nomorAkta" label="Nomor Akta Pendirian / SK Kemenkumham" v-model="form.nomorAkta" placeholder="AHU-xxxxxxx.AH.01.02.2024" required :error="errors?.nomorAkta" @update:modelValue="updateField('nomorAkta', $event)" />

      <Input id="namaKetua" label="Nama Ketua Lembaga" v-model="form.namaKetua" placeholder="Nama Sesuai KTP" required :error="errors?.namaKetua" @update:modelValue="updateField('namaKetua', $event)" />

      <Input id="nikKetua" only-digits maxlength="16" label="NIK Ketua Lembaga (16 Digit)" v-model="form.nikKetua" placeholder="7301xxxxxxxxxxxx" required :error="errors?.nikKetua" @update:modelValue="updateField('nikKetua', $event)" />

      <Input id="telepon" only-digits maxlength="15" label="Nomor Telepon / WhatsApp" v-model="form.telepon" placeholder="0812xxxxxxxx" required :error="errors?.telepon" @update:modelValue="updateField('telepon', $event)" />

      <Input
        id="alamatLengkap"
        label="Alamat Lengkap Kantor / Sekretariat"
        v-model="form.alamatLengkap"
        placeholder="Jl. Perkebunan No. 12, Desa X"
        required
        custom-class="md:col-span-2"
        :error="errors?.alamatLengkap"
        @update:modelValue="updateField('alamatLengkap', $event)"
      />

      <Input id="namaBank" label="Nama Bank Penampung" v-model="form.namaBank" placeholder="Contoh: Bank BRI / Bank Mandiri" required :error="errors?.namaBank" @update:modelValue="updateField('namaBank', $event)" />

      <Input id="nomorRekening" label="Nomor Rekening Lembaga" v-model="form.nomorRekening" placeholder="1234-01-xxxxxx-xx-x" required :error="errors?.nomorRekening" @update:modelValue="updateField('nomorRekening', $event)" />

      <Input
        id="namaPemilikRekening"
        label="Nama Pemilik Rekening (Sesuai Buku Tabungan)"
        v-model="form.namaPemilikRekening"
        placeholder="Nama Koperasi / Lembaga"
        required
        custom-class="md:col-span-2"
        :error="errors?.namaPemilikRekening"
        @update:modelValue="updateField('namaPemilikRekening', $event)"
      />
    </div>
  </Card>
</template>
