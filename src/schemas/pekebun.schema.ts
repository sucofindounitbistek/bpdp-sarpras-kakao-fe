import { z } from 'zod';
import { JenisKelamin, JenisLegalitas, StatusPernikahan } from '@/types/pekebun';
import { validateCoordinatePolygon } from '@/lib/coordinatePolygon';

export const identitasPekebunSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit angka'),
  nama: z.string().min(2, 'Nama pekebun minimal 2 karakter'),
  nomorKK: z.string().length(16, 'Nomor KK harus 16 digit'),
  statusPernikahan: z.nativeEnum(StatusPernikahan, { errorMap: () => ({ message: 'Status pernikahan wajib dipilih' }) }),
  tempatLahir: z.string().min(2, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  alamat: z.string().min(10, 'Alamat minimal 10 karakter'),
  kodepos: z.string().length(5, 'Kodepos harus 5 digit'),
  nomorHP: z.string().min(10, 'Nomor handphone minimal 10 digit'),
});

// Extended schema used when registering a new Pekebun: the SIKP /validate-nik
// payload additionally requires jenisKelamin (email/no_hp come from the
// authenticated user in the auth store, not from form fields). Kept separate
// from the base schema so editing already-registered Pekebun (which have no
// gender stored in BE) is not blocked by these fields.
export const identitasPekebunSikpSchema = identitasPekebunSchema.extend({
  jenisKelamin: z.nativeEnum(JenisKelamin, { errorMap: () => ({ message: 'Jenis kelamin wajib dipilih' }) }),
});

export const lahanPekebunSchema = z
  .object({
    jenisLegalitas: z.nativeEnum(JenisLegalitas, { errorMap: () => ({ message: 'Jenis legalitas wajib dipilih' }) }),
    nomorLegalitas: z.string(),
    tanggalPenerbitanLegalitas: z
      .string()
      .min(1, 'Tanggal penerbitan wajib diisi')
      .refine((val) => {
        const year = val.split('-')[0];
        return year && year.length === 4 && /^\d{4}$/.test(year);
      }, 'Tahun penerbitan harus 4 digit angka'),
    luasLahan: z.number({ invalid_type_error: 'Luas lahan harus berupa angka' }).positive('Luas lahan harus lebih dari 0'),
    provinsiKode: z.string().min(1, 'Provinsi wajib dipilih'),
    kabupatenKode: z.string().min(1, 'Kabupaten wajib dipilih'),
    kecamatanKode: z.string().min(1, 'Kecamatan wajib dipilih'),
    desaKode: z.string().min(1, 'Desa wajib dipilih'),
    alamatKebun: z.string().min(5, 'Alamat kebun minimal 5 karakter'),
    tahunTanam: z
      .string()
      .regex(/^\d{4}$/, 'Tahun tanam harus 4 digit angka')
      .transform(Number)
      .pipe(z.number().min(1945, 'Tahun tanam minimal 1945').max(new Date().getFullYear(), `Tahun tanam maksimal ${new Date().getFullYear()}`)),
    jenisBibit: z.string().min(2, 'Jenis bibit minimal 2 karakter'),
    coordinates: z
      .array(
        z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      )
      .min(4, 'Minimal 4 titik koordinat diperlukan'),
  })
  .superRefine((value, ctx) => {
    const nomorLegalitas = value.nomorLegalitas.trim();
    if (value.jenisLegalitas !== JenisLegalitas.NON_SHM && nomorLegalitas.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nomorLegalitas'],
        message: 'Nomor legalitas wajib diisi untuk jenis legalitas ini',
      });
    } else if (nomorLegalitas.length > 0 && nomorLegalitas.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nomorLegalitas'],
        message: 'Nomor legalitas minimal 3 karakter',
      });
    }

    const points = value.coordinates.map((c, i) => ({ order: i + 1, lat: c.lat, lng: c.lng }));
    const polygon = validateCoordinatePolygon(points);
    if (!polygon.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coordinates'],
        message: polygon.validationMessages[0] || 'Koordinat poligon lahan tidak valid',
      });
    }
  });

export type IdentitasPekebunInput = z.infer<typeof identitasPekebunSchema>;
export type LahanPekebunInput = z.infer<typeof lahanPekebunSchema>;

export const lahanPekebunListSchema = z.array(lahanPekebunSchema).min(1, 'Minimal harus mengisi 1 data lahan');
export type LahanPekebunListInput = z.infer<typeof lahanPekebunListSchema>;
