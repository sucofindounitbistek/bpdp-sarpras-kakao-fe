<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Card from '@/components/ui/Card.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import { useToast } from '@/composables/useToast';
import {
  kelembagaanService,
  type ProfileKelembagaanData,
} from '@/services/kelembagaan.service';
import { useAuthStore } from '@/stores/auth';
import {
  Building2,
  Users,
  MapPin,
  ShieldCheck,
  FileText,
  Eye,
  Building,
  RefreshCw,
  AlertCircle,
  UserCheck,
} from 'lucide-vue-next';

const toast = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const errorMessage = ref<string | null>(null);

const profile = ref<ProfileKelembagaanData | null>(null);

const isSyncPending = computed(() => {
  return profile.value?.status === 'SYNC_PENDING';
});

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

const authStore = useAuthStore();

// Operator / Petugas Input info from active login session
const operatorInfo = computed(() => {
  const user = authStore.user;
  if (!user) return null;
  return {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone_number || '',
    role: user.role || 'KELEMBAGAAN_PEKEBUN',
  };
});

// Helper to determine if a field has actual non-empty, non-dash value
function hasValue(val: any): boolean {
  if (val === null || val === undefined) return false;
  const str = String(val).trim();
  return str !== '' && str !== '-' && str !== 'null' && str !== 'undefined';
}

// Helper to check if bank section has at least one valid field
const hasBankData = computed(() => {
  if (!profile.value) return false;
  return (
    hasValue(profile.value.bank_nama) ||
    hasValue(profile.value.bank_rekening) ||
    hasValue(profile.value.bank_atas_nama)
  );
});

// Filtered legal documents (exclude items with missing file_url or placeholder unless valid)
const validDokumenLegalitas = computed(() => {
  if (!profile.value?.dokumen_legalitas) return [];
  return profile.value.dokumen_legalitas.filter((doc) => hasValue(doc.file_url));
});

function openPreview(title: string, url?: string) {
  if (!url) {
    toast.warning('Berkas dokumen belum tersedia untuk dipratinjau.', 'Dokumen Belum Diunggah');
    return;
  }
  previewDoc.value = {
    dataUrl: url,
    mimeType: 'application/pdf',
    title,
  };
  showPreview.value = true;
}

function formatDate(val?: string): string {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return val;
  }
}

async function fetchProfile(silent: boolean = false) {
  if (silent) {
    isRefreshing.value = true;
  } else {
    isLoading.value = true;
  }
  errorMessage.value = null;

  try {
    const authStore = useAuthStore();
    const kId =
      authStore.user?.kelembagaan_id ||
      authStore.user?.kelembagaanId;
    const res = await kelembagaanService.getProfile(kId ? Number(kId) : undefined);
    if (res && res.data) {
      profile.value = res.data;
    } else {
      errorMessage.value = 'Gagal memuat profil kelembagaan.';
    }
  } catch (err: any) {
    console.error('Error fetching profile kelembagaan:', err);
    errorMessage.value = err?.message || 'Terjadi kesalahan saat memuat profil.';
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
}

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header Navigation & Title -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-semibold text-slate-900 dark:text-white font-apple-display-lg mt-0.5">Profile Kelembagaan Pekebun</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-apple-caption">Manajemen informasi legalitas, data pengurus, dan berkas kelembagaan pemohon bantuan Sarpras.</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Read-only Verified Badge from IAM (US1) -->
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-[#066C2A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
          <ShieldCheck class="w-4 h-4 text-[#066C2A]" />
          Terverifikasi via BPDP IAM
        </span>

        <Button
          variant="outline"
          size="sm"
          @click="fetchProfile(true)"
          :disabled="isLoading || isRefreshing"
          title="Muat ulang data profil"
        >
          <RefreshCw :class="['w-4 h-4 mr-1.5', isRefreshing ? 'animate-spin' : '']" />
          {{ isRefreshing ? 'Memuat...' : 'Muat Ulang' }}
        </Button>
      </div>
    </header>

    <!-- SYNC_PENDING State Banner (US4) -->
    <div
      v-if="isSyncPending"
      class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
    >
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5">
          <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Sinkronisasi Profil Sedang Berlangsung
          </h3>
          <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            {{ profile?.message || 'Data profil kelembagaan Anda sedang disinkronkan dari akun BPDP IAM. Silakan periksa kembali beberapa saat lagi.' }}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="fetchProfile(false)"
        :disabled="isLoading || isRefreshing"
        class="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 shrink-0"
      >
        <RefreshCw :class="['w-3.5 h-3.5 mr-1.5', isLoading ? 'animate-spin' : '']" />
        Periksa Status
      </Button>
    </div>

    <!-- Error State Banner -->
    <div
      v-else-if="errorMessage"
      class="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
    >
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5">
          <h3 class="text-sm font-semibold text-rose-900 dark:text-rose-200">
            Gagal Memuat Profil
          </h3>
          <p class="text-xs text-rose-700 dark:text-rose-400">
            {{ errorMessage }}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="fetchProfile(false)"
        :disabled="isLoading"
        class="border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 shrink-0"
      >
        <RefreshCw class="w-3.5 h-3.5 mr-1.5" />
        Coba Lagi
      </Button>
    </div>

    <!-- Loading Skeleton (US4) -->
    <div v-if="isLoading && !profile" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="flex flex-col gap-5">
        <div class="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col items-center gap-4">
          <Skeleton height="5rem" width="5rem" custom-class="rounded-2xl" />
          <Skeleton height="1.25rem" width="70%" />
          <Skeleton height="0.875rem" width="45%" />
          <div class="w-full border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-2">
            <Skeleton height="1rem" width="100%" />
            <Skeleton height="1rem" width="100%" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <Skeleton height="5.5rem" custom-class="rounded-xl" />
          <Skeleton height="5.5rem" custom-class="rounded-xl" />
        </div>
      </div>

      <div class="lg:col-span-2 flex flex-col gap-5">
        <Card title="Identitas Kelembagaan" subtitle="Memuat data identitas...">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height="2.5rem" custom-class="rounded-xl" />
            <Skeleton height="2.5rem" custom-class="rounded-xl" />
            <Skeleton height="2.5rem" custom-class="rounded-xl" />
            <Skeleton height="2.5rem" custom-class="rounded-xl" />
          </div>
        </Card>
      </div>
    </div>

    <!-- Main Content Layout (When Loaded) -->
    <div v-else-if="profile" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Left Column: Summary Card & KPIs -->
      <div class="flex flex-col gap-5">
        <!-- Institution Highlight Card -->
        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center gap-4">
          <div class="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#066C2A] dark:text-emerald-400 shadow-inner">
            <Building2 class="w-10 h-10" />
          </div>

          <div class="flex flex-col items-center gap-1">
            <h2 class="text-base font-bold text-slate-900 dark:text-white font-apple-display-lg">
              {{ profile.nama_lembaga || 'Nama Lembaga Belum Terisi' }}
            </h2>
            <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-apple-caption">
              <Building class="w-3.5 h-3.5" /> {{ profile.jenis_lembaga || 'Koperasi Pekebun' }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-md flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5 text-[#066C2A]" /> {{ profile.status_akun || 'Terverifikasi' }}
            </span>
          </div>

          <div v-if="hasValue(profile.kabupaten) || hasValue(profile.provinsi) || hasValue(profile.nomor_akta) || hasValue(profile.npwp)" class="w-full border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-2 text-left">
            <div v-if="hasValue(profile.kabupaten) || hasValue(profile.provinsi)" class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">Wilayah</span>
              <span class="font-semibold text-right truncate max-w-[180px]">
                {{ [profile.kabupaten, profile.provinsi].filter(Boolean).join(', ') }}
              </span>
            </div>
            <div v-if="hasValue(profile.nomor_akta)" class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">Nomor Akta</span>
              <span class="font-semibold truncate max-w-[170px]" :title="profile.nomor_akta">
                {{ profile.nomor_akta }}
              </span>
            </div>
            <div v-if="hasValue(profile.npwp)" class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">NPWP</span>
              <span class="font-semibold truncate max-w-[170px]" :title="profile.npwp">
                {{ profile.npwp }}
              </span>
            </div>
          </div>
        </div>

        <!-- Metric KPI Cards (US2: Aggregated pekebuns & luas lahan) -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 flex flex-col gap-1 shadow-xs">
            <div class="flex items-center gap-2 text-slate-400">
              <Users class="w-4 h-4 text-emerald-600" />
              <span class="text-[11px] font-medium uppercase tracking-wider">Anggota</span>
            </div>
            <p class="text-lg font-bold text-slate-900 dark:text-white font-apple-display-lg mt-1">
              {{ (profile.metrik?.jumlah_anggota ?? 0).toLocaleString('id-ID') }}
              <span class="text-xs font-normal text-slate-500">Pekebun</span>
            </p>
          </div>

          <div class="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 flex flex-col gap-1 shadow-xs">
            <div class="flex items-center gap-2 text-slate-400">
              <MapPin class="w-4 h-4 text-blue-600" />
              <span class="text-[11px] font-medium uppercase tracking-wider">Total Lahan</span>
            </div>
            <p class="text-lg font-bold text-slate-900 dark:text-white font-apple-display-lg mt-1">
              {{ (profile.metrik?.total_lahan_ha ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 2 }) }}
              <span class="text-xs font-normal text-slate-500">Ha</span>
            </p>
          </div>
        </div>

        <!-- Operator / Petugas Input Card (US1) -->
        <div v-if="operatorInfo && hasValue(operatorInfo.name)" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-[#066C2A] dark:text-emerald-400 shrink-0">
              <UserCheck class="w-4 h-4" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Petugas Input / Operator</span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate" :title="operatorInfo.name">
                {{ operatorInfo.name }}
              </h3>
            </div>
          </div>
          <div v-if="hasValue(operatorInfo.email) || hasValue(operatorInfo.phone)" class="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div v-if="hasValue(operatorInfo.email)" class="flex items-center justify-between gap-2">
              <span class="text-slate-400">Email Akun</span>
              <span class="font-medium truncate max-w-[180px]" :title="operatorInfo.email">{{ operatorInfo.email }}</span>
            </div>
            <div v-if="hasValue(operatorInfo.phone)" class="flex items-center justify-between gap-2">
              <span class="text-slate-400">No. Kontak</span>
              <span class="font-medium truncate">{{ operatorInfo.phone }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Details & Read-Only Display -->
      <div class="lg:col-span-2 flex flex-col gap-5">
        <!-- Section 1: Data Identitas & Legalitas -->
        <Card title="Identitas Kelembagaan" subtitle="Informasi pendaftaran resmi dan legalitas kelembagaan">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              v-if="hasValue(profile.nama_lembaga)"
              id="namaLembaga"
              label="Nama Kelembagaan / Koperasi"
              :model-value="profile.nama_lembaga"
              disabled
            />

            <!-- Jenis Kelembagaan (Read-Only) -->
            <div v-if="hasValue(profile.jenis_lembaga)" class="w-full flex flex-col gap-1.5">
              <label class="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 font-apple-caption">Jenis Kelembagaan</label>
              <input
                :value="profile.jenis_lembaga"
                disabled
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs md:text-sm cursor-not-allowed"
              />
            </div>

            <Input
              v-if="hasValue(profile.nomor_akta)"
              id="nomorAkta"
              label="Nomor Akta Pendirian / SK Kemenkumham"
              :model-value="profile.nomor_akta"
              disabled
            />

            <Input
              v-if="hasValue(profile.npwp)"
              id="npwp"
              label="NPWP Lembaga"
              :model-value="profile.npwp"
              disabled
            />

            <Input
              v-if="hasValue(profile.tanggal_berdiri)"
              id="tanggalBerdiri"
              label="Tanggal Berdiri / Terbit Legalitas"
              :model-value="formatDate(profile.tanggal_berdiri)"
              disabled
            />

            <Input
              v-if="hasValue(profile.kabupaten) || hasValue(profile.provinsi)"
              id="wilayahLembaga"
              label="Wilayah Operasional"
              :model-value="[profile.kabupaten, profile.provinsi].filter(Boolean).join(', ')"
              disabled
            />
          </div>
        </Card>

        <!-- Section 2: Data Pengurus & Sekretariat -->
        <Card title="Pengurus & Sekretariat" subtitle="Kontak penanggung jawab utama dan lokasi kantor">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              v-if="hasValue(profile.ketua_nama)"
              id="ketuaNama"
              label="Nama Ketua Lembaga"
              :model-value="profile.ketua_nama"
              disabled
            />

            <Input
              v-if="hasValue(profile.ketua_nik)"
              id="ketuaNik"
              label="NIK Ketua Lembaga"
              :model-value="profile.ketua_nik"
              disabled
            />

            <Input
              v-if="operatorInfo && hasValue(operatorInfo.name)"
              id="petugasInput"
              label="Petugas Input / Operator"
              :model-value="operatorInfo.name"
              disabled
            />

            <Input
              v-if="hasValue(profile.telepon)"
              id="telepon"
              label="Nomor Telepon / WA"
              :model-value="profile.telepon"
              disabled
            />

            <Input
              v-if="hasValue(profile.email)"
              id="email"
              label="Email Resmi Kelembagaan"
              :model-value="profile.email"
              disabled
            />

            <Input
              v-if="hasValue(profile.alamat_lengkap)"
              id="alamatLengkap"
              label="Alamat Sekretariat"
              :model-value="profile.alamat_lengkap"
              disabled
              custom-class="md:col-span-2"
            />
          </div>
        </Card>

        <!-- Section 3: Rekening Bank Kelembagaan (Only shown if at least 1 bank field exists) -->
        <Card
          v-if="hasBankData"
          title="Rekening Bank Kelembagaan"
          subtitle="Rekening penampungan resmi pencairan dana Sarpras"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              v-if="hasValue(profile.bank_nama)"
              id="bankNama"
              label="Nama Bank"
              :model-value="profile.bank_nama"
              disabled
            />

            <Input
              v-if="hasValue(profile.bank_rekening)"
              id="bankRekening"
              label="Nomor Rekening"
              :model-value="profile.bank_rekening"
              disabled
            />

            <Input
              v-if="hasValue(profile.bank_atas_nama)"
              id="bankAtasNama"
              label="Atas Nama Rekening"
              :model-value="profile.bank_atas_nama"
              disabled
            />
          </div>
        </Card>

        <!-- Section 4: Berkas & Dokumen Pendukung (US3: Pratinjau Dokumen Legalitas) -->
        <Card
          v-if="validDokumenLegalitas.length > 0"
          title="Dokumen Legalitas Terunggah"
          subtitle="Berkas administrasi pendukung pengusulan bantuan"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(doc, idx) in validDokumenLegalitas"
              :key="doc.id || idx"
              class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-[#066C2A] flex items-center justify-center shrink-0">
                  <FileText class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" :title="doc.title">
                    {{ doc.title }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    {{ doc.status }} <template v-if="doc.file_name">• PDF</template>
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <button
                  v-if="doc.file_url"
                  type="button"
                  @click="openPreview(doc.title, doc.file_url)"
                  class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="Pratinjau Berkas"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Document Preview Modal -->
    <DocumentPreviewModal
      :is-open="showPreview && !!previewDoc"
      :title="previewDoc?.title || ''"
      :data-url="previewDoc?.dataUrl || ''"
      mime-type="application/pdf"
      @close="showPreview = false"
    />
  </div>
</template>
