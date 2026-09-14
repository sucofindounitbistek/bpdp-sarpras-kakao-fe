import type { CoordinatePoint, LandBoundaryPolygon } from '@/types/pengusulan';

export const emptyCoordinatePoint = (order: number): CoordinatePoint => ({
  order,
  lat: null,
  lng: null,
});

export const parseCoordinatePolygon = (value: string): CoordinatePoint[] => {
  if (!value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as Array<{ latitude?: number; longitude?: number } | [number, number]>;
    if (Array.isArray(parsed)) {
      return parsed
        .map((point, index) => {
          const lat = Array.isArray(point) ? point[0] : point.latitude;
          const lng = Array.isArray(point) ? point[1] : point.longitude;
          return {
            order: index + 1,
            lat: Number.isFinite(lat) ? Number(lat) : null,
            lng: Number.isFinite(lng) ? Number(lng) : null,
          };
        })
        .filter((point) => point.lat !== null || point.lng !== null);
    }
  } catch {
    // Fall back to legacy "lat,lng; lat,lng" style values.
  }

  return value
    .split(';')
    .map((part, index) => {
      const [lat, lng] = part.split(',').map((item) => Number(item.trim()));
      return {
        order: index + 1,
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
      };
    })
    .filter((point) => point.lat !== null || point.lng !== null);
};

export const serializeCoordinatePolygon = (points: CoordinatePoint[]): string =>
  JSON.stringify(
    points.map((point) => ({
      lat: point.lat,
      lng: point.lng,
    })),
  );

export const coordinateKey = (point: CoordinatePoint): string => `${point.lat?.toFixed(8) ?? ''},${point.lng?.toFixed(8) ?? ''}`;

const orientation = (a: CoordinatePoint, b: CoordinatePoint, c: CoordinatePoint) => (b.lng! - a.lng!) * (c.lat! - a.lat!) - (b.lat! - a.lat!) * (c.lng! - a.lng!);

const segmentsIntersect = (a: CoordinatePoint, b: CoordinatePoint, c: CoordinatePoint, d: CoordinatePoint) => {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);

  return abC * abD < 0 && cdA * cdB < 0;
};

const hasSelfIntersection = (points: CoordinatePoint[]) => {
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    for (let j = i + 1; j < points.length; j += 1) {
      const isAdjacent = Math.abs(i - j) <= 1 || (i === 0 && j === points.length - 1);
      if (isAdjacent) continue;

      const c = points[j];
      const d = points[(j + 1) % points.length];
      if (segmentsIntersect(a, b, c, d)) return true;
    }
  }

  return false;
};

export const validateCoordinatePolygon = (points: CoordinatePoint[]): LandBoundaryPolygon => {
  const validationMessages: string[] = [];
  const completePoints = points.filter((point) => point.lat !== null && point.lng !== null);

  points.forEach((point) => {
    if (point.lat === null || point.lng === null) {
      validationMessages.push(`Titik ${point.order}: Lengkapi latitude dan lng pada titik koordinat ini.`);
      return;
    }

    if (point.lat < -90 || point.lat > 90) {
      validationMessages.push(`Titik ${point.order}: Latitude harus berada antara -90 dan 90.`);
    }

    if (point.lng < -180 || point.lng > 180) {
      validationMessages.push(`Titik ${point.order}: Longitude harus berada antara -180 dan 180.`);
    }
  });

  if (completePoints.length < 4) {
    validationMessages.push('Minimal 4 titik koordinat diperlukan untuk membuat poligon lahan.');
  }

  const seen = new Set<string>();
  completePoints.forEach((point) => {
    const key = coordinateKey(point);
    if (seen.has(key)) validationMessages.push(`Titik ${point.order}: Titik koordinat tidak boleh duplikat.`);
    seen.add(key);
  });

  if (completePoints.length >= 4 && hasSelfIntersection(completePoints)) {
    validationMessages.push('Urutan titik koordinat belum membentuk poligon lahan yang valid.');
  }

  return {
    points: completePoints,
    isValid: validationMessages.length === 0,
    validationMessages,
  };
};
