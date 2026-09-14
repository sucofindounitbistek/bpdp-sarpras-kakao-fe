import { formatDocumentTypeLabel, EXCLUDED_VERIFIER_DOC_TYPES } from './formatDocumentType';

export interface ParsedRejectionNote {
  category: 'PEKEBUN' | 'PROPOSAL_DOC' | 'GUDANG' | 'RAB';
  targetKey: string;
  farmerName?: string;
  itemLabel: string;
  notes: string;
}

export function parseRejectionNotes(catatanRaw?: string | null): ParsedRejectionNote[] {
  if (!catatanRaw || !catatanRaw.trim()) return [];
  const lines = catatanRaw.split('\n').map((l) => l.trim()).filter(Boolean);

  const parsed: ParsedRejectionNote[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      parsed.push({ category: 'PROPOSAL_DOC', targetKey: 'general', itemLabel: 'Catatan Revisi Umum', notes: line });
      continue;
    }

    const header = line.substring(0, colonIdx).trim();
    const notes = line.substring(colonIdx + 1).trim();

    const upperHeader = header.toUpperCase();
    if (EXCLUDED_VERIFIER_DOC_TYPES.some((ex) => upperHeader.includes(ex))) {
      // Exclude verifier-only internal document notes
      continue;
    }

    if (header.includes('-')) {
      const parts = header.split('-').map((s) => s.trim());
      parsed.push({
        category: 'PEKEBUN',
        targetKey: header,
        farmerName: parts[0],
        itemLabel: formatDocumentTypeLabel(parts[1] || header),
        notes,
      });
    } else if (header.startsWith('Gudang')) {
      parsed.push({ category: 'GUDANG', targetKey: header, itemLabel: header, notes });
    } else if (header.startsWith('RAB')) {
      parsed.push({ category: 'RAB', targetKey: header, itemLabel: formatDocumentTypeLabel(header), notes });
    } else {
      parsed.push({
        category: 'PROPOSAL_DOC',
        targetKey: header,
        itemLabel: formatDocumentTypeLabel(header),
        notes,
      });
    }
  }

  return parsed;
}
