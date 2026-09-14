# Data Model & Interfaces: Adjust Minimum Land Coordinates

## Entities

### `LahanPekebun` (Land Record)
Represents the land details submitted for a pekebun in Master Data Pekebun.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `coordinates` | `Array<{ lat: number, lng: number }>` | List of boundary coordinate points | Must have at least 3 points. Each point must have valid latitude (-90 to 90) and longitude (-180 to 180). Points must not contain duplicates. |

## Validation Rules

### Zod Schema Validation (`lahanPekebunSchema`)
```typescript
coordinates: z
  .array(
    z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  )
  .min(3, 'Minimal 3 titik koordinat diperlukan')
```

### Spatial Polygon Validation (`validateCoordinatePolygon`)
- **Valid Polygon**: `points.length >= 3`
- **Self-Intersection Check**: `points.length >= 4 && hasSelfIntersection(points)` (since triangles cannot self-intersect, this rule only applies to 4 or more points).
