# Research & Decisions: Verifikasi Pekebun Submit All at End

## Deferring Validation Calls

### Decision
Do not call `bulkFarmerValidations` and `bulkLandValidations` when transitioning from Step 1 to Step 3. Instead, construct the validation payloads in Step 4 and submit them sequentially before updating proposal status.

### Rationale
- **Consistency**: The entire Kabupaten verification is a single transaction. It is completed only when the proposal is either approved (submitted to Provinsi) or rejected (returned to cooperative).
- **Network Efficiency**: Reduces redundant requests during step transitions.
- **Improved UX**: Step transition is instant, avoiding loading delays.

### Alternatives Considered

#### Alternative A: Auto-save on check change
- **Pros**: Immediate persistence.
- **Cons**: High API traffic, risk of partial/incoherent state on server if session is closed mid-way.
- **Status**: Rejected.

#### Alternative B: Independent "Save" button per step
- **Pros**: Clear action feedback.
- **Cons**: Breaks the wizard flow concept where the final submit is the single point of truth.
- **Status**: Rejected.
