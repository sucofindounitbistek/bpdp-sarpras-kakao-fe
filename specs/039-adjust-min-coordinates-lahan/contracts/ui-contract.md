# UI & Integration Contract: Adjust Minimum Land Coordinates

## Data Contracts

### Frontend State and Schema
The `coordinates` array for land boundaries is stored as an array of objects inside the land form data:

```typescript
interface CoordinatePoint {
  lat: number;
  lng: number;
}
```

### Validation Constraints
1. **Minimum Length**: Must contain at least `3` items.
2. **Format**: Serialized as a JSON string when submitted (or directly mapped depending on the form context).
3. **Compatibility**: The coordinate points map directly to Leaflet `LatLng` arrays `[number, number][]` for rendering.
