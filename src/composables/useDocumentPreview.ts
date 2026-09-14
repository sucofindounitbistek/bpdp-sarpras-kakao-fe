// useDocumentPreview — composable reusabel untuk pratinjau dokumen (PDF/gambar) via DocumentPreviewModal.
// Prioritas sumber: dataUrl / fileUrl dari backend; bila kosong (data client-simulated),
// otomatis fallback ke mock PDF yang digenerate on-the-fly (mockDocumentViewer).
//
// Pemakaian:
//   const { previewDoc, openDocument, closeDocument } = useDocumentPreview();
//   <DocumentPreviewModal :is-open="!!previewDoc" :title="previewDoc?.title ?? ''"
//     :data-url="previewDoc?.dataUrl ?? ''" :mime-type="previewDoc?.mimeType ?? ''" @close="closeDocument" />
import { ref } from 'vue';
import { buildMockPdfDataUrl, type MockDocContext } from '@/utils/mockDocumentViewer';

export interface DocumentPreviewSource {
  /** Judul pada modal (default: fileName) */
  title?: string;
  /** Data URL / file URL berkas asli dari backend (jika tersedia) */
  dataUrl?: string;
  fileUrl?: string;
  mimeType?: string;
  /** Nama berkas — dipakai untuk mock PDF bila dataUrl/fileUrl kosong */
  fileName?: string;
  /** Metadata tambahan untuk mock PDF (judul, aktor, waktu) */
  context?: MockDocContext;
}

export interface DocumentPreviewState {
  title: string;
  dataUrl: string;
  mimeType: string;
}

function guessMime(url: string): string {
  if (url.startsWith('data:image/')) return url.slice(5, url.indexOf(';'));
  return 'application/pdf';
}

export function useDocumentPreview() {
  const previewDoc = ref<DocumentPreviewState | null>(null);

  function openDocument(source: DocumentPreviewSource): void {
    const realUrl = source.dataUrl || source.fileUrl;
    const url = realUrl || (source.fileName ? buildMockPdfDataUrl(source.fileName, source.context ?? { judul: source.title }) : '');
    if (!url) return;
    previewDoc.value = {
      title: source.title || source.fileName || 'Dokumen',
      dataUrl: url,
      mimeType: source.mimeType || guessMime(url),
    };
  }

  function closeDocument(): void {
    previewDoc.value = null;
  }

  return { previewDoc, openDocument, closeDocument };
}
