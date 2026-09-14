import { describe, it, expect } from 'vitest';
import { extractBidangsFromGeoJson } from '@/lib/shapefileImport';
import type { FeatureCollection } from 'geojson';

const fc = (geometries: any[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features: geometries.map((geometry) => ({ type: 'Feature', geometry, properties: {} })),
});

// Closed 0.01° square near Luwu, Sulawesi (~123 ha)
const squareRing = (lng0: number, lat0: number): [number, number][] => [
  [lng0, lat0],
  [lng0 + 0.01, lat0],
  [lng0 + 0.01, lat0 - 0.01],
  [lng0, lat0 - 0.01],
  [lng0, lat0],
];

describe('extractBidangsFromGeoJson', () => {
  it('converts a closed polygon ring to lat/lng coords without the duplicate closing point', () => {
    const [bidang] = extractBidangsFromGeoJson(fc([{ type: 'Polygon', coordinates: [squareRing(120.31, -2.58)] }]));

    expect(bidang.coordinates).toHaveLength(4);
    expect(bidang.coordinates[0].lat).toBeCloseTo(-2.58, 10);
    expect(bidang.coordinates[0].lng).toBeCloseTo(120.31, 10);
    expect(bidang.coordinates[2].lat).toBeCloseTo(-2.59, 10);
    expect(bidang.coordinates[2].lng).toBeCloseTo(120.32, 10);
  });

  it('computes polygon area in hectares', () => {
    const [bidang] = extractBidangsFromGeoJson(fc([{ type: 'Polygon', coordinates: [squareRing(120.31, -2.58)] }]));

    // 0.01° square around Sulawesi ≈ 1.235 km² ≈ 123.5 ha
    expect(bidang.luasHa).toBeGreaterThan(120);
    expect(bidang.luasHa).toBeLessThan(127);
    // Rounded to 4 decimals (luas field step)
    expect(Number(bidang.luasHa.toFixed(4))).toBe(bidang.luasHa);
  });

  it('creates one bidang per polygon part of a MultiPolygon', () => {
    const bidangs = extractBidangsFromGeoJson(
      fc([
        {
          type: 'MultiPolygon',
          coordinates: [[squareRing(120.31, -2.58)], [squareRing(120.5, -2.7)]],
        },
      ]),
    );

    expect(bidangs).toHaveLength(2);
    expect(bidangs[1].coordinates[0]).toEqual({ lat: -2.7, lng: 120.5 });
  });

  it('skips non-polygon geometries and throws when nothing remains', () => {
    expect(() => extractBidangsFromGeoJson(fc([{ type: 'Point', coordinates: [120.31, -2.58] }, { type: 'LineString', coordinates: [[120, -2], [121, -3]] }]))).toThrow(
      'Tidak ada poligon (bidang) yang bisa dibaca dari file shapefile',
    );
  });

  it('throws a .prj hint when coordinates fall outside Indonesia', () => {
    // Raw UTM-style coordinates (projected CRS without .prj)
    const utmSquare: [number, number][] = [
      [500000, 9000000],
      [501000, 9000000],
      [501000, 8999000],
      [500000, 8999000],
      [500000, 9000000],
    ];

    expect(() => extractBidangsFromGeoJson(fc([{ type: 'Polygon', coordinates: [utmSquare] }]))).toThrow('.prj');
  });

  it('skips degenerate rings with fewer than 3 unique points', () => {
    const degenerate: [number, number][] = [
      [120.31, -2.58],
      [120.32, -2.58],
      [120.31, -2.58],
    ];

    expect(() => extractBidangsFromGeoJson(fc([{ type: 'Polygon', coordinates: [degenerate] }]))).toThrow('Tidak ada poligon');
  });
});
