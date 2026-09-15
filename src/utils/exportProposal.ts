import { getStatusLabel, getJenisSarprasLabel } from '@/types/pengusulan';
import { resolveRekomtekDateInfo } from './exportPekebunExcel';

export interface ProposalExportFilterSummary {
  startDate?: string;
  endDate?: string;
  statusLabel?: string;
  paketLabel?: string;
  wilayahLabel?: string;
}

export function formatRupiah(val: number | string | undefined | null): string {
  const num = typeof val === 'number' ? val : parseFloat(String(val || 0));
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

export function formatDate(val: string | undefined | null): string {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return val;
  }
}

/**
 * Exports proposal list to RFC-4180 CSV with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportProposalsToCsv(data: any[], filename = 'daftar-proposal') {
  if (!data || data.length === 0) return;

  const headers = [
    'No.',
    'Nomor Proposal',
    'Nama Lembaga / Pemohon',
    'Paket Sarpras',
    'Total Anggaran',
    'Status',
    'No. Rekomtek',
    'Tanggal Terbit Rekomtek',
    'Tahun Terbit Rekomtek',
    'Tanggal Pengajuan',
  ];

  const rows = data.map((item, index) => {
    const nomor = item.nomor_proposal || item.nomorProposal || item.nomorUsulan || '-';
    const lembaga = item.lembaga?.namaLembaga || item.kelembagaan?.nama_lembaga || item.namaKelompokTani || item.namaLembaga || '-';
    const paket = getJenisSarprasLabel(item.paket_sarpras || item.jenisSarpras || item.paketSarpras || '') || '-';
    const totalAnggaran = formatRupiah(item.total_anggaran ?? item.totalAnggaranPengajuan ?? item.totalAnggaran ?? 0);
    const status = getStatusLabel(item.status || item.currentStatus || '');
    const noRekomtek = item.no_rekomtek || item.noRekomtek || item.rekomtek?.nomorRekomtek || '-';
    const dateInfo = resolveRekomtekDateInfo(item);
    const tanggal = formatDate(item.created_at || item.createdAt || item.tanggalPengajuan || item.tanggalUsulan);

    return [
      index + 1,
      `"${String(nomor).replace(/"/g, '""')}"`,
      `"${String(lembaga).replace(/"/g, '""')}"`,
      `"${String(paket).replace(/"/g, '""')}"`,
      `"${String(totalAnggaran).replace(/"/g, '""')}"`,
      `"${String(status).replace(/"/g, '""')}"`,
      `"${String(noRekomtek).replace(/"/g, '""')}"`,
      `"${String(dateInfo.tanggalFormatted).replace(/"/g, '""')}"`,
      `"${String(dateInfo.tahun).replace(/"/g, '""')}"`,
      `"${String(tanggal).replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `${filename}-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports proposal list to Printable PDF layout using hidden iframe & window.print()
 */
export function exportProposalsToPdf(
  data: any[],
  title = 'Daftar Proposal Sarpras Kakao',
  filters?: ProposalExportFilterSummary,
) {
  if (!data || data.length === 0) return;

  const printedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const filterItems: string[] = [];
  if (filters?.startDate || filters?.endDate) {
    const start = filters.startDate ? formatDate(filters.startDate) : 'Awal';
    const end = filters.endDate ? formatDate(filters.endDate) : 'Sekarang';
    filterItems.push(`<b>Periode:</b> ${start} s/d ${end}`);
  }
  if (filters?.statusLabel && filters.statusLabel !== 'Semua Status') {
    filterItems.push(`<b>Status:</b> ${filters.statusLabel}`);
  }
  if (filters?.paketLabel && filters.paketLabel !== 'Semua Paket') {
    filterItems.push(`<b>Paket:</b> ${filters.paketLabel}`);
  }
  if (filters?.wilayahLabel) {
    filterItems.push(`<b>Wilayah:</b> ${filters.wilayahLabel}`);
  }

  const filterSummaryHtml = filterItems.length > 0
    ? `<div class="filter-box">${filterItems.join(' &nbsp;|&nbsp; ')}</div>`
    : '';

  const totalNominal = data.reduce((acc, item) => {
    const val = parseFloat(String(item.total_anggaran ?? item.totalAnggaranPengajuan ?? item.totalAnggaran ?? 0));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const rowsHtml = data
    .map((item, index) => {
      const nomor = item.nomor_proposal || item.nomorProposal || item.nomorUsulan || '-';
      const lembaga = item.lembaga?.namaLembaga || item.kelembagaan?.nama_lembaga || item.namaKelompokTani || item.namaLembaga || '-';
      const paket = getJenisSarprasLabel(item.paket_sarpras || item.jenisSarpras || item.paketSarpras || '') || '-';
      const totalAnggaran = formatRupiah(item.total_anggaran ?? item.totalAnggaranPengajuan ?? item.totalAnggaran ?? 0);
      const status = getStatusLabel(item.status || item.currentStatus || '');
      const noRekomtek = item.no_rekomtek || item.noRekomtek || item.rekomtek?.nomorRekomtek || '-';
      const dateInfo = resolveRekomtekDateInfo(item);
      const tanggal = formatDate(item.created_at || item.createdAt || item.tanggalPengajuan || item.tanggalUsulan);

      return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td class="font-mono">${nomor}</td>
          <td><b>${lembaga}</b></td>
          <td>${paket}</td>
          <td class="text-right">${totalAnggaran}</td>
          <td><span class="badge">${status}</span></td>
          <td>${noRekomtek}</td>
          <td class="text-center">${dateInfo.tanggalFormatted}</td>
          <td class="text-center">${dateInfo.tahun}</td>
          <td class="text-center">${tanggal}</td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 15mm 12mm 15mm 12mm;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          tr {
            page-break-inside: avoid;
          }
        }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 16px;
          font-size: 10px;
          line-height: 1.4;
        }
        .header {
          border-bottom: 2px solid #0f766e;
          padding-bottom: 10px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .header-title h1 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #0f766e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-title p {
          font-size: 11px;
          margin: 0;
          color: #475569;
        }
        .header-meta {
          text-align: right;
          font-size: 9px;
          color: #64748b;
        }
        .filter-box {
          background-color: #f1f5f9;
          border-left: 3px solid #0f766e;
          padding: 6px 10px;
          font-size: 10px;
          color: #334155;
          margin-bottom: 12px;
          border-radius: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 6px 8px;
          vertical-align: middle;
        }
        th {
          background-color: #0f766e !important;
          color: #ffffff !important;
          font-weight: 600;
          text-align: left;
          font-size: 9.5px;
          text-transform: uppercase;
        }
        tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; font-size: 9.5px; }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 8.5px;
          font-weight: 600;
          background: #e2e8f0;
          color: #1e293b;
        }
        .signature-section {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
          page-break-inside: avoid;
        }
        .signature-box {
          text-align: center;
          width: 200px;
          font-size: 10px;
        }
        .signature-space {
          height: 50px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-title">
          <h1>${title}</h1>
          <p>Sistem Informasi Sarana dan Prasarana Kelapa Sawit (BPDPKS)</p>
        </div>
        <div class="header-meta">
          Dicetak pada: ${printedDate}<br>
          Total Data: <b>${data.length} Proposal</b>
        </div>
      </div>

      ${filterSummaryHtml}

      <table>
        <thead>
          <tr>
            <th style="width: 25px;" class="text-center">No</th>
            <th style="width: 110px;">No. Proposal</th>
            <th>Kelembagaan / Pemohon</th>
            <th>Paket Sarpras</th>
            <th style="width: 100px;" class="text-right">Total Anggaran</th>
            <th style="width: 120px;">Status</th>
            <th style="width: 90px;">No. Rekomtek</th>
            <th style="width: 75px;" class="text-center">Tgl Terbit Rekomtek</th>
            <th style="width: 50px;" class="text-center">Tahun</th>
            <th style="width: 75px;" class="text-center">Tgl Pengajuan</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="4" class="text-right">TOTAL KESELURUHAN (${data.length} Proposal)</td>
            <td class="text-right">${formatRupiah(totalNominal)}</td>
            <td colspan="5"></td>
          </tr>
        </tfoot>
      </table>

      <div class="signature-section">
        <div class="signature-box">
          <p>Petugas Penanggung Jawab,</p>
          <div class="signature-space"></div>
          <p><b>( .................................................. )</b></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();
  }

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}
