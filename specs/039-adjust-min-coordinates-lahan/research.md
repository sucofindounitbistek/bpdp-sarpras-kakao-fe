# Research & Technical Decisions: Adjust Minimum Land Coordinates

## Findings & Audit

An audit of the codebase was conducted to find all validation checks for the number of coordinate points of a land boundary polygon.

1. **Zod Validation Schemas**:
   - `src/schemas/pekebun.schema.ts` (`lahanPekebunSchema`): Enforces `.min(3, 'Minimal 3 titik koordinat diperlukan')` on the `coordinates` field.
   - `src/schemas/pengusulan.schema.ts` (`cpclSchema`): Validates coordinates by parsing `koordinatPoligon` and invoking `validateCoordinatePolygon`.

2. **Validation Utilities**:
   - `src/lib/coordinatePolygon.ts` (`validateCoordinatePolygon`): Enforces `completePoints.length < 3` to raise a validation message. Self-intersection (`hasSelfIntersection`) is checked only if points count is 4 or more, which is mathematically correct as a triangle cannot self-intersect.

3. **User Interface (`StepDataLahanPekebun.vue` & `StepDataCPCL.vue`)**:
   - In `StepDataLahanPekebun.vue`, helper texts state that a minimum of 3 points are required:
     - Line 886: `"Pratinjau poligon akan terbentuk setelah minimal 3 titik koordinat dimasukkan."`
   - In `StepDataCPCL.vue`, helper texts state:
     - Line 313: `"Masukkan minimal 3 titik koordinat latitude & longitude."`
     - Line 412: `"Pratinjau poligon akan terbentuk setelah minimal 3 titik koordinat dimasukkan."`

4. **Conclusion**:
   - The codebase already enforces a minimum of 3 coordinates across all schemas and utilities.
   - No code or logic enforces 4 coordinates as a minimum limit.
   - To fully fulfill the user request and align with the Constitution (Principle XV), we will ensure that:
     - Any hardcoded Indonesian strings in the UI components (like `StepDataLahanPekebun.vue`) regarding the coordinate limit are externalized to `src/config/localization.ts`.

## Decisions

### Decision 1: Keep Minimum Coordinate Limit at 3
- **Choice**: Keep the minimum limit at 3 points.
- **Rationale**: 3 points is the absolute mathematical minimum required to form a polygon (a triangle). Enforcing a minimum of 3 is correct.
- **Alternatives Considered**: Require 4 points (rejected because triangular land parcels exist and must be supportable).

### Decision 2: Externalize UI strings to Localization Config
- **Choice**: Refactor any hardcoded coordinate limit copy in `StepDataLahanPekebun.vue` to load from `src/config/localization.ts`.
- **Rationale**: Compliance with Constitution Principle XV (Mandatory Localization).
- **Alternatives Considered**: Keep hardcoded strings (rejected as it violates the project constitution).
