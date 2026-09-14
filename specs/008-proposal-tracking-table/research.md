# Research & Technical Decisions: Proposal Tracking Table

## 1. Chosen Architecture: In-Place View Toggle

We will implement an in-place view toggle within `TrackingPengusulanView.vue` using a reactive reference variable:

```typescript
const selectedProposalId = ref<string | null>(null);
const selectedProposal = computed(() => store.listPengajuan.find((p) => p.id === selectedProposalId.value));
```

### Rationale

- **Simplicity (YAGNI)**: A single-page state toggle avoids adding complexity to `router/index.ts` and having to write custom navigation guards or access controls.
- **State Preservation**: The user's search query and status/package filters are preserved in memory when they toggle to the detail view and back, creating a fluid user experience.
- **Zero API Overheads**: All required proposal details (CPCL count, documents, budget, timeline status) are already pre-loaded inside `store.listPengajuan`, so there's no need to design additional detail fetching endpoints.

## 2. Table Column Design

The table will display the following columns:

1. **Nomor Resi**: Monospaced font for readability.
2. **Kelembagaan Pekebun**: Clean, readable styling showing the cooperative/lembaga name.
3. **Paket Usulan**: Short label representing the selected package.
4. **Total Anggaran**: Format currency using `toLocaleString('id-ID')` with a monospaced font.
5. **Status**: Styled with badge severity colors.
6. **Aksi**: Prominent action button ("Detail" or "Lihat Detail") to open the detailed view.

## 3. Responsiveness Strategy (Mobile-First)

Following Constitution VII, the table will be wrapped in a responsive wrapper:

- On desktop/tablet screen sizes, a scroll-free table is displayed.
- On smaller viewports (< 768px), the table container wraps in `overflow-x-auto` to allow horizontal scrolling without breaking the layout.
- Touch targets on buttons (Aksi, filter selects) will be kept at least 44x44px.

## 4. Alternatives Considered

- **Separate Detail Route (`/pengusulan/pengajuan-proposal/:id`)**: Rejected as it adds routing overhead and page reload lag, which is unnecessary since all mock data is client-side.
- **Detail Modal Popup**: Rejected because the proposal detail contains heavy items (5-step timeline, 3 columns of data, list of documents) that would look cramped in a modal and degrade the user experience.
