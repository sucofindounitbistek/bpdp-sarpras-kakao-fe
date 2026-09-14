import { z } from 'zod';
import { JenisSarpras } from '@/types/pengusulan';
import { parseCoordinatePolygon, validateCoordinatePolygon } from '@/lib/coordinatePolygon';

export const profilLembagaSchema = z.object({
  namaLembaga: z.string().min(3, 'Nama lembaga minimal 3 karakter'),
  jenisLembaga: z.enum(['KOPERASI', 'POKTAN', 'GAPOKTAN']),
  nomorAkta: z.string().min(5, 'Nomor akta wajib diisi'),
  nikKetua: z.string().length(16, 'NIK Ketua harus 16 digit angka'),
  namaKetua: z.string().min(3, 'Nama ketua minimal 3 karakter'),
  telepon: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  alamatLengkap: z.string().min(10, 'Alamat lengkap wajib diisi'),
  kabupatenKode: z.string().min(1, 'Kabupaten wajib dipilih'),
  provinsiKode: z.string().min(1, 'Provinsi wajib dipilih'),
  namaBank: z.string().min(2, 'Nama bank wajib diisi'),
  nomorRekening: z.string().min(5, 'Nomor rekening wajib diisi'),
  namaPemilikRekening: z.string().min(3, 'Nama pemilik rekening wajib diisi'),
});

export const cpclSchema = z
  .object({
    namaPekebun: z.string().min(3, 'Nama pekebun minimal 3 karakter'),
    nik: z.string().length(16, 'NIK harus 16 digit angka'),
    nomorKK: z.string().length(16, 'Nomor KK harus 16 digit angka'),
    luasLahanHektar: z.number().positive('Luas lahan harus lebih dari 0'),
    jenisHakLahan: z.enum(['SHM', 'SKT', 'STDB']),
    nomorSuratLahan: z.string().min(3, 'Nomor surat lahan wajib diisi'),
    koordinatPoligon: z.string().min(3, 'Koordinat poligon lahan wajib diisi'),
  })
  .superRefine((value, ctx) => {
    const polygon = validateCoordinatePolygon(parseCoordinatePolygon(value.koordinatPoligon));
    if (!polygon.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['koordinatPoligon'],
        message: polygon.validationMessages[0] || 'Koordinat poligon lahan tidak valid',
      });
    }
  });

export const paketSarprasSchema = z.object({
  jenisSarpras: z.nativeEnum(JenisSarpras),
  detailUsulan: z.string().min(10, 'Detail usulan minimal 10 karakter'),
  totalAnggaranPengajuan: z.number().positive('Total anggaran harus lebih dari 0'),
});

export type ProfilLembagaInput = z.infer<typeof profilLembagaSchema>;
export type CPCLInput = z.infer<typeof cpclSchema>;
export type PaketSarprasInput = z.infer<typeof paketSarprasSchema>;
