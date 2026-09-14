/**
 * Utility to format or resolve uploaded_at timestamp into human-readable format:
 * "12 Sep 2026, 15:19"
 */
export function formatUploadedAt(formatted?: string | null, fallbackIso?: string | null): string {
  if (formatted && formatted.trim()) {
    return formatted.trim();
  }
  if (!fallbackIso || !fallbackIso.trim()) {
    return '';
  }

  const d = new Date(fallbackIso);
  if (isNaN(d.getTime())) {
    return fallbackIso;
  }

  // Format: "12 Sep 2026, 15:19"
  try {
    const day = String(d.getDate()).padStart(2, '0');
    const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });
    const month = monthFormatter.format(d).replace('.', '');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return fallbackIso;
  }
}

/**
 * Resolves the uploader display string combining name and optional timestamp:
 * e.g. "Diunggah oleh Ahmad • 12 Sep 2026, 15:19" or "Diunggah oleh Ahmad"
 */
export function formatDiunggahOleh(uploaderName?: string | null, formattedTime?: string | null): string {
  if (!uploaderName || !uploaderName.trim()) {
    return '';
  }
  let cleanName = uploaderName.trim();
  if (cleanName.toLowerCase().startsWith('diunggah oleh')) {
    cleanName = cleanName.replace(/^diunggah oleh\s*/i, '').trim();
  }
  if (!cleanName) {
    return '';
  }
  const cleanTime = formattedTime ? formattedTime.trim() : '';

  if (cleanTime && !cleanName.includes(cleanTime)) {
    return `Diunggah oleh ${cleanName} • ${cleanTime}`;
  }
  return `Diunggah oleh ${cleanName}`;
}
