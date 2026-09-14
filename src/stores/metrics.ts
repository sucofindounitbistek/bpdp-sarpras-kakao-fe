import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export interface MetricCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  variant: 'success' | 'warning' | 'info' | 'primary';
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface PipelineStageMetric {
  stageId: string;
  pekebun: number;
  lahan: number;
  proposal: number;
  pengembalian: number;
}

export const useMetricsStore = defineStore('metrics', () => {
  const authStore = useAuthStore();

  const mockMetrics = ref<Record<string, { cards: MetricCard[]; chart: ChartDataPoint[] }>>({
    PEMOHON: {
      cards: [
        { label: 'Total Pekebun Terdaftar', value: '142 Orang', change: '+8 bulan ini', changeType: 'positive', variant: 'primary' },
        { label: 'Total Luas Lahan', value: '348.5 Ha', change: '+24 Ha baru', changeType: 'positive', variant: 'info' },
        { label: 'Usulan Aktif', value: '3 Proposal', change: '1 Butuh Revisi', changeType: 'warning', variant: 'warning' },
        // { label: 'Dana Disetujui', value: 'Rp 450 Jt', change: '100% tersalurkan', changeType: 'positive', variant: 'success' },
      ],
      chart: [
        { label: 'Jan', value: 120 },
        { label: 'Feb', value: 150 },
        { label: 'Mar', value: 180 },
        { label: 'Apr', value: 240 },
        { label: 'Mei', value: 300 },
        { label: 'Jun', value: 348 },
      ],
    },
    DINAS_KAB: {
      cards: [
        { label: 'Menunggu Verifikasi Kab', value: '12 Usulan', change: '8 baru masuk', changeType: 'warning', variant: 'warning' },
        { label: 'Usulan Disetujui Kab', value: '45 Usulan', change: '+12% vs bln lalu', changeType: 'positive', variant: 'success' },
        { label: 'Lahan Terverifikasi', value: '1,420 Ha', change: '92% dari target', changeType: 'positive', variant: 'info' },
        { label: 'Usulan Ditolak/Revisi', value: '3 Usulan', change: 'Perbaikan berkas', changeType: 'neutral', variant: 'primary' },
      ],
      chart: [
        { label: 'Jan', value: 8 },
        { label: 'Feb', value: 15 },
        { label: 'Mar', value: 22 },
        { label: 'Apr', value: 31 },
        { label: 'Mei', value: 40 },
        { label: 'Jun', value: 45 },
      ],
    },
    DINAS_PROV: {
      cards: [
        { label: 'Menunggu Verifikasi Prov', value: '8 Usulan', change: '3 mendesak', changeType: 'warning', variant: 'warning' },
        { label: 'Usulan Disetujui Prov', value: '38 Usulan', change: '+8% vs bln lalu', changeType: 'positive', variant: 'success' },
        { label: 'Lahan Tervalidasi', value: '2,890 Ha', change: '88% dari kuota', changeType: 'positive', variant: 'info' },
        { label: 'Usulan Dikembalikan', value: '2 Usulan', change: 'Kembali ke Kab', changeType: 'neutral', variant: 'primary' },
      ],
      chart: [
        { label: 'Jan', value: 5 },
        { label: 'Feb', value: 11 },
        { label: 'Mar', value: 19 },
        { label: 'Apr', value: 27 },
        { label: 'Mei', value: 34 },
        { label: 'Jun', value: 38 },
      ],
    },
    DITJENBUN_VERIFIKATOR: {
      cards: [
        { label: 'Rekomtek Diterbitkan', value: '64 Rekomtek', changeType: 'positive', variant: 'success' },
        { label: 'Total Luas Rekomtek', value: '8,450 Ha',  changeType: 'positive', variant: 'info' },
        { label: 'Usulan dalam Sidang Pleno', value: '15 Usulan',  changeType: 'neutral', variant: 'warning' },
        { label: 'Total Anggaran Rekomtek', value: 'Rp 24.5 M', changeType: 'neutral', variant: 'primary' },
      ],
      chart: [
        { label: 'Jan', value: 20 },
        { label: 'Feb', value: 32 },
        { label: 'Mar', value: 45 },
        { label: 'Apr', value: 52 },
        { label: 'Mei', value: 59 },
        { label: 'Jun', value: 64 },
      ],
    },
    BPDP_VERIFIKATOR: {
      cards: [
        { label: 'Total Dana Penyaluran', value: 'Rp 18.2 M', change: '92% dari pagu', changeType: 'positive', variant: 'success' },
        { label: 'Lembaga Penerima', value: '48 Koperasi', change: '+4 baru terverifikasi', changeType: 'positive', variant: 'info' },
        { label: 'BAST & LPJ Terverifikasi', value: '32 Berkas', change: '12 proses review', changeType: 'neutral', variant: 'warning' },
        { label: 'Total Akun Pengguna', value: '249 User', change: '+12 minggu ini', changeType: 'positive', variant: 'primary' },
      ],
      chart: [
        { label: 'Jan', value: 8 },
        { label: 'Feb', value: 16 },
        { label: 'Mar', value: 24 },
        { label: 'Apr', value: 35 },
        { label: 'Mei', value: 42 },
        { label: 'Jun', value: 48 },
      ],
    },
  });

  const mockPipelineData = ref<Record<string, PipelineStageMetric[]>>({
    DINAS_KAB: [
      { stageId: '1', pekebun: 142, lahan: 348.5, proposal: 3, pengembalian: 0 },
      { stageId: '2', pekebun: 12, lahan: 45.0, proposal: 8, pengembalian: 3 },
      { stageId: '3', pekebun: 45, lahan: 1420.0, proposal: 45, pengembalian: 1 },
      { stageId: '4', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '5', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '6', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '7', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '8', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '9', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '10', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
    ],
    DINAS_PROV: [
      { stageId: '1', pekebun: 142, lahan: 348.5, proposal: 3, pengembalian: 0 },
      { stageId: '2', pekebun: 45, lahan: 1420.0, proposal: 45, pengembalian: 2 },
      { stageId: '3', pekebun: 38, lahan: 2890.0, proposal: 38, pengembalian: 0 },
      { stageId: '4', pekebun: 8, lahan: 215.0, proposal: 8, pengembalian: 1 },
      { stageId: '5', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '6', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '7', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '8', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '9', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '10', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
    ],
    DITJENBUN_VERIFIKATOR: [
      { stageId: '1', pekebun: 312, lahan: 1250.0, proposal: 14, pengembalian: 0 },
      { stageId: '2', pekebun: 280, lahan: 1100.0, proposal: 12, pengembalian: 0 },
      { stageId: '3', pekebun: 240, lahan: 950.0, proposal: 10, pengembalian: 0 },
      { stageId: '4', pekebun: 200, lahan: 820.0, proposal: 9, pengembalian: 0 },
      { stageId: '5', pekebun: 15, lahan: 115.0, proposal: 3, pengembalian: 1 },
      { stageId: '6', pekebun: 64, lahan: 8450.0, proposal: 64, pengembalian: 2 },
      { stageId: '7', pekebun: 8, lahan: 450.0, proposal: 8, pengembalian: 1 },
      { stageId: '8', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '9', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
      { stageId: '10', pekebun: 0, lahan: 0.0, proposal: 0, pengembalian: 0 },
    ],
    BPDP_VERIFIKATOR: [
      { stageId: '1', pekebun: 620, lahan: 14500.0, proposal: 112, pengembalian: 0 },
      { stageId: '2', pekebun: 580, lahan: 13200.0, proposal: 98, pengembalian: 0 },
      { stageId: '3', pekebun: 510, lahan: 11800.0, proposal: 85, pengembalian: 0 },
      { stageId: '4', pekebun: 470, lahan: 10500.0, proposal: 78, pengembalian: 0 },
      { stageId: '5', pekebun: 420, lahan: 9800.0, proposal: 70, pengembalian: 0 },
      { stageId: '6', pekebun: 380, lahan: 9100.0, proposal: 64, pengembalian: 2 },
      { stageId: '7', pekebun: 350, lahan: 8800.0, proposal: 60, pengembalian: 1 },
      { stageId: '8', pekebun: 12, lahan: 420.0, proposal: 4, pengembalian: 2 },
      { stageId: '9', pekebun: 8, lahan: 310.0, proposal: 3, pengembalian: 1 },
      { stageId: '10', pekebun: 32, lahan: 2450.0, proposal: 8, pengembalian: 1 },
    ],
  });

  const activeMetrics = computed(() => {
    const role = authStore.user?.role || 'KELEMBAGAAN_PEKEBUN';
    return mockMetrics.value[role] || (role === 'KELEMBAGAAN_PEKEBUN' ? mockMetrics.value.PEMOHON : undefined) || mockMetrics.value.DITJENBUN_VERIFIKATOR || mockMetrics.value.PEMOHON;
  });

  const activePipelineData = computed<PipelineStageMetric[]>(() => {
    const role = authStore.activeRole || 'KELEMBAGAAN_PEKEBUN';
    return mockPipelineData.value[role] || (role === 'KELEMBAGAAN_PEKEBUN' ? mockPipelineData.value.PEMOHON : undefined) || mockPipelineData.value.DITJENBUN_VERIFIKATOR || [];
  });

  return { activeMetrics, activePipelineData };
});
