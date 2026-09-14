import shp, { parseShp, parseDbf, combine } from 'shpjs';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { area as turfArea } from '@turf/turf';

// One bidang (parcel polygon) extracted from an uploaded STDB shapefile.
export interface ImportedBidang {
  coordinates: { lat: number; lng: number }[];
  luasHa: number;
}

// Rough bounding box of Indonesia — imported STDB parcels must fall inside it;
// coordinates far outside almost always mean a projected shapefile that is
// missing its .prj sidecar.
const INDONESIA_LAT: [number, number] = [-11.5, 6.5];
const INDONESIA_LNG: [number, number] = [94.5, 141.5];

const EPSILON = 1e-9;

function samePoint(a: [number, number], b: [number, number]): boolean {
  return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;
}

// Converts a closed GeoJSON ring ([lng, lat] positions) to app coordinates
// ({lat, lng}), dropping the duplicate closing point and consecutive
// duplicates. Returns null when fewer than 3 unique points remain.
function ringToCoords(ring: [number, number][]): { lat: number; lng: number }[] | null {
  const coords: { lat: number; lng: number }[] = [];
  for (const pos of ring) {
    const prev = coords[coords.length - 1];
    if (!prev || !samePoint([prev.lng, prev.lat], pos)) {
      coords.push({ lat: pos[1], lng: pos[0] });
    }
  }
  if (coords.length >= 2 && samePoint([coords[0].lng, coords[0].lat], [coords[coords.length - 1].lng, coords[coords.length - 1].lat])) {
    coords.pop();
  }
  return coords.length >= 3 ? coords : null;
}

// Polygon area in hectares computed from the raw GeoJSON ring (turf closes
// the ring itself), rounded to 4 decimals to match the luas field step.
function ringAreaHa(ring: [number, number][]): number {
  const m2 = turfArea({
    type: 'Polygon',
    coordinates: [ring],
  } as Geometry);
  return Math.round((m2 / 10000) * 10000) / 10000;
}

function isWithinIndonesia(coords: { lat: number; lng: number }[]): boolean {
  return coords.every(
    (c) => c.lat >= INDONESIA_LAT[0] && c.lat <= INDONESIA_LAT[1] && c.lng >= INDONESIA_LNG[0] && c.lng <= INDONESIA_LNG[1],
  );
}

// Extracts one bidang per outer ring (Polygon → 1, MultiPolygon → N).
// Ignores holes, points and lines.
export function extractBidangsFromGeoJson(input: FeatureCollection | FeatureCollection[]): ImportedBidang[] {
  const collections = Array.isArray(input) ? input : [input];
  const bidangs: ImportedBidang[] = [];

  for (const fc of collections) {
    for (const feature of fc.features || []) {
      const geometry = (feature as Feature).geometry;
      if (!geometry) continue;

      let rings: [number, number][][] = [];
      if (geometry.type === 'Polygon') {
        rings = [geometry.coordinates[0] as [number, number][]];
      } else if (geometry.type === 'MultiPolygon') {
        rings = geometry.coordinates.map((polygon) => polygon[0] as [number, number][]);
      } else {
        continue;
      }

      for (const ring of rings) {
        const coordinates = ringToCoords(ring);
        if (!coordinates) continue;

        if (!isWithinIndonesia(coordinates)) {
          throw new Error(
            'Koordinat poligon berada di luar wilayah Indonesia — kemungkinan file .prj (proyeksi) tidak disertakan. Sertakan .prj di dalam zip atau unggah bersama file .shp.',
          );
        }

        bidangs.push({ coordinates, luasHa: ringAreaHa(ring) });
      }
    }
  }

  if (bidangs.length === 0) {
    throw new Error('Tidak ada poligon (bidang) yang bisa dibaca dari file shapefile. Pastikan file berisi geometri Polygon.');
  }

  return bidangs;
}

function findFile(files: File[], ext: string): File | undefined {
  return files.find((f) => f.name.toLowerCase().endsWith(`.${ext}`));
}

// Parses an STDB shapefile upload. Accepts either a .zip containing the
// shapefile bundle (.shp/.shx/.dbf/.prj) or the loose files selected together
// (.shp required; .dbf and .prj optional sidecars).
export async function parseShapefileUpload(files: File[]): Promise<ImportedBidang[]> {
  const zip = findFile(files, 'zip');
  if (zip) {
    const geojson = await shp(await zip.arrayBuffer());
    return extractBidangsFromGeoJson(geojson as FeatureCollection | FeatureCollection[]);
  }

  const shpFile = findFile(files, 'shp');
  if (!shpFile) {
    throw new Error('Unggah file .zip (berisi .shp/.shx/.dbf/.prj) atau pilih file .shp beserta file pendampingnya.');
  }

  const prjFile = findFile(files, 'prj');
  const dbfFile = findFile(files, 'dbf');

  const geometries = parseShp(await shpFile.arrayBuffer(), prjFile ? await prjFile.text() : undefined);
  const properties = dbfFile ? parseDbf(await dbfFile.arrayBuffer(), undefined as any) : [];
  const geojson = combine([geometries, properties]);

  return extractBidangsFromGeoJson(geojson);
}
