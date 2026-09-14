/**
 * Utility untuk Pembangkitan Laporan Excel Data Pekebun & Lahan
 * Fitur:
 * 1. Laporan Titik Koordinat (14 kolom, 1 baris per titik koordinat sudut poligon)
 * 2. Laporan Profil Pekebun (10 kolom, 1 baris per persil lahan milik pekebun)
 */

export interface ExportPekebunContext {
  proposal?: any;
  pekebuns?: any[];
  lahans?: any[];
}

export interface CoordinatePoint {
  lat: number;
  lng: number;
}

/**
 * Escape string untuk format XML Spreadsheet
 */
export function escapeXml(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format tanggal ke DD-MM-YYYY
 */
export function formatDateIndo(val: string | Date | null | undefined): string {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(val);
  }
}

export interface RekomtekDateInfo {
  tanggalFormatted: string; // "DD-MM-YYYY" atau "-"
  tahun: string;            // "YYYY" atau "-"
}

/**
 * Resolusi Tanggal dan Tahun Terbit Rekomtek dari usulan/proposal
 */
export function resolveRekomtekDateInfo(proposal: any): RekomtekDateInfo {
  if (!proposal) {
    return { tanggalFormatted: '-', tahun: '-' };
  }

  // 1. Cek dari atribut tanggal_rekomtek tersimpan
  const rawDate =
    proposal.tanggal_rekomtek ||
    proposal.tanggalRekomtek ||
    proposal.tgl_rekomtek ||
    proposal.rekomtek?.tanggalTerbit ||
    proposal.rekomtek?.uploadedAt;

  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());
      return {
        tanggalFormatted: `${day}-${month}-${year}`,
        tahun: year,
      };
    }
  }

  // 2. Cek dari dokumen bertipe REKOMTEK
  const docs = proposal.documents || proposal.dokumen || [];
  if (Array.isArray(docs)) {
    const rekomtekDoc = docs.find((doc: any) =>
      String(doc?.document_type || doc?.documentType || '').toUpperCase().includes('REKOMTEK')
    );

    if (rekomtekDoc?.created_at || rekomtekDoc?.uploaded_at) {
      const docDateStr = rekomtekDoc.created_at || rekomtekDoc.uploaded_at;
      const d = new Date(docDateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear());
        return {
          tanggalFormatted: `${day}-${month}-${year}`,
          tahun: year,
        };
      }
    }
  }

  // 3. Fallback jika belum terbit Rekomtek
  return { tanggalFormatted: '-', tahun: '-' };
}

/**
 * Ekstraksi array titik koordinat poligon [lat, lng]
 */
export function extractPolygonCoordinates(rawCoords: any): CoordinatePoint[] {
  if (!rawCoords) return [];

  // Jika sudah array of objects { lat, lng } atau [lat, lng]
  if (Array.isArray(rawCoords)) {
    return rawCoords
      .map((pt) => {
        if (Array.isArray(pt) && pt.length >= 2) {
          const lat = Number(pt[0]);
          const lng = Number(pt[1]);
          return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
        }
        if (typeof pt === 'object' && pt !== null) {
          const lat = Number(pt.lat ?? pt.latitude);
          const lng = Number(pt.lng ?? pt.longitude);
          return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
        }
        return null;
      })
      .filter((pt): pt is CoordinatePoint => pt !== null);
  }

  // Jika berupa string (JSON atau semicolon/comma separated)
  if (typeof rawCoords === 'string') {
    const trimmed = rawCoords.trim();
    if (!trimmed) return [];

    // Coba parse JSON
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return extractPolygonCoordinates(parsed);
      }
      if (parsed && typeof parsed === 'object' && parsed.coordinates) {
        return extractPolygonCoordinates(parsed.coordinates);
      }
    } catch {
      // Bukan JSON valid, coba parsing format teks: "lat,lng; lat,lng"
      return trimmed
        .split(';')
        .map((segment) => {
          const parts = segment.split(',').map((p) => Number(p.trim()));
          if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
            return { lat: parts[0], lng: parts[1] };
          }
          return null;
        })
        .filter((pt): pt is CoordinatePoint => pt !== null);
    }
  }

  return [];
}

/**
 * Bangun XML Spreadsheet Workbook dari headers dan rows
 */
export function generateXmlSpreadsheet(sheetName: string, headers: string[], rows: Array<Array<{ val: any; type: 'String' | 'Number'; style?: string }>>): string {
  const columnWidths = headers.map((h) => Math.max(h.length * 10, 100));

  const colsXml = columnWidths.map((w) => `<Column ss:AutoFitWidth="0" ss:Width="${w}"/>`).join('\n   ');

  const headerCells = headers
    .map(
      (h) => `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`
    )
    .join('\n');

  const headerRowXml = `   <Row ss:Height="26">\n${headerCells}\n   </Row>`;

  const bodyRowsXml = rows
    .map((row) => {
      const cellsXml = row
        .map((cell) => {
          const style = cell.style || (cell.type === 'Number' ? 'NumberCell' : 'TextCell');
          const safeVal = escapeXml(cell.val);
          return `    <Cell ss:StyleID="${style}"><Data ss:Type="${cell.type}">${safeVal}</Data></Cell>`;
        })
        .join('\n');
      return `   <Row ss:Height="20">\n${cellsXml}\n   </Row>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>BPDP Sarpras Kelapa</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#555555"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#555555"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#555555"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#555555"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1B4D21" ss:Bold="1"/>
   <Interior ss:Color="#D9EAD3" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TextCell">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
   </Borders>
   <NumberFormat ss:Format="@"/>
  </Style>
  <Style ss:ID="CenterCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
   </Borders>
   <NumberFormat ss:Format="@"/>
  </Style>
  <Style ss:ID="NumberCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
   </Borders>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="CoordCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
   </Borders>
   <NumberFormat ss:Format="0.00000000"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table>
   ${colsXml}
${headerRowXml}
${bodyRowsXml}
  </Table>
 </Worksheet>
</Workbook>`;
}

/**
 * Pemicu unduhan berkas spreadsheet di browser
 */
export function triggerFileDownload(content: string, filename: string, mimeType = 'application/vnd.ms-excel;charset=utf-8;'): void {
  if (typeof document === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper untuk normalisasi daftar pekebun dan persil lahan dari context
 */
export function normalizePekebunLahans(context: ExportPekebunContext): Array<{
  pekebun: any;
  lahan: any;
}> {
  const proposal = context.proposal || {};
  const pekebuns: any[] = context.pekebuns && context.pekebuns.length > 0 ? context.pekebuns : proposal.pekebuns || [];
  const lahans: any[] = context.lahans && context.lahans.length > 0 ? context.lahans : proposal.lahans || [];

  const results: Array<{ pekebun: any; lahan: any }> = [];

  if (pekebuns.length === 0) {
    // Jika tidak ada pekebuns tapi ada lahans
    for (const l of lahans) {
      results.push({ pekebun: l.pekebun || {}, lahan: l });
    }
    return results;
  }

  for (const p of pekebuns) {
    const pId = p.id || p.pekebun_id || p.cpcl?.id;
    const pNik = p.nik || p.NIK || p.cpcl?.nik;

    // Temukan lahan milik pekebun ini
    let matchedLahans: any[] = [];
    if (Array.isArray(p.lahans) && p.lahans.length > 0) {
      matchedLahans = p.lahans;
    } else if (p.lahan) {
      matchedLahans = [p.lahan];
    } else {
      matchedLahans = lahans.filter((l) => {
        if (pId && l.pekebun_id && String(l.pekebun_id) === String(pId)) return true;
        if (pNik && l.pekebun?.nik && String(l.pekebun.nik) === String(pNik)) return true;
        return false;
      });
    }

    if (matchedLahans.length > 0) {
      for (const l of matchedLahans) {
        results.push({ pekebun: p, lahan: l });
      }
    } else {
      // Pekebun tanpa lahan terdaftar
      results.push({ pekebun: p, lahan: null });
    }
  }

  return results;
}

/**
 * 1. Generate & Download Laporan Titik Koordinat (.xlsx/.xls)
 * Header 16 kolom:
 * No | Nomor Proposal | Provinsi | Kabupaten | Nama Kelembagaan Pekebun | Nama Pekebun | NIK Pekebun | Luas Lahan (Ha) |
 * Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK) | Nama Tertera di SHM | Nomor SHM | Nomor SKT/GIRIK/SPORADIK |
 * Tanggal Terbit Rekomtek | Tahun Terbit Rekomtek | Latitude | Longitude
 */
export function exportLaporanTitikKoordinat(context: ExportPekebunContext, customFilename?: string): string {
  const proposal = context.proposal || {};
  const nomorProposal = proposal.nomor_proposal || proposal.nomorProposal || proposal.nomorUsulan || '-';
  const namaLembaga =
    proposal.lembaga?.namaLembaga ||
    proposal.kelembagaan?.nama_lembaga ||
    proposal.namaKelompokTani ||
    proposal.namaLembaga ||
    '-';
  const defaultProv = proposal.nama_dinas_provinsi || proposal.provinsi || proposal.kelembagaan?.provinsi || '-';
  const defaultKab = proposal.nama_dinas_kabupaten || proposal.kabupaten || proposal.kelembagaan?.kabupaten || '-';

  const headers = [
    'No',
    'Nomor Proposal',
    'Provinsi',
    'Kabupaten',
    'Nama Kelembagaan Pekebun',
    'Nama Pekebun',
    'NIK Pekebun',
    'Luas Lahan (Ha)',
    'Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)',
    'Nama Tertera di SHM',
    'Nomor SHM',
    'Nomor SKT/GIRIK/SPORADIK',
    'Tanggal Terbit Rekomtek',
    'Tahun Terbit Rekomtek',
    'Latitude',
    'Longitude',
  ];

  const rekomtekDateInfo = resolveRekomtekDateInfo(proposal);
  const items = normalizePekebunLahans(context);
  const rows: Array<Array<{ val: any; type: 'String' | 'Number'; style?: string }>> = [];

  let rowCounter = 1;

  for (const item of items) {
    const p = item.pekebun || {};
    const l = item.lahan || {};

    const namaPekebun = p.name || p.nama || p.namaPekebun || '-';
    const nik = String(p.nik || p.NIK || '-');
    const prov = l.provinsiNama || l.provinsi || defaultProv;
    const kab = l.kabupatenNama || l.kabupaten || defaultKab;
    const luasLahan = Number(l.luas_lahan ?? l.luasLahan ?? l.luasLahanHektar ?? 0);

    const jenisLegalitasRaw = String(l.jenis_legalitas || l.jenisLegalitas || l.jenisHakLahan || '').toUpperCase();
    const isSHM = jenisLegalitasRaw === 'SHM' || jenisLegalitasRaw.includes('SHM');
    const jenisLegalitasDisplay = isSHM ? 'SHM' : (l.jenis_legalitas || l.jenisLegalitas || l.jenisHakLahan || 'SKT/GIRIK/SPORADIK');

    // Logika nama tertera di SHM:
    // SHM sendiri -> Nama Pekebun; Beda nama -> Nama di Surat Beda Nama / Pemilik; Non-SHM -> '-'
    let namaTerteraDiSHM = '-';
    if (isSHM) {
      namaTerteraDiSHM = l.nomor_surat_beda_nama || l.namaPemilikSertifikat || namaPekebun;
    }

    const nomorLegalitas = l.nomor_legalitas || l.nomorLegalitas || l.nomorSuratLahan || '-';
    const nomorSHM = isSHM ? nomorLegalitas : '-';
    const nomorSKT = isSHM ? '-' : nomorLegalitas;

    // Koordinat poligon
    const rawCoords = l.coordinates || l.koordinat;
    const coords = extractPolygonCoordinates(rawCoords);

    if (coords.length > 0) {
      // 1 baris per titik koordinat sudut poligon
      for (const pt of coords) {
        rows.push([
          { val: rowCounter++, type: 'Number', style: 'CenterCell' },
          { val: nomorProposal, type: 'String' },
          { val: prov, type: 'String' },
          { val: kab, type: 'String' },
          { val: namaLembaga, type: 'String' },
          { val: namaPekebun, type: 'String' },
          { val: nik, type: 'String', style: 'CenterCell' },
          { val: luasLahan.toFixed(2), type: 'Number', style: 'NumberCell' },
          { val: jenisLegalitasDisplay, type: 'String', style: 'CenterCell' },
          { val: namaTerteraDiSHM, type: 'String' },
          { val: nomorSHM, type: 'String', style: 'CenterCell' },
          { val: nomorSKT, type: 'String', style: 'CenterCell' },
          { val: rekomtekDateInfo.tanggalFormatted, type: 'String', style: 'CenterCell' },
          { val: rekomtekDateInfo.tahun, type: 'String', style: 'CenterCell' },
          { val: pt.lat.toFixed(8), type: 'Number', style: 'CoordCell' },
          { val: pt.lng.toFixed(8), type: 'Number', style: 'CoordCell' },
        ]);
      }
    } else {
      // Baris fallback jika belum ada koordinat poligon
      rows.push([
        { val: rowCounter++, type: 'Number', style: 'CenterCell' },
        { val: nomorProposal, type: 'String' },
        { val: prov, type: 'String' },
        { val: kab, type: 'String' },
        { val: namaLembaga, type: 'String' },
        { val: namaPekebun, type: 'String' },
        { val: nik, type: 'String', style: 'CenterCell' },
        { val: luasLahan.toFixed(2), type: 'Number', style: 'NumberCell' },
        { val: jenisLegalitasDisplay, type: 'String', style: 'CenterCell' },
        { val: namaTerteraDiSHM, type: 'String' },
        { val: nomorSHM, type: 'String', style: 'CenterCell' },
        { val: nomorSKT, type: 'String', style: 'CenterCell' },
        { val: rekomtekDateInfo.tanggalFormatted, type: 'String', style: 'CenterCell' },
        { val: rekomtekDateInfo.tahun, type: 'String', style: 'CenterCell' },
        { val: '-', type: 'String', style: 'CenterCell' },
        { val: '-', type: 'String', style: 'CenterCell' },
      ]);
    }
  }

  const xmlContent = generateXmlSpreadsheet('Titik Koordinat', headers, rows);

  const cleanNoProp = String(nomorProposal).replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = customFilename || `Laporan_Titik_Koordinat_${cleanNoProp}_${dateStr}.xls`;

  triggerFileDownload(xmlContent, filename);
  return xmlContent;
}

/**
 * 2. Generate & Download Laporan Profil Pekebun (.xlsx/.xls)
 * Header 12 kolom:
 * No | Nama Pekebun | NIK Pekebun | KK Pekebun | Alamat Pekebun | Jenis Legalitas |
 * No / Nama Dokumen Legalitas Lahan | Tanggal Terbit Legalitas Lahan | Luas Lahan Sesuai Legalitas (Ha) | Luas Lahan (Ha) |
 * Tanggal Terbit Rekomtek | Tahun Terbit Rekomtek
 */
export function exportLaporanProfilPekebun(context: ExportPekebunContext, customFilename?: string): string {
  const proposal = context.proposal || {};
  const nomorProposal = proposal.nomor_proposal || proposal.nomorProposal || proposal.nomorUsulan || '-';

  const headers = [
    'No',
    'Nama Pekebun',
    'NIK Pekebun',
    'KK Pekebun',
    'Alamat Pekebun',
    'Jenis Legalitas',
    'No / Nama Dokumen Legalitas Lahan',
    'Tanggal Terbit Legalitas Lahan',
    'Luas Lahan Sesuai Legalitas (Ha)',
    'Luas Lahan (Ha)',
    'Tanggal Terbit Rekomtek',
    'Tahun Terbit Rekomtek',
  ];

  const rekomtekDateInfo = resolveRekomtekDateInfo(proposal);
  const items = normalizePekebunLahans(context);
  const rows: Array<Array<{ val: any; type: 'String' | 'Number'; style?: string }>> = [];

  let rowCounter = 1;

  for (const item of items) {
    const p = item.pekebun || {};
    const l = item.lahan || {};

    const namaPekebun = p.name || p.nama || p.namaPekebun || '-';
    const nik = String(p.nik || p.NIK || '-');
    const kk = String(p.nomor_kk || p.nomorKK || p.kk || '-');
    const alamat = p.address || p.alamat || '-';

    const jenisLegalitas = l.jenis_legalitas || l.jenisLegalitas || l.jenisHakLahan || '-';
    const nomorDokumen = l.nomor_legalitas || l.nomorLegalitas || l.nomorSuratLahan || '-';
    const tanggalTerbit = formatDateIndo(l.tanggal_penerbitan_legalitas || l.tanggalPenerbitanLegalitas || l.tglPenerbitan);
    const luasLegalitas = Number(l.luas_lahan_legalitas ?? l.luas_lahan ?? l.luasLahan ?? l.luasLahanHektar ?? 0);
    const luasPengajuan = Number(l.luas_lahan ?? l.luasLahan ?? l.luasLahanHektar ?? 0);

    rows.push([
      { val: rowCounter++, type: 'Number', style: 'CenterCell' },
      { val: namaPekebun, type: 'String' },
      { val: nik, type: 'String', style: 'CenterCell' },
      { val: kk, type: 'String', style: 'CenterCell' },
      { val: alamat, type: 'String' },
      { val: jenisLegalitas, type: 'String', style: 'CenterCell' },
      { val: nomorDokumen, type: 'String', style: 'CenterCell' },
      { val: tanggalTerbit, type: 'String', style: 'CenterCell' },
      { val: luasLegalitas.toFixed(2), type: 'Number', style: 'NumberCell' },
      { val: luasPengajuan.toFixed(2), type: 'Number', style: 'NumberCell' },
      { val: rekomtekDateInfo.tanggalFormatted, type: 'String', style: 'CenterCell' },
      { val: rekomtekDateInfo.tahun, type: 'String', style: 'CenterCell' },
    ]);
  }

  const xmlContent = generateXmlSpreadsheet('Profil Pekebun', headers, rows);

  const cleanNoProp = String(nomorProposal).replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = customFilename || `Laporan_Profil_Pekebun_${cleanNoProp}_${dateStr}.xls`;

  triggerFileDownload(xmlContent, filename);
  return xmlContent;
}
