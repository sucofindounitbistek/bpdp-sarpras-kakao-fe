# Data Model: BPDP Verifikator UI Simplification (037-remove-layak-options-bpdp)

## UI Template State Transformation

```mermaid
graph TD
    A[All 4 Verification Items Checked & Valid] --> B[Direct Report Generation & Download]
    B --> C[Upload Signed Report Document]
    C --> D[Submit to BPDP Approval]
```

*Note*: Radio inputs for `Layak / Tidak Layak` are removed from the DOM template.
