// Mock document viewer — membuka berkas (fileName) sebagai PDF yang dapat dilihat langsung (client-simulated).
// Backend belum menyediakan endpoint file (lihat specs/074-penyaluran-pencairan-dana/contracts/backend-api.md),
// jadi PDF sederhana di-generate on-the-fly di browser tanpa dependency tambahan.
// Saat backend siap, ganti openMockPdf dengan window.open(fileUrl) dari respons API.

interface PdfLine {
  text: string;
  size: number;
  bold?: boolean;
  gapBefore?: number;
}

export interface MockDocContext {
  judul?: string;
  subjudul?: string;
  aktor?: string;
  waktu?: string;
}

function asciiSafe(s: string): string {
  return s.replace(/[^\x20-\x7E]/g, '?');
}

function esc(s: string): string {
  return asciiSafe(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(text: string, size: number, maxWidth = 460): string[] {
  const maxChars = Math.max(Math.floor(maxWidth / (size * 0.52)), 10);
  const words = asciiSafe(text).split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) lines.push(current);
      let rest = word;
      while (rest.length > maxChars) {
        lines.push(rest.slice(0, maxChars));
        rest = rest.slice(maxChars);
      }
      current = rest;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildContentStream(lines: PdfLine[]): string {
  let y = 790;
  let stream = '';
  for (const line of lines) {
    y -= line.gapBefore ?? 0;
    for (const chunk of wrapText(line.text, line.size)) {
      stream += `BT /${line.bold ? 'F2' : 'F1'} ${line.size} Tf 60 ${y} Td (${esc(chunk)}) Tj ET\n`;
      y -= line.size + 7;
    }
  }
  return stream;
}

function buildPdfBytes(lines: PdfLine[]): Uint8Array {
  const content = buildContentStream(lines);
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}

const urlCache = new Map<string, string>();

function mockPdfLines(fileName: string, context: MockDocContext = {}): PdfLine[] {
  return [
    { text: context.judul ?? 'Dokumen Penyaluran & Pencairan Dana', size: 16, bold: true },
    ...(context.subjudul ? [{ text: context.subjudul, size: 11, gapBefore: 4 } as PdfLine] : []),
    { text: 'Nama Berkas', size: 9, gapBefore: 18 },
    { text: fileName, size: 12, bold: true, gapBefore: 2 },
    ...(context.aktor ? [{ text: `Diunggah oleh: ${context.aktor}`, size: 9, gapBefore: 12 } as PdfLine] : []),
    ...(context.waktu ? [{ text: `Waktu unggah: ${new Date(context.waktu).toLocaleString('id-ID')}`, size: 9 } as PdfLine] : []),
    { text: `Diakses: ${new Date().toLocaleString('id-ID')}`, size: 9, gapBefore: 4 },
    { text: 'Catatan: dokumen ini merupakan mockup (client-simulated) — pratinjau digenerate otomatis.', size: 8, gapBefore: 24 },
    { text: 'Berkas asli akan dilayani backend ketika endpoint dokumen tersedia.', size: 8 },
  ];
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Data URL PDF mock — cocok untuk <iframe>/<a href> (dipakai DocumentPreviewModal). */
export function buildMockPdfDataUrl(fileName: string, context: MockDocContext = {}): string {
  const cacheKey = `${fileName}|${JSON.stringify(context)}`;
  let url = urlCache.get(cacheKey);
  if (!url) {
    url = `data:application/pdf;base64,${toBase64(buildPdfBytes(mockPdfLines(fileName, context)))}`;
    urlCache.set(cacheKey, url);
  }
  return url;
}

/** Buka PDF mock di tab baru (fallback bila modal tidak dipakai). */
export function openMockPdf(fileName: string, context: MockDocContext = {}): void {
  window.open(buildMockPdfDataUrl(fileName, context), '_blank', 'noopener');
}
