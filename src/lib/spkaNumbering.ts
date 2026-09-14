import type { JenisSarpras } from '@/types/pengusulan';

/**
 * Pemetaan 9 Jenis Paket Sarpras ke Kode Digit (1-9)
 * 1 Ekstensifikasi (Benih, Pupuk, Pestisida)
 * 2 Intensifikasi (Pupuk dan Pestisida)
 * 3 Alat pascapanen
 * 4 Unit Pengolahan Hasil
 * 5 Jalan kebun dan jalan akses ke jalan umum dan/atau ke pelabuhan
 * 6 Alat transportasi
 * 7 Mesin pertanian
 * 8 Infrastruktur pasar
 * 9 Verifikasi atau penelusuran teknis
 */
export function getKodePaketSarpras(paket?: JenisSarpras | string | null, customCode?: string | null): string {
  if (customCode && customCode.trim()) {
    return customCode.trim();
  }
  if (!paket) return '1';

  const normalized = paket.toUpperCase().trim();

  switch (normalized) {
    case 'EKSTENSIFIKASI':
    case 'BENIH_PUPUK':
    case '1':
      return '1';

    case 'INTENSIFIKASI':
    case '2':
      return '2';

    case 'ALAT_PASCAPANEN':
    case 'PASCAPANEN':
    case '3':
      return '3';

    case 'UPH_1_JENIS':
    case '4':
      return '4';

    case 'UPH_MULTI_JENIS':
    case '5':
      return '5';

    case 'UPH':
    case 'UPH_KAKAO':
    case '6':
      return '6';

    case 'JALAN_PERKEBUNAN':
    case 'JALAN_KEBUN':
    case '7':
      return '7';

    case 'ALAT_ANGKUT_LANGSIR':
    case '8':
      return '8';

    case 'GEROBAK_BERMOTOR':
    case '9':
      return '9';

    case 'PIKAP':
    case '10':
      return '10';

    case 'TRUK':
    case 'TRANSPORTASI':
    case '11':
      return '11';

    case 'ALSINTAN':
    case 'MESIN_PERTANIAN':
    case '12':
      return '12';

    case 'DRAINASE':
    case 'PASAR':
    case 'INFRASTRUKTUR_PASAR':
    case '13':
      return '13';

    case 'VERIFIKASI_TEKNIS':
    case 'PENELUSURAN_TEKNIS':
    case 'VERIFIKASI':
    case '14':
      return '14';

    default:
      return '1';
  }
}

export interface GenerateSpkaOptions {
  bantuanTypeOrPackage?: JenisSarpras | string | null;
  date?: Date | string;
  sequenceNumber?: number;
}

export interface GenerateSpkaResult {
  nomorUsulan: string;
  kodePaket: string;
  bulan: string;
  tahun: string;
  sequenceNumber: number;
  formattedWithSeparator: string;
}

/**
 * Generasi Nomor SPKA dengan rumus:
 * SPKA + KodePaket(1-9) + Bulan(MM) + Tahun(YY) + Sequence(0001-9999)
 * Contoh: SPKA106260001
 */
export function generateSpkaNomor(options: GenerateSpkaOptions = {}): GenerateSpkaResult {
  const kodePaket = getKodePaketSarpras(options.bantuanTypeOrPackage);
  
  const targetDate = options.date ? new Date(options.date) : new Date();
  const validDate = isNaN(targetDate.getTime()) ? new Date() : targetDate;

  const monthNum = validDate.getMonth() + 1;
  const bulan = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;

  const yearFull = validDate.getFullYear();
  const tahun = String(yearFull).slice(-2);

  const seq = Math.max(1, Math.floor(options.sequenceNumber || 1));
  const sequenceStr = String(seq).padStart(4, '0');

  const nomorUsulan = `SPKA${kodePaket}${bulan}${tahun}${sequenceStr}`;
  const formattedWithSeparator = `SPKA-${kodePaket}-${bulan}-${tahun}-${sequenceStr}`;

  return {
    nomorUsulan,
    kodePaket,
    bulan,
    tahun,
    sequenceNumber: seq,
    formattedWithSeparator,
  };
}

/**
 * Valider / Parser nomor SPKA untuk verifikasi pengujian bulanan
 */
export function parseSpkaNomor(nomor: string) {
  const clean = nomor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (!clean.startsWith('SPKA') || clean.length < 13) {
    return null;
  }
  return {
    prefix: 'SPKA',
    kodePaket: clean.charAt(4),
    bulan: clean.substring(5, 7),
    tahun: clean.substring(7, 9),
    sequenceNumber: parseInt(clean.substring(9, 13), 10) || 1,
  };
}
