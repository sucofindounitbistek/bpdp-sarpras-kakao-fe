# Research: NIK Lookup Updates Alamat and Kodepos

## Decisions

### 1. Extending DukcapilResult Type
- **Decision**: Add optional `alamat?: string` and `kodepos?: string` to `DukcapilResult` in `src/types/pekebun.ts`.
- **Rationale**: Keeps the model flexible without forcing updates to other potential uses of Dukcapil lookup.

### 2. Alignment of Mock Dukcapil Registry with Registered Master Data
- **Decision**: Update `MOCK_DUKCAPIL` records in `src/stores/pekebun.ts` to hold matching address values matching actual master registered pekebun objects where applicable.
- **Rationale**: Keeps mock data consistent when testing.

## References

- [FormPekebunView.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/master-data/FormPekebunView.vue)
- [pekebun.ts (Store)](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/stores/pekebun.ts)
- [pekebun.ts (Types)](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/types/pekebun.ts)
