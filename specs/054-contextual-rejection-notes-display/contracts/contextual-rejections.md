# Interface Contract: Contextual Rejection Notes Display

## Helper Function Contract

`src/lib/parseRejectionNotes.ts`:

```typescript
export function parseRejectionNotes(catatanRaw: string): ParsedRejectionNote[] {
  if (!catatanRaw || !catatanRaw.trim()) return [];
  const lines = catatanRaw.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      return { category: 'PROPOSAL_DOC', targetKey: 'general', itemLabel: 'Catatan General', notes: line };
    }
    const header = line.substring(0, colonIdx).trim();
    const notes = line.substring(colonIdx + 1).trim();

    if (header.includes('-')) {
      const parts = header.split('-').map((s) => s.trim());
      return { category: 'PEKEBUN', targetKey: header, farmerName: parts[0], itemLabel: parts[1], notes };
    }
    if (header.startsWith('Gudang')) {
      return { category: 'GUDANG', targetKey: header, itemLabel: header, notes };
    }
    if (header.startsWith('RAB')) {
      return { category: 'RAB', targetKey: header, itemLabel: header, notes };
    }
    return { category: 'PROPOSAL_DOC', targetKey: header, itemLabel: header, notes };
  });
}
```
