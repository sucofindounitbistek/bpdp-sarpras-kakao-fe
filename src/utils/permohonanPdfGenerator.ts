import type { ItemPreferensiRAB, PaketKategori } from '@/types/penyaluranBarang';

export interface SuratPermohonanPdfData {
  nomorPermohonan?: string;
  namaLembaga: string;
  namaKetua: string;
  kontak: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kategoriPaket: PaketKategori;
  itemsRAB: ItemPreferensiRAB[];
  tanggalSurat?: string;
}

export function generateSuratPermohonanHtml(data: SuratPermohonanPdfData): string {
  const tanggal = data.tanggalSurat || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalEstimasi = data.itemsRAB.reduce((sum, item) => sum + (item.estimasiTotal || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const rows = data.itemsRAB
    .map(
      (item, idx) => `
    <tr>
      <td style="border: 1px solid #334155; padding: 6px 8px; text-align: center;">${idx + 1}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px; font-weight: 500;">${item.jenisBarang}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px;">${item.namaBarang || item.namaBarangVarietas || '-'}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px; font-weight: 500; color: #066C2A;">${item.varietas || '-'}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px; text-align: right;">${item.jumlahTahap1 !== undefined && item.jumlahTahap1 !== null ? item.jumlahTahap1.toLocaleString('id-ID') : '-'}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px; text-align: right;">${item.jumlahTahap2 !== undefined && item.jumlahTahap2 !== null ? item.jumlahTahap2.toLocaleString('id-ID') : '-'}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px; text-align: right; font-weight: 600;">${(item.jumlah || 0).toLocaleString('id-ID')}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px; text-align: center;">${item.satuan}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px; text-align: right;">${formatRupiah(item.estimasiHargaSatuan)}</td>
      <td style="border: 1px solid #334155; padding: 6px 8px; text-align: right; font-weight: 600;">${formatRupiah(item.estimasiTotal)}</td>
    </tr>
  `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Surat Permohonan Pengadaan Barang - ${data.namaLembaga}</title>
    <style>
      @page {
        size: A4;
        margin: 20mm 15mm;
      }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #0f172a;
        font-size: 11pt;
        line-height: 1.4;
        background: #fff;
        margin: 0;
        padding: 10px;
      }
      .header-table {
        width: 100%;
        border-bottom: 3px double #066C2A;
        padding-bottom: 12px;
        margin-bottom: 16px;
      }
      .header-title {
        text-align: center;
      }
      .header-title h2 {
        margin: 0;
        font-size: 14pt;
        color: #066C2A;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .header-title h3 {
        margin: 4px 0 0 0;
        font-size: 12pt;
        font-weight: 600;
      }
      .header-title p {
        margin: 2px 0 0 0;
        font-size: 9pt;
        color: #475569;
      }
      .meta-table {
        width: 100%;
        margin-bottom: 16px;
        font-size: 10.5pt;
      }
      .meta-table td {
        padding: 3px 0;
        vertical-align: top;
      }
      .content-text {
        text-align: justify;
        margin-bottom: 12px;
        font-size: 10.5pt;
      }
      .rab-table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0 16px 0;
        font-size: 10pt;
      }
      .rab-table th {
        background-color: #f1f5f9;
        border: 1px solid #334155;
        padding: 8px 6px;
        text-align: center;
        font-weight: 600;
        color: #0f172a;
      }
      .signature-section {
        width: 100%;
        margin-top: 28px;
        page-break-inside: avoid;
      }
      .signature-box {
        float: right;
        width: 250px;
        text-align: center;
        font-size: 10.5pt;
      }
      .sign-space {
        height: 65px;
      }
    </style>
  </head>
  <body>
    <table class="header-table">
      <tr>
        <td class="header-title">
          <h2>${data.namaLembaga}</h2>
          <h3>SURAT PERMOHONAN PENYALURAN BARANG/JASA SARPRAS</h3>
          <p>Desa ${data.desa}, Kec. ${data.kecamatan}, Kab. ${data.kabupaten}, Prov. ${data.provinsi} | Kontak: ${data.kontak}</p>
        </td>
      </tr>
    </table>

    <table class="meta-table">
      <tr>
        <td style="width: 120px;">Nomor Register</td>
        <td style="width: 15px;">:</td>
        <td style="font-weight: 600;">${data.nomorPermohonan || 'DRAFT-PENYALURAN-2026'}</td>
        <td style="width: 100px; text-align: right;">Tanggal:</td>
        <td style="width: 120px; text-align: right; font-weight: 500;">${tanggal}</td>
      </tr>
      <tr>
        <td>Lampiran</td>
        <td>:</td>
        <td>1 (Satu) Berkas Rencana Anggaran Biaya (RAB)</td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>Perihal</td>
        <td>:</td>
        <td colspan="3" style="font-weight: 600; color: #066C2A;">Permohonan Pengadaan Barang Paket ${data.kategoriPaket} Kelapa</td>
      </tr>
    </table>

    <div class="content-text">
      Kepada Yth.<br>
      <strong>Direktur Penyaluran Dana / Tim Teknis Sarpras Kelapa</strong><br>
      Badan Pengelola Dana Perkebunan (BPDP)<br>
      di Tempat
    </div>

    <div class="content-text">
      Dengan hormat,<br>
      Sehubungan dengan program bantuan Sarana dan Prasarana Perkebunan Kelapa tahun 2026, bersama ini kami atas nama <strong>${data.namaLembaga}</strong> mengajukan permohonan pengadaan dan penyaluran barang paket <strong>${data.kategoriPaket}</strong> dengan rincian preferensi kebutuhan barang sebagai berikut:
    </div>

    <table class="rab-table">
      <thead>
        <tr>
          <th style="width: 4%;">No</th>
          <th style="width: 14%;">Jenis Barang</th>
          <th style="width: 18%;">Nama Barang</th>
          <th style="width: 18%;">Varietas</th>
          <th style="width: 7%;">Jml Thp 1</th>
          <th style="width: 7%;">Jml Thp 2</th>
          <th style="width: 8%;">Jml Total</th>
          <th style="width: 7%;">Satuan</th>
          <th style="width: 12%;">Harga Satuan</th>
          <th style="width: 13%;">Total Estimasi</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="background-color: #f8fafc;">
          <td colspan="9" style="border: 1px solid #334155; padding: 6px 8px; text-align: right; font-weight: 700;">TOTAL ESTIMASI KEBUTUHAN:</td>
          <td style="border: 1px solid #334155; padding: 6px 8px; text-align: right; font-weight: 700; color: #066C2A;">${formatRupiah(totalEstimasi)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="content-text">
      Demikian surat permohonan pengadaan barang ini kami sampaikan dengan sebenar-benarnya. Kami menyatakan siap menerima dan memfasilitasi pelaksanaan pengawasan, sampling mutu, dan penyaluran barang di lapangan sesuai dengan ketentuan yang berlaku.
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <div>${data.kabupaten}, ${tanggal}</div>
        <div style="font-weight: 600; margin-top: 4px;">Ketua Lembaga Pekebun,</div>
        <div class="sign-space"></div>
        <div style="font-weight: 700; text-decoration: underline;">${data.namaKetua}</div>
        <div style="font-size: 9pt; color: #64748b;">${data.namaLembaga}</div>
      </div>
      <div style="clear: both;"></div>
    </div>
  </body>
  </html>
  `;
}

export function downloadSuratPermohonanPdf(data: SuratPermohonanPdfData) {
  const htmlContent = generateSuratPermohonanHtml(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  }
}
