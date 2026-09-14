// Generator dokumen: Modul Penyaluran & Pencairan Dana
// Pola: HTML client-side → cetak PDF (window.print) & unduh Word-ready (.doc) — mengikuti utils/permohonanPdfGenerator.ts.
import { formatRupiah } from '@/utils/exportProposal';
import type { KopSuratB, Pencairan, PencairanTahap } from '@/types/penyaluranDana';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function baseStyles(): string {
  return `
    <style>
      body { font-family: 'Times New Roman', serif; color: #0f172a; margin: 32px; font-size: 12pt; line-height: 1.5; }
      .kop { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
      .kop h2 { margin: 0; font-size: 16pt; text-transform: uppercase; }
      .kop p { margin: 2px 0; font-size: 10pt; }
      h3.judul { text-align: center; font-size: 13pt; text-decoration: underline; margin: 18px 0; }
      table { border-collapse: collapse; width: 100%; font-size: 11pt; }
      th, td { border: 1px solid #334155; padding: 6px 8px; vertical-align: top; }
      th { background: #f1f5f9; text-align: left; }
      .right { text-align: right; }
      .ttd { margin-top: 36px; display: flex; justify-content: space-between; }
      .ttd .blok { width: 40%; text-align: center; }
      .kecil { font-size: 9pt; color: #475569; }
    </style>
  `;
}

function renderKopB(kop: KopSuratB, judulSurat: string): string {
  return `
    <div class="kop">
      <h2>${escapeHtml(kop.namaKp)}</h2>
      <p>Telp: ${escapeHtml(kop.telpKantor)} — Email: ${escapeHtml(kop.emailKantor)}</p>
      <p class="kecil">SK Dirut No. ${escapeHtml(kop.noSkDirut)} tgl ${escapeHtml(kop.tglSkDirut)} · PKS No. ${escapeHtml(kop.noPks)} tgl ${escapeHtml(kop.tglPks)}</p>
    </div>
    <h3 class="judul">${escapeHtml(judulSurat)}</h3>
  `;
}

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title>${baseStyles()}</head><body>${body}</body></html>`;
}

export function downloadPdf(title: string, bodyHtml: string): void {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(wrapHtml(title, bodyHtml));
  w.document.close();
  w.focus();
  w.print();
}

export function downloadDoc(title: string, bodyHtml: string, fileName: string): void {
  const blob = new Blob(['\ufeff', wrapHtml(title, bodyHtml)], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.doc') ? fileName : `${fileName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- Template Surat Kuasa (US1) ----------
export function generateTemplateSuratKuasaHtml(kop: KopSuratB): string {
  return `
    ${renderKopB(kop, 'Surat Kuasa')}
    <p>Yang bertanda tangan di bawah ini:</p>
    <table>
      <tr><th width="30%">Nama</th><td>........................................</td></tr>
      <tr><th>NIK</th><td>........................................</td></tr>
      <tr><th>Status</th><td>Anggota Kelembagaan Pekebun</td></tr>
    </table>
    <p>memberikan kuasa kepada:</p>
    <table>
      <tr><th width="30%">Nama</th><td>${escapeHtml(kop.namaKetua)} (Ketua KP)</td></tr>
      <tr><th>No. HP</th><td>${escapeHtml(kop.hpKetua)}</td></tr>
    </table>
    <p>untuk dan atas nama pemberi kuasa melakukan tindakan hukum terkait penyaluran dan pencairan dana SARPRAS, termasuk menandatangani dokumen di hadapan <strong>Bank Mitra</strong>, sehubungan dengan SK Dirut No. ${escapeHtml(kop.noSkDirut)}.</p>
    <div class="ttd">
      <div class="blok">Pemberi Kuasa<br/><br/><br/><br/>........................................</div>
      <div class="blok">Penerima Kuasa<br/><br/><br/><br/>${escapeHtml(kop.namaKetua)}</div>
    </div>
  `;
}

// ---------- Dokumen PKS 3 Pihak (US1) ----------
export function generatePks3PihakHtml(kop: KopSuratB, noPks: { kp?: string; bpdp?: string; bank?: string }): string {
  return `
    ${renderKopB(kop, 'Perjanjian Kerjasama (PKS) 3 Pihak')}
    <p>Perjanjian Kerjasama ini dibuat oleh dan antara:</p>
    <table>
      <tr><th width="25%">Pihak Pertama — Kelembagaan Pekebun</th><td>${escapeHtml(kop.namaKp)} — No. PKS: ${escapeHtml(noPks.kp ?? '-')}</td></tr>
      <tr><th>Pihak Kedua — BPDP</th><td>Badan Pengelola Dana Perkebunan — No. PKS: ${escapeHtml(noPks.bpdp ?? '-')}</td></tr>
      <tr><th>Pihak Ketiga — Bank Mitra</th><td>Bank Mitra escrow — No. PKS: ${escapeHtml(noPks.bank ?? '-')}</td></tr>
    </table>
    <p>bertujuan mengatur pelaksanaan penyaluran dan pencairan Dana SARPRAS secara bertahap (40% / 30% / 30%) ke rekening escrow sesuai Peraturan Direktur Utama No. 10 dan No. 11 Pasal 10 ayat (3).</p>
    <p class="kecil">Dokumen ini di-generate sistem sebagai draf; penandatanganan dilakukan secara basah oleh ketiga pihak sesuai jadwal.</p>
    <div class="ttd">
      <div class="blok">Pihak Pertama<br/><br/><br/><br/>${escapeHtml(kop.namaKetua)}</div>
      <div class="blok">Pihak Kedua<br/><br/><br/><br/>BPDP</div>
      <div class="blok">Pihak Ketiga<br/><br/><br/><br/>Bank Mitra</div>
    </div>
  `;
}

// ---------- Surat Permohonan (US2) ----------
export function generateSuratPermohonanHtml(m: Pencairan): string {
  const total = m.divisiItems.reduce((s, d) => s + d.nilaiPermohonan, 0);
  const rows = m.divisiItems
    .map((d, i) => `<tr><td class="right">${i + 1}</td><td>${escapeHtml(d.divisiId)}</td><td class="right">${formatRupiah(d.nilaiPermohonan)}</td></tr>`)
    .join('');
  return `
    ${renderKopB(m.dataGenerated.dataB, 'Surat Permohonan Penyaluran Dana SARPRAS')}
    <p>Nomor: ${escapeHtml(m.nomorPermohonan)}</p>
    <p>Kepada Yth. Direktur Utama BPDP di Tempat.</p>
    <p>Berdasarkan SK Dirut No. ${escapeHtml(m.dataGenerated.dataB.noSkDirut)}, dengan ini kami mengajukan permohonan penyaluran dana SARPRAS dengan rincian:</p>
    <table>
      <tr><th width="55%">Uraian</th><td>${escapeHtml(m.dataGenerated.dataA.namaKp)} — pagu ${formatRupiah(m.dataGenerated.pagu)}, luas ${m.dataGenerated.luasHektar} ha, ${m.dataGenerated.jumlahPekebun} pekebun (${m.dataGenerated.jumlahKK} KK)</td></tr>
      <tr><th>Jenis Pembelian / Peruntukan</th><td>${escapeHtml(m.jenisPembelian)} / ${escapeHtml(m.peruntukan)}</td></tr>
      <tr><th>Rekening Escrow</th><td>${escapeHtml(m.dataGenerated.escrowNoRekening)} (${escapeHtml(m.dataGenerated.escrowBank)})</td></tr>
      <tr><th>Rekening Tujuan</th><td>${escapeHtml(m.rekeningTujuan.nomorRekening)} — ${escapeHtml(m.rekeningTujuan.bankTujuan)} (${escapeHtml(m.rekeningTujuan.skema)})</td></tr>
    </table>
    <h3>Rincian Nilai Permohonan per Divisi</h3>
    <table>
      <tr><th class="right" width="10%">No</th><th>Divisi</th><th class="right">Nilai Permohonan</th></tr>
      ${rows}
      <tr><th colspan="2">TOTAL (auto-generate)</th><th class="right">${formatRupiah(total)}</th></tr>
    </table>
    <div class="ttd">
      <div class="blok">${escapeHtml(m.dataGenerated.jabatanPemohon)}<br/><br/><br/><br/>${escapeHtml(m.dataGenerated.namaPemohon)}</div>
    </div>
  `;
}

// ---------- Surat Berita Acara (US2) ----------
export function generateBeritaAcaraHtml(m: Pencairan): string {
  const total = m.divisiItems.reduce((s, d) => s + d.nilaiPermohonan, 0);
  return `
    ${renderKopB(m.dataGenerated.dataB, 'Surat Berita Acara Barang/Pekerjaan')}
    <p>Nomor: BA-${escapeHtml(m.nomorPermohonan)}</p>
    <p>Pada hari ini telah dilakukan pemeriksaan barang/pekerjaan atas permohonan pencairan dana SARPRAS No. ${escapeHtml(m.nomorPermohonan)} dengan total nilai ${formatRupiah(total)} dan dinyatakan <strong>SESUAI</strong> dengan dokumen pendukung (Dokumen D) yang diajukan.</p>
    <div class="ttd">
      <div class="blok">Ketua KP<br/><br/><br/><br/>${escapeHtml(m.dataGenerated.namaPemohon)}</div>
      <div class="blok">Mengetahui<br/><br/><br/><br/>BPDP</div>
    </div>
  `;
}

// ---------- Surat Persetujuan Pencairan Dana (US4) ----------
export function generateSuratPersetujuanHtml(m: Pencairan, t: PencairanTahap, nomorSurat: string): string {
  return `
    <div class="kop">
      <h2>Badan Pengelola Dana Perkebunan</h2>
      <p class="kecil">Menyatakan persetujuan pencairan dana SARPRAS</p>
    </div>
    <h3 class="judul">Surat Persetujuan Pencairan Dana</h3>
    <p>Nomor: ${escapeHtml(nomorSurat)}</p>
    <table>
      <tr><th width="35%">ID Penyaluran</th><td>${escapeHtml(t.idPenyaluran)} (Tahap ${t.tahap} — ${t.persen * 100}%)</td></tr>
      <tr><th>Permohonan</th><td>${escapeHtml(m.nomorPermohonan)} — ${escapeHtml(m.dataGenerated.dataA.namaKp)}</td></tr>
      <tr><th>Nominal Disetujui</th><td>${formatRupiah(t.nominal)}</td></tr>
      <tr><th>Rekening Escrow</th><td>${escapeHtml(m.dataGenerated.escrowNoRekening)} (${escapeHtml(m.dataGenerated.escrowBank)})</td></tr>
    </table>
    <p>Sehubungan telah lengkapnya verifikasi dokumen (rantai SCI dan approval BPDP), pencairan dana pada tahap di atas disetujui untuk diproses.</p>
    <div class="ttd"><div class="blok">Direktur Utama BPDP<br/><br/><br/><br/>........................................</div></div>
  `;
}

// ---------- Surat Pemberitahuan Pengembalian Dana + SK Pembatalan (US6) ----------
export function generateSuratPemberitahuanPengembalianHtml(m: Pencairan | undefined, proposalId: string): string {
  const namaKp = m?.dataGenerated.dataA.namaKp ?? proposalId;
  return `
    <div class="kop"><h2>Badan Pengelola Dana Perkebunan</h2></div>
    <h3 class="judul">Surat Pemberitahuan Pengembalian Dana</h3>
    <p>Sehubungan permohonan pengembalian dana dari ${escapeHtml(namaKp)} (proposal ${escapeHtml(proposalId)}) yang telah diteliti dan dinyatakan <strong>Lengkap dan Sesuai</strong>, dengan ini diberitahukan bahwa pengembalian dana wajib dilakukan ke rekening sebagaimana ditetapkan.</p>
    <div class="ttd"><div class="blok">Direktur Utama BPDP<br/><br/><br/><br/>........................................</div></div>
  `;
}

export function generateSkPembatalanHtml(m: Pencairan | undefined, proposalId: string): string {
  const namaKp = m?.dataGenerated.dataA.namaKp ?? proposalId;
  return `
    <div class="kop"><h2>Badan Pengelola Dana Perkebunan</h2></div>
    <h3 class="judul">SK Direktur Utama tentang Pembatalan Penerima Dana</h3>
    <p>Menimbang hasil penelitian atas Surat Permohonan Pengembalian dan Surat Permohonan Penghentian Penerima Dana, Direktur Utama BPDP <strong>memutuskan</strong> membatalkan status ${escapeHtml(namaKp)} (proposal ${escapeHtml(proposalId)}) sebagai Penerima Dana SARPRAS.</p>
    <div class="ttd"><div class="blok">Direktur Utama BPDP<br/><br/><br/><br/>........................................</div></div>
  `;
}
