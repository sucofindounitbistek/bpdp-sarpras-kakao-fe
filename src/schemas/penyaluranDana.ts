// Zod schemas: Modul Penyaluran & Pencairan Dana (validasi runtime form)
import { z } from 'zod';
import { DIVISI_PEKERJAAN } from '@/types/penyaluranDana';

export const divisiItemSchema = z.object({
  divisiId: z.enum(DIVISI_PEKERJAAN as [string, ...string[]]),
  nilaiPermohonan: z
    .number({ invalid_type_error: 'Nilai permohonan harus berupa angka' })
    .int('Nilai permohonan harus bilangan bulat rupiah')
    .positive('Nilai permohonan harus lebih dari 0'),
});

export const rekeningTujuanSchema = z.object({
  namaRekening: z.string().min(3, 'Nama rekening minimal 3 karakter'),
  nomorRekening: z.string().regex(/^\d{10,16}$/, 'Nomor rekening 10–16 digit angka'),
  bankTujuan: z.string().min(1, 'Pilih bank tujuan'),
  skema: z.enum(['ONLINE_EKSTERNAL', 'SKN_EKSTERNAL']),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
  kota: z.string().min(2, 'Kota minimal 2 karakter'),
  kodepos: z.string().regex(/^\d{5}$/, 'Kode pos 5 digit'),
  email: z.string().email('Format email tidak valid'),
});

export const wizardPermohonanSchema = z
  .object({
    proposalId: z.string().min(1, 'Pilih nomor proposal (SK Dirut Terbit)'),
    jenisPembelian: z.enum(['PEMBELIAN', 'REIMBURSEMENT', 'UMK']),
    peruntukan: z.enum(['BENEFICIER', 'OPERASIONAL_KP']),
    divisiItems: z.array(divisiItemSchema).min(1, 'Pilih minimal satu divisi pekerjaan'),
    rekeningTujuan: rekeningTujuanSchema,
    sisaSaldo: z.number(),
  })
  .superRefine((val, ctx) => {
    const total = val.divisiItems.reduce((s, d) => s + d.nilaiPermohonan, 0);
    if (total > val.sisaSaldo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['divisiItems'],
        message: `Total nilai divisi (Rp ${total.toLocaleString('id-ID')}) melebihi sisa saldo permohonan (Rp ${val.sisaSaldo.toLocaleString('id-ID')})`,
      });
    }
    const dup = val.divisiItems.map((d) => d.divisiId).filter((id, i, arr) => arr.indexOf(id) !== i);
    if (dup.length > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['divisiItems'], message: 'Terdapat divisi yang dipilih lebih dari sekali' });
    }
  });

export type WizardPermohonanInput = z.infer<typeof wizardPermohonanSchema>;

export const komparisiA3Schema = z.object({
  noPks: z.string().min(1, 'Nomor PKS Bank wajib diisi'),
  narasiBadanHukum: z.string().min(10, 'Narasi badan hukum minimal 10 karakter'),
  noRekeningKp: z.string().regex(/^\d{10,16}$/, 'Nomor rekening KP 10–16 digit angka'),
});

export const komparisiA2Schema = z.object({
  noPks: z.string().min(1, 'Nomor PKS BPDP wajib diisi'),
  narasiBadanHukum: z.string().min(10, 'Narasi badan hukum minimal 10 karakter'),
});

export const komparisiA1Schema = z.object({
  noPks: z.string().min(1, 'Nomor PKS KP wajib diisi'),
  penunjukkanKetua: z.string().min(3, 'Nama dokumen penunjukkan Ketua KP wajib diisi'),
});

export const jadwalTtdSchema = z.object({
  jadwalTtd: z.string().min(1, 'Jadwal tanda tangan wajib dipilih'),
});

export const nominalPenyaluranSchema = z
  .object({
    nominal: z.number({ invalid_type_error: 'Nominal harus berupa angka' }).int().positive('Nominal harus lebih dari 0'),
    totalPermohonan: z.number(),
    persen: z.number(),
  })
  .superRefine((val, ctx) => {
    const deviasi = Math.abs(val.nominal - val.totalPermohonan * val.persen);
    if (deviasi > 1) {
      // Deviasi diizinkan dengan konfirmasi eksplisit — flag via field deviasi (bukan blokir)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nominal'],
        message: `Nominal menyimpang ${((deviasi / val.totalPermohonan) * 100).toFixed(2)}% dari ${val.persen * 100}% baku — konfirmasi ulang untuk melanjutkan`,
      });
    }
  });

export const laporanMonitoringSchema = z
  .object({
    tahap: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    progress: z.number({ invalid_type_error: 'Progres harus angka' }).min(0).max(100),
  })
  .superRefine((val, ctx) => {
    if (val.tahap === 2 && val.progress < 70) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['progress'], message: 'Tahap 2 mensyaratkan progres ≥ 70%' });
    }
    if (val.tahap === 3 && val.progress < 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['progress'], message: 'Tahap 3 mensyaratkan progres 100%' });
    }
  });

export const catatanVerifikasiSchema = z
  .object({
    hasil: z.enum(['SESUAI', 'TIDAK_SESUAI']),
    catatan: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.hasil === 'TIDAK_SESUAI' && (!val.catatan || val.catatan.trim().length < 5)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['catatan'], message: 'Catatan wajib diisi (min. 5 karakter) saat Tidak Sesuai' });
    }
  });

export const ALLOWED_UPLOAD_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const MAX_UPLOAD_SIZE_MB = 5;

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return 'Format berkas harus PDF, JPG, PNG, atau DOCX';
  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) return `Ukuran berkas maksimal ${MAX_UPLOAD_SIZE_MB} MB`;
  return null;
}
