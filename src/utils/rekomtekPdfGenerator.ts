/**
 * Utility Generator Dokumen Rekomendasi Teknis (Rekomtek) Ditjenbun 1:1 Presisi
 * Membentuk layout HTML/CSS cetak A4 3 halaman resmi Kementerian Pertanian
 * dan menangani trigger cetak/unduh PDF instan.
 */

export interface RekomtekItemRAB {
  no: number;
  namaBarang: string;
  satuan: string;
  volume: number;
  hargaSatuan: number;
  totalHarga: number;
  keterangan?: string;
}

export interface RekomtekDocumentData {
  // Metadata Surat
  nomorSurat?: string;
  sifat?: string;
  lampiran?: string;
  hal?: string;
  tanggalSurat?: string;

  // Tujuan
  tujuanPenerima?: string;
  tempatTujuan?: string;

  // Rujukan Surat Masuk (Dinas Provinsi)
  suratProvinsi?: {
    nomor: string;
    tanggal: string;
    perihal: string;
  };

  // 8 Butir Rekomendasi Teknis
  kelembagaan: {
    namaLembaga: string;
    badanHukum?: string;
    alamatLembaga: string;
    luasArealHa: number;
    jumlahPekebun: number;
    lokasiKebun: string;
  };

  // Butir 7: Paket Sarpras & Nilai Anggaran
  paketSarpras: {
    namaPaket: string;
    jenisBantuan: string; // "UANG" | "BARANG" | "Barang" | "Uang"
    totalNilaiRp: number;
    terbilangRp?: string;
  };

  // Butir 8: Rincian Bantuan Item RAB
  itemsRAB: RekomtekItemRAB[];

  // Penandatangan Ditjenbun
  pejabatDitjenbun?: {
    jabatan: string;
    nama: string;
    nip: string;
    isDraft?: boolean;
  };

  // Tembusan
  tembusan?: string[];

  // Lampiran Halaman 3
  skCpclKabupaten?: {
    nomorSk: string;
    tanggalSk: string;
    pejabatPenerbit: string;
  };
  beritaAcaraVerifikasi?: {
    nomorBa: string;
    tanggalBa: string;
  };
}

/**
 * Konversi angka ke kalimat Terbilang Rupiah resmi Bahasa Indonesia
 */
export function terbilangRupiah(bilangan: number): string {
  const angka = Math.floor(Math.abs(bilangan));
  const huruf = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function convert(n: number): string {
    if (n < 12) {
      return huruf[n];
    } else if (n < 20) {
      return convert(n - 10) + ' Belas';
    } else if (n < 100) {
      const sisa = n % 10;
      return convert(Math.floor(n / 10)) + ' Puluh' + (sisa > 0 ? ' ' + convert(sisa) : '');
    } else if (n < 200) {
      return 'Seratus' + (n > 100 ? ' ' + convert(n - 100) : '');
    } else if (n < 1000) {
      const sisa = n % 100;
      return convert(Math.floor(n / 100)) + ' Ratus' + (sisa > 0 ? ' ' + convert(sisa) : '');
    } else if (n < 2000) {
      return 'Seribu' + (n > 1000 ? ' ' + convert(n - 1000) : '');
    } else if (n < 1000000) {
      const sisa = n % 1000;
      return convert(Math.floor(n / 1000)) + ' Ribu' + (sisa > 0 ? ' ' + convert(sisa) : '');
    } else if (n < 1000000000) {
      const sisa = n % 1000000;
      return convert(Math.floor(n / 1000000)) + ' Juta' + (sisa > 0 ? ' ' + convert(sisa) : '');
    } else if (n < 1000000000000) {
      const sisa = n % 1000000000;
      return convert(Math.floor(n / 1000000000)) + ' Miliar' + (sisa > 0 ? ' ' + convert(sisa) : '');
    } else {
      const sisa = n % 1000000000000;
      return convert(Math.floor(n / 1000000000000)) + ' Triliun' + (sisa > 0 ? ' ' + convert(sisa) : '');
    }
  }

  if (angka === 0) return 'Nol Rupiah';
  return convert(angka) + ' Rupiah';
}

/**
 * Format angka ke nominal Rupiah
 */
export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Dapatkan fallback nomor draf rekomtek sementara: .../PI.400/E/MM/YYYY
 */
export function getFallbackNomorRekomtek(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `.../PI.400/E/${mm}/${yyyy}`;
}

/**
 * Embedded SVG Logo Kementerian Pertanian
 */
const SVG_LOGO_KEMENTAN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="84" height="84" style="display:block; margin:auto;">
  <defs>
    <radialGradient id="kgold" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="60%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#996515"/>
    </radialGradient>
    <radialGradient id="kgreen" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#0A8F3D"/>
      <stop offset="100%" stop-color="#055C26"/>
    </radialGradient>
  </defs>
  <circle cx="80" cy="80" r="76" fill="none" stroke="url(#kgold)" stroke-width="4"/>
  <circle cx="80" cy="80" r="71" fill="none" stroke="url(#kgold)" stroke-width="1.5"/>
  <circle cx="80" cy="80" r="68" fill="url(#kgreen)"/>
  <circle cx="80" cy="80" r="48" fill="none" stroke="url(#kgold)" stroke-width="1.8" stroke-dasharray="3,2"/>
  <g fill="url(#kgold)" stroke="#7A4B00" stroke-width="0.5">
    <path d="M80 32 L83 44 L80 48 L77 44 Z"/>
    <path d="M80 48 L84 60 L80 64 L76 60 Z"/>
    <path d="M80 64 L85 76 L80 80 L75 76 Z"/>
    <path d="M80 80 L80 126" stroke="url(#kgold)" stroke-width="3" stroke-linecap="round"/>
    <path d="M76 45 C64 42 48 50 36 64 C48 64 62 60 74 54 Z"/>
    <path d="M74 56 C58 56 42 66 32 80 C46 78 60 72 73 66 Z"/>
    <path d="M73 68 C56 70 42 82 34 96 C48 92 60 84 72 78 Z"/>
    <path d="M72 80 C58 84 46 96 42 108 C54 102 64 94 72 88 Z"/>
    <path d="M72 90 C62 96 54 106 50 116 C60 110 68 102 73 96 Z"/>
    <path d="M84 45 C96 42 112 50 124 64 C112 64 98 60 86 54 Z"/>
    <path d="M86 56 C102 56 118 66 128 80 C114 78 100 72 87 66 Z"/>
    <path d="M87 68 C104 70 118 82 126 96 C112 92 100 84 88 78 Z"/>
    <path d="M88 80 C102 84 114 96 118 108 C106 102 96 94 88 88 Z"/>
    <path d="M88 90 C98 96 106 106 110 116 C100 110 92 102 87 96 Z"/>
    <polygon points="80,50 83,57 91,58 85,63 87,70 80,66 73,70 75,63 69,58 77,57"/>
    <path d="M46 122 Q80 134 114 122 Q118 128 114 133 Q80 142 46 133 Q42 127 46 122 Z" fill="#FFE066" stroke="#996515"/>
  </g>
</svg>
`;

/**
 * Embedded SVG Logo BSrE (Kecil untuk Footer & TTE)
 */
const SVG_LOGO_BSRE_SMALL = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" width="80" height="24">
  <g transform="translate(4, 2)">
    <path d="M18 2 C28 2 36 6 36 16 C36 28 24 36 18 40 C12 36 0 28 0 16 C0 6 8 2 18 2 Z" fill="#0284C7"/>
    <path d="M18 10 C14 10 12 12 12 15 L12 18 L10 18 C9 18 8 19 8 20 L8 30 C8 31 9 32 10 32 L26 32 C27 32 28 31 28 30 L28 20 C28 19 27 18 26 18 L24 18 L24 15 C24 12 22 10 18 10 Z M18 12 C20 12 22 14 22 15 L22 18 L14 18 L14 15 C14 14 16 12 18 12 Z" fill="#FFFFFF"/>
  </g>
  <text x="46" y="22" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="900" fill="#0F172A">BSrE</text>
  <text x="46" y="34" font-family="Arial, Helvetica, sans-serif" font-size="7" font-weight="700" fill="#0284C7">Balai Sertifikasi Elektronik</text>
</svg>
`;

/**
 * Mockup SVG QR Code BSrE Resmi untuk TTE Kementan
 */
function generateBsreQrSvg(): string {
  return `
  <div style="width: 80px; height: 80px; border: 1.5px solid #066C2A; padding: 3px; background: #ffffff; display: flex; align-items: center; justify-content: center; position: relative;">
    <svg viewBox="0 0 29 29" width="72" height="72">
      <!-- Outer Finder Patterns -->
      <rect x="0" y="0" width="7" height="7" fill="#066C2A"/>
      <rect x="1" y="1" width="5" height="5" fill="#ffffff"/>
      <rect x="2" y="2" width="3" height="3" fill="#066C2A"/>

      <rect x="22" y="0" width="7" height="7" fill="#066C2A"/>
      <rect x="23" y="1" width="5" height="5" fill="#ffffff"/>
      <rect x="24" y="2" width="3" height="3" fill="#066C2A"/>

      <rect x="0" y="22" width="7" height="7" fill="#066C2A"/>
      <rect x="1" y="23" width="5" height="5" fill="#ffffff"/>
      <rect x="2" y="24" width="3" height="3" fill="#066C2A"/>

      <!-- Random QR Data Matrix Bits -->
      <rect x="9" y="1" width="1" height="1" fill="#066C2A"/>
      <rect x="11" y="1" width="1" height="1" fill="#066C2A"/>
      <rect x="14" y="2" width="2" height="1" fill="#066C2A"/>
      <rect x="18" y="1" width="1" height="1" fill="#066C2A"/>
      <rect x="9" y="4" width="2" height="1" fill="#066C2A"/>
      <rect x="13" y="4" width="1" height="1" fill="#066C2A"/>
      <rect x="17" y="4" width="2" height="1" fill="#066C2A"/>
      
      <rect x="2" y="9" width="1" height="2" fill="#066C2A"/>
      <rect x="5" y="10" width="1" height="1" fill="#066C2A"/>
      <rect x="8" y="9" width="2" height="1" fill="#066C2A"/>
      <rect x="11" y="8" width="1" height="2" fill="#066C2A"/>
      <rect x="14" y="9" width="1" height="1" fill="#066C2A"/>
      <rect x="16" y="9" width="2" height="1" fill="#066C2A"/>
      <rect x="20" y="9" width="1" height="2" fill="#066C2A"/>
      <rect x="24" y="10" width="2" height="1" fill="#066C2A"/>

      <rect x="8" y="13" width="1" height="3" fill="#066C2A"/>
      <rect x="11" y="14" width="2" height="1" fill="#066C2A"/>
      <rect x="15" y="13" width="1" height="2" fill="#066C2A"/>
      <rect x="18" y="14" width="2" height="1" fill="#066C2A"/>
      <rect x="22" y="13" width="1" height="2" fill="#066C2A"/>

      <rect x="1" y="15" width="2" height="1" fill="#066C2A"/>
      <rect x="4" y="16" width="1" height="2" fill="#066C2A"/>
      <rect x="9" y="18" width="2" height="1" fill="#066C2A"/>
      <rect x="13" y="17" width="1" height="2" fill="#066C2A"/>
      <rect x="16" y="18" width="2" height="1" fill="#066C2A"/>
      <rect x="20" y="17" width="1" height="1" fill="#066C2A"/>
      <rect x="25" y="18" width="2" height="1" fill="#066C2A"/>

      <rect x="9" y="23" width="1" height="2" fill="#066C2A"/>
      <rect x="12" y="24" width="2" height="1" fill="#066C2A"/>
      <rect x="16" y="23" width="1" height="1" fill="#066C2A"/>
      <rect x="19" y="24" width="2" height="1" fill="#066C2A"/>
      <rect x="23" y="23" width="1" height="2" fill="#066C2A"/>
      <rect x="26" y="25" width="1" height="1" fill="#066C2A"/>

      <!-- Center BSrE Seal Icon -->
      <rect x="11" y="11" width="7" height="7" fill="#ffffff" stroke="#066C2A" stroke-width="0.6"/>
      <path d="M14.5 12.5 C16 12.5 17 13.2 17 14.5 C17 16 15.5 17 14.5 17.5 C13.5 17 12 16 12 14.5 C12 13.2 13 12.5 14.5 12.5 Z" fill="#0284C7"/>
    </svg>
    <div style="position: absolute; bottom: 2px; font-size: 6px; font-weight: bold; color: #066C2A; letter-spacing: 0.5px; background: rgba(255,255,255,0.9); padding: 0 2px;">BSrE</div>
  </div>
  `;
}

/**
 * Generator Markup HTML Dokumen Rekomtek 3 Halaman Presisi 1:1
 */
export function generateRekomtekHtml(data: RekomtekDocumentData): string {
  const nomorSurat = (data.nomorSurat || '').trim() || getFallbackNomorRekomtek();
  const tanggalSurat = data.tanggalSurat || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const sifat = data.sifat || 'Biasa';
  const lampiran = data.lampiran || 'Satu Berkas';
  const hal = data.hal || `Rekomendasi Teknis Sarana dan Prasarana Kegiatan ${data.paketSarpras.namaPaket} ${data.kelembagaan.namaLembaga}`;

  const totalNilai = data.paketSarpras.totalNilaiRp || 0;
  const totalTerbilang = data.paketSarpras.terbilangRp || terbilangRupiah(totalNilai);
  const jenisBantuan = (data.paketSarpras.jenisBantuan || 'Barang').toUpperCase() === 'UANG' ? 'Uang' : 'Barang';

  // Data Rujukan Surat Masuk Dinas Provinsi
  const spNomor = data.suratProvinsi?.nomor || '500.5.4/4804/DISBUN-Bid.1';
  const spTanggal = data.suratProvinsi?.tanggal || '22 Juli 2024';
  const spPerihal = data.suratProvinsi?.perihal || `Usulan Kegiatan Sarana dan Prasarana Perkebunan Kelapa Sawit ${data.kelembagaan.namaLembaga}`;

  // Pejabat Ditjenbun
  const pejabat = data.pejabatDitjenbun || {
    jabatan: 'Plt. Direktur Jenderal Perkebunan',
    nama: 'Heru Tri Widarto, S.Si., M.Sc',
    nip: '197204121999031004',
    isDraft: true,
  };

  // Tembusan
  const tembusanList = data.tembusan && data.tembusan.length > 0 ? data.tembusan : [
    'Menteri Pertanian (sebagai laporan);',
    'Deputi Bidang Koordinasi Pangan dan Agribisnis, Kemenko Perekonomian;',
    'Direktur Jenderal Perbendaharaan, Kementerian Keuangan;',
    'Kepala Dinas yang membidangi Perkebunan Provinsi;',
    'Kepala Dinas yang membidangi Perkebunan Kabupaten;',
    `Ketua ${data.kelembagaan.namaLembaga}.`,
  ];

  // Lampiran SK CPCL & Berita Acara
  const skCpclNomor = data.skCpclKabupaten?.nomorSk || '500.5.4/DISBUN/SK-CPCL/2024/012';
  const skCpclTanggal = data.skCpclKabupaten?.tanggalSk || '15 Juni 2024';
  const skCpclPejabat = data.skCpclKabupaten?.pejabatPenerbit || 'Kepala Dinas Perkebunan Kabupaten';

  const baNomor = data.beritaAcaraVerifikasi?.nomorBa || 'BA-VERIF/DISBUN-PROV/07/2024';
  const baTanggal = data.beritaAcaraVerifikasi?.tanggalBa || '20 Juli 2024';

  // Format Baris Tabel Item RAB Butir 8
  const itemsRABRows = data.itemsRAB.length > 0
    ? data.itemsRAB.map((item, idx) => `
        <tr>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: center;">${idx + 1}.</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px;">${item.namaBarang}</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: center;">${item.satuan}</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: right;">${item.volume.toLocaleString('id-ID')}</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: right;">${formatRupiah(item.hargaSatuan)}</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: right;">${formatRupiah(item.totalHarga)}</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: center;">1.</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px;">${data.paketSarpras.namaPaket}</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: center;">Paket</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: right;">1</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: right;">${formatRupiah(totalNilai)}</td>
          <td style="border: 1px solid #1e293b; padding: 4px 6px; text-align: right;">${formatRupiah(totalNilai)}</td>
        </tr>
      `;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rekomendasi Teknis - ${data.kelembagaan.namaLembaga}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 20mm 15mm 20mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      font-size: 10.5pt;
      line-height: 1.35;
      color: #000000;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .rekomtek-page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 20mm;
      margin: 0 auto;
      background: #ffffff;
      position: relative;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    @media screen {
      body {
        background-color: #cbd5e1;
        padding: 20px 0;
      }
      .rekomtek-page {
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      }
    }
    @media print {
      body {
        background: transparent;
      }
      .rekomtek-page {
        width: 100% !important;
        min-height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
      }
    }
    .page-content {
      flex: 1 0 auto;
    }
    .page-footer {
      flex-shrink: 0;
      margin-top: 15px;
      padding-top: 6px;
      border-top: 0.8px solid #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5pt;
      color: #475569;
    }
    /* Kop Surat */
    .kop-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .kop-logo {
      width: 90px;
      flex-shrink: 0;
      text-align: center;
    }
    .kop-text {
      flex-grow: 1;
      text-align: center;
      padding-right: 35px;
    }
    .kop-text .instansi-1 {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 0;
      color: #000;
    }
    .kop-text .instansi-2 {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 2px 0 0 0;
      color: #000;
    }
    .kop-text .alamat {
      font-size: 8.5pt;
      margin: 4px 0 0 0;
      line-height: 1.25;
      color: #000;
    }
    .kop-divider {
      margin-top: 6px;
      margin-bottom: 12px;
      border-top: 3px solid #000000;
      border-bottom: 1px solid #000000;
      height: 2px;
    }
    /* Grid Metadata Surat */
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 10pt;
    }
    .meta-table td {
      vertical-align: top;
      padding: 1.5px 0;
    }
    /* Tabel 8 Butir */
    .table-butir {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 10pt;
    }
    .table-butir td {
      vertical-align: top;
      padding: 3px 0;
    }
    .col-num {
      width: 24px;
      font-weight: normal;
    }
    .col-label {
      width: 215px;
      font-weight: normal;
    }
    .col-sep {
      width: 14px;
      text-align: center;
    }
    .col-val {
      font-weight: normal;
    }
    /* Tabel Rincian RAB */
    .table-rab {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 9pt;
    }
    .table-rab th {
      border: 1px solid #1e293b;
      padding: 5px 6px;
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .table-rab td {
      border: 1px solid #1e293b;
      padding: 4px 6px;
    }
    /* TTE Block */
    .tte-container {
      width: 280px;
      margin-left: auto;
      text-align: center;
      font-size: 10pt;
    }
    /* Tembusan */
    .tembusan-block {
      font-size: 9pt;
      margin-top: 10px;
    }
    .tembusan-block ol {
      margin: 3px 0 0 0;
      padding-left: 18px;
    }
    .tembusan-block li {
      margin-bottom: 2px;
    }
    .page-number {
      font-size: 10pt;
      font-weight: normal;
      text-align: center;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>

  <!-- ==================== HALAMAN 1 ==================== -->
  <div class="rekomtek-page page-1">
    <div class="page-content">
      <!-- Kop Surat -->
      <div class="kop-wrapper">
        <div class="kop-logo">
          ${SVG_LOGO_KEMENTAN}
        </div>
        <div class="kop-text">
          <div class="instansi-1">KEMENTERIAN PERTANIAN</div>
          <div class="instansi-2">DIREKTORAT JENDERAL PERKEBUNAN</div>
          <div class="alamat">
            KANPUS KEMENTERIAN PERTANIAN JALAN HARSONO RM NOMOR 3 GEDUNG C PASAR MINGGU, JAKARTA 12550<br>
            TELEPON (021) 7815380 - 4, FAKSIMILI (021) 7815486 - 7815586<br>
            WEBSITE : https://ditjenbun.pertanian.go.id
          </div>
        </div>
      </div>
      <div class="kop-divider"></div>

      <!-- Tanggal Surat & Metadata -->
      <table class="meta-table">
        <tr>
          <td style="width: 58%;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 75px;">Nomor</td>
                <td style="width: 12px;">:</td>
                <td><strong>${nomorSurat}</strong></td>
              </tr>
              <tr>
                <td>Sifat</td>
                <td>:</td>
                <td>${sifat}</td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>${lampiran}</td>
              </tr>
              <tr>
                <td>Hal</td>
                <td>:</td>
                <td style="font-weight: bold; text-align: justify;">${hal}</td>
              </tr>
            </table>
          </td>
          <td style="width: 42%; text-align: right; vertical-align: top;">
            Jakarta, ${tanggalSurat}
          </td>
        </tr>
      </table>

      <!-- Tujuan Surat -->
      <div style="margin-bottom: 12px; font-size: 10pt; line-height: 1.35;">
        Yth.<br>
        <strong>Direktur Utama Badan Pengelola Dana Perkebunan Kelapa Sawit</strong><br>
        Kementerian Keuangan RI<br>
        di Tempat
      </div>

      <!-- Paragraf Pembuka -->
      <div style="text-align: justify; text-justify: inter-word; font-size: 10pt; margin-bottom: 10px; line-height: 1.35;">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Memperhatikan Surat Kepala Dinas Perkebunan Provinsi Nomor: ${spNomor} tanggal ${spTanggal} Hal ${spPerihal} serta Keputusan Direktur Jenderal Perkebunan Nomor 07/Kpts/HK.160/E/01/2024 tentang Pedoman Teknis Sarana dan Prasarana Perkebunan Kelapa Sawit Yang Didanai Badan Pengelola Dana Perkebunan Kelapa Sawit, bersama ini disampaikan rekomendasi teknis sarana dan prasarana perkebunan kelapa sawit sebagai berikut:
      </div>

      <!-- Tabel 8 Poin Rekomtek -->
      <table class="table-butir">
        <tr>
          <td class="col-num">1.</td>
          <td class="col-label">Nama Lembaga</td>
          <td class="col-sep">:</td>
          <td class="col-val"><strong>${data.kelembagaan.namaLembaga}</strong></td>
        </tr>
        <tr>
          <td class="col-num">2.</td>
          <td class="col-label">Badan Hukum</td>
          <td class="col-sep">:</td>
          <td class="col-val">${data.kelembagaan.badanHukum || 'Akta Notaris / SK Kemenkumham Terdaftar'}</td>
        </tr>
        <tr>
          <td class="col-num">3.</td>
          <td class="col-label">Alamat Lembaga</td>
          <td class="col-sep">:</td>
          <td class="col-val">${data.kelembagaan.alamatLembaga}</td>
        </tr>
        <tr>
          <td class="col-num">4.</td>
          <td class="col-label">Luas Areal (Ha)</td>
          <td class="col-sep">:</td>
          <td class="col-val">${data.kelembagaan.luasArealHa.toLocaleString('id-ID')} Ha</td>
        </tr>
        <tr>
          <td class="col-num">5.</td>
          <td class="col-label">Jumlah Pekebun (KK)</td>
          <td class="col-sep">:</td>
          <td class="col-val">${data.kelembagaan.jumlahPekebun.toLocaleString('id-ID')} KK</td>
        </tr>
        <tr>
          <td class="col-num">6.</td>
          <td class="col-label">Lokasi Kebun</td>
          <td class="col-sep">:</td>
          <td class="col-val">${data.kelembagaan.lokasiKebun}</td>
        </tr>
        <tr>
          <td class="col-num">7.</td>
          <td class="col-label">Jenis Sarana dan Prasarana serta Nilai Anggaran</td>
          <td class="col-sep">:</td>
          <td class="col-val">
            a. Kegiatan: ${data.paketSarpras.namaPaket}<br>
            b. Bentuk Bantuan: ${jenisBantuan}<br>
            c. Nilai Anggaran: <strong>${formatRupiah(totalNilai)}</strong> (<em>${totalTerbilang}</em>)
          </td>
        </tr>
        <tr>
          <td class="col-num" style="padding-top: 6px;">8.</td>
          <td class="col-label" style="padding-top: 6px;">Rincian Bantuan</td>
          <td class="col-sep" style="padding-top: 6px;">:</td>
          <td class="col-val" style="padding-top: 6px;">Sebagaimana rincian usulan rencana anggaran biaya berikut:</td>
        </tr>
      </table>

      <!-- Tabel Rincian Anggaran / Bantuan -->
      <table class="table-rab">
        <thead>
          <tr>
            <th style="width: 32px;">No</th>
            <th>Nama Barang / Kegiatan</th>
            <th style="width: 60px;">Satuan</th>
            <th style="width: 75px;">Volume</th>
            <th style="width: 110px;">Harga Satuan</th>
            <th style="width: 125px;">Total Biaya (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRABRows}
          <tr style="background-color: #f8fafc; font-weight: bold;">
            <td colspan="5" style="text-align: right; padding: 5px 8px; border: 1px solid #1e293b;">Total Anggaran Rekomendasi Teknis:</td>
            <td style="text-align: right; padding: 5px 8px; border: 1px solid #1e293b;">${formatRupiah(totalNilai)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer BSrE Halaman 1 -->
    <div class="page-footer">
      <div style="display: flex; align-items: center; gap: 8px;">
        ${SVG_LOGO_BSRE_SMALL}
        <span>Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN</span>
      </div>
      <div style="font-weight: bold; font-size: 9pt;">- 1 -</div>
    </div>
  </div>

  <!-- ==================== HALAMAN 2 ==================== -->
  <div class="rekomtek-page page-2">
    <div class="page-content">
      <div class="page-number">- 2 -</div>

      <!-- Klausul Lanjutan Butir 7 -->
      <div style="text-align: justify; text-justify: inter-word; font-size: 10pt; line-height: 1.4; margin-top: 10px; margin-bottom: 14px;">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Perhitungan harga satuan dalam rekomendasi teknis ini menggunakan harga pada saat rekomendasi teknis dibuat dan apabila dalam proses penyaluran dana terdapat perubahan harga satuan barang/jasa, maka penetapan harga satuan barang/jasa menjadi kewenangan Badan Pengelola Dana Perkebunan Kelapa Sawit sesuai ketentuan perundang-undangan.
      </div>

      <!-- Paragraf Penutup -->
      <div style="text-align: justify; text-justify: inter-word; font-size: 10pt; line-height: 1.4; margin-bottom: 24px;">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&_Demikian rekomendasi teknis ini kami sampaikan, atas perhatian dan kerjasamanya diucapkan terima kasih.
      </div>

      <!-- Blok Tanda Tangan Elektronik Sisi Kanan -->
      <div class="tte-container">
        <div style="font-size: 9.5pt; color: #1e293b; margin-bottom: 4px;">Ditandatangani secara elektronik oleh:</div>
        <div style="font-size: 10.5pt; font-weight: bold; margin-bottom: 8px;">${pejabat.jabatan}</div>
        
        <!-- QR Code BSrE Center -->
        <div style="display: flex; justify-content: center; margin: 6px 0;">
          ${generateBsreQrSvg()}
        </div>

        <div style="font-size: 10.5pt; font-weight: bold; margin-top: 8px; text-decoration: underline;">
          ${pejabat.nama}
        </div>
        <div style="font-size: 9.5pt; margin-top: 2px;">
          NIP ${pejabat.nip}
        </div>
        ${pejabat.isDraft ? '<div style="margin-top: 4px; font-size: 8pt; color: #dc2626; font-weight: bold; letter-spacing: 0.5px;">[DRAF REKOMTEK - VERIFIKASI SISTEM]</div>' : ''}
      </div>

      <!-- Tembusan Sisi Kiri Bawah -->
      <div class="tembusan-block" style="margin-top: 40px;">
        <strong>Tembusan Yth :</strong>
        <ol>
          ${tembusanList.map(t => `<li>${t}</li>`).join('')}
        </ol>
      </div>
    </div>

    <!-- Footer BSrE Halaman 2 -->
    <div class="page-footer">
      <div style="display: flex; align-items: center; gap: 8px;">
        ${SVG_LOGO_BSRE_SMALL}
        <span>Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN</span>
      </div>
      <div style="font-weight: bold; font-size: 9pt;">- 2 -</div>
    </div>
  </div>

  <!-- ==================== HALAMAN 3 (LAMPIRAN) ==================== -->
  <div class="rekomtek-page page-3">
    <div class="page-content">
      <div class="page-number">- 3 -</div>

      <!-- Header Lampiran Surat Kanan Atas -->
      <div style="width: 320px; margin-left: auto; font-size: 9.5pt; line-height: 1.35; margin-bottom: 20px;">
        <div style="font-weight: bold;">Lampiran Surat Rekomendasi Teknis</div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 2px;">
          <tr>
            <td style="width: 60px;">Nomor</td>
            <td style="width: 10px;">:</td>
            <td><strong>${nomorSurat}</strong></td>
          </tr>
          <tr>
            <td>Tanggal</td>
            <td>:</td>
            <td>${tanggalSurat}</td>
          </tr>
        </table>
      </div>

      <!-- Judul Lampiran -->
      <div style="text-align: center; font-weight: bold; font-size: 11pt; margin-bottom: 16px; text-decoration: underline;">
        SURAT REKOMENDASI TEKNIS SARANA DAN PRASARANA
      </div>

      <!-- Rincian Landasan Hukum & Berita Acara -->
      <div style="font-size: 10pt; line-height: 1.45; text-align: justify;">
        <div style="margin-bottom: 12px; display: flex; gap: 8px;">
          <div style="width: 20px; font-weight: bold;">1.</div>
          <div>
            <strong>Keputusan ${skCpclPejabat}</strong> Nomor: <strong>${skCpclNomor}</strong> Tanggal <strong>${skCpclTanggal}</strong> tentang Penetapan Calon Petani dan Calon Lahan (CPCL) Kegiatan Sarana dan Prasarana Perkebunan Kelapa Sawit yang Didanai Badan Pengelola Dana Perkebunan Kelapa Sawit.
          </div>
        </div>

        <div style="margin-bottom: 12px; display: flex; gap: 8px;">
          <div style="width: 20px; font-weight: bold;">2.</div>
          <div>
            <strong>Berita Acara Hasil Verifikasi Dokumen Usulan</strong> Kegiatan Sarana dan Prasarana Perkebunan Kelapa Sawit antara Tim Verifikasi Dinas Perkebunan Provinsi dan Dinas Kabupaten Nomor: <strong>${baNomor}</strong> Tanggal <strong>${baTanggal}</strong>.
          </div>
        </div>

        <div style="margin-bottom: 12px; display: flex; gap: 8px;">
          <div style="width: 20px; font-weight: bold;">3.</div>
          <div>
            Hasil pemeriksaan dan verifikasi teknis Direktorat Jenderal Perkebunan menyatakan bahwa usulan kegiatan <strong>${data.paketSarpras.namaPaket}</strong> oleh <strong>${data.kelembagaan.namaLembaga}</strong> seluas <strong>${data.kelembagaan.luasArealHa.toLocaleString('id-ID')} Ha</strong> dengan jumlah <strong>${data.kelembagaan.jumlahPekebun.toLocaleString('id-ID')} KK</strong> telah memenuhi seluruh kriteria dan persyaratan teknis yang ditetapkan.
          </div>
        </div>
      </div>

      <!-- Blok Paraf / Pengesahan Kedua Ditjenbun -->
      <div class="tte-container" style="margin-top: 50px;">
        <div style="font-size: 10.5pt; font-weight: bold; margin-bottom: 8px;">${pejabat.jabatan}</div>
        
        <div style="display: flex; justify-content: center; margin: 6px 0;">
          ${generateBsreQrSvg()}
        </div>

        <div style="font-size: 10.5pt; font-weight: bold; margin-top: 8px; text-decoration: underline;">
          ${pejabat.nama}
        </div>
        <div style="font-size: 9.5pt; margin-top: 2px;">
          NIP ${pejabat.nip}
        </div>
      </div>
    </div>

    <!-- Footer BSrE Halaman 3 -->
    <div class="page-footer">
      <div style="display: flex; align-items: center; gap: 8px;">
        ${SVG_LOGO_BSRE_SMALL}
        <span>Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN</span>
      </div>
      <div style="font-weight: bold; font-size: 9pt;">- 3 -</div>
    </div>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Trigger Pencetakan / Unduh PDF Dokumen Rekomtek menggunakan iframe tersembunyi
 */
export function printRekomtekDocument(data: RekomtekDocumentData): void {
  const htmlContent = generateRekomtekHtml(data);
  const iframeId = '__rekomtek_print_iframe__';

  let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc) {
    // Fallback window.open jika iframe tidak didukung
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(htmlContent);
      w.document.close();
      w.focus();
      w.print();
    }
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 400);
}
