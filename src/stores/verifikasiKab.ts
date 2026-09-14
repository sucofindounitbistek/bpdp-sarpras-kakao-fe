import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DokumenUpload } from '@/types/pengusulan';

type VerificationStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

interface VerificationItem {
  status: VerificationStatus;
  notes: string;
}

export interface VerifikasiKabSubmission {
  pengajuanId: string;
  verifications: Record<string, VerificationItem>;
  skCpcl: DokumenUpload | null;
  beritaAcaraDokumen: DokumenUpload | null;
  beritaAcaraLapangan: DokumenUpload | null;
  fotoUdaraPerPekebun: Record<string, DokumenUpload>;
  submittedAt: string;
}

export const useVerifikasiKabStore = defineStore(
  'verifikasi-kab',
  () => {
    const submissions = ref<VerifikasiKabSubmission[]>([
      {
        pengajuanId: 'REQ-2026-001',
        verifications: {
          verif_1: { status: 'APPROVED', notes: 'Dokumen lengkap dan sesuai' },
          verif_2: { status: 'PENDING', notes: 'Menunggu verifikasi' },
        },
        skCpcl: {
          persyaratanId: 'sk-cpcl-001',
          namaFile: 'sk_cpcl_001.pdf',
          mimeType: 'application/pdf',
          ukuranBytes: 204800,
          dataUrl: '/templates/spek-teknis.pdf',
          uploadedAt: '2026-07-28T10:00:00Z',
        },
        beritaAcaraDokumen: {
          persyaratanId: 'ba-dokumen-001',
          namaFile: 'ba_verifikasi_dokumen_001.pdf',
          mimeType: 'application/pdf',
          ukuranBytes: 215000,
          dataUrl: '/templates/spek-teknis.pdf',
          uploadedAt: '2026-07-28T10:00:00Z',
        },
        beritaAcaraLapangan: {
          persyaratanId: 'ba-lapangan-001',
          namaFile: 'ba_verifikasi_lapangan_001.pdf',
          mimeType: 'application/pdf',
          ukuranBytes: 235000,
          dataUrl: '/templates/spek-teknis.pdf',
          uploadedAt: '2026-07-28T10:00:00Z',
        },
        fotoUdaraPerPekebun: {},
        submittedAt: '2026-07-28T10:00:00Z',
      },
      {
        pengajuanId: 'REQ-2026-002',
        verifications: {
          verif_1: { status: 'REJECTED', notes: 'File tidak terbaca, harap unggah ulang' },
        },
        skCpcl: null,
        beritaAcaraDokumen: null,
        beritaAcaraLapangan: null,
        fotoUdaraPerPekebun: {},
        submittedAt: '2026-07-29T10:00:00Z',
      },
      {
        pengajuanId: 'REQ-2026-003',
        verifications: {
          verif_1: { status: 'APPROVED', notes: 'Dokumen lengkap' },
          verif_2: { status: 'APPROVED', notes: 'Verifikasi selesai' },
          verif_3: { status: 'PENDING', notes: 'Menunggu dokumen asli' },
        },
        skCpcl: {
          persyaratanId: 'sk-cpcl-003',
          namaFile: 'sk_cpcl_003.pdf',
          mimeType: 'application/pdf',
          ukuranBytes: 180000,
          dataUrl: '#',
          uploadedAt: '2026-07-30T10:00:00Z',
        },
        beritaAcaraDokumen: null,
        beritaAcaraLapangan: null,
        fotoUdaraPerPekebun: {},
        submittedAt: '2026-07-30T10:00:00Z',
      },
    ]);

    function addSubmission(submission: VerifikasiKabSubmission) {
      submissions.value.push(submission);
    }

    function reset() {
      submissions.value = [];
    }

    return {
      submissions,
      addSubmission,
      reset,
    };
  },
  { persist: true },
);
