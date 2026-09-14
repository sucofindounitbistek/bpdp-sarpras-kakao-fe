export interface RejectedProposalDocItem {
  id?: string | number;
  name: string;
  notes: string;
}

export interface RejectedPekebunDetailItem {
  key: string;
  docTypeOrField: string;
  notes: string;
}

export interface GroupedPekebunRejection {
  pekebunId: string | number;
  namaPekebun: string;
  nik?: string;
  items: RejectedPekebunDetailItem[];
}
