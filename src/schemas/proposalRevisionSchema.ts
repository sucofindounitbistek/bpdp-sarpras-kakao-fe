import { z } from 'zod';

export const documentReplacementSchema = z.object({
  dokumenProposalId: z.number().positive('ID dokumen proposal wajib diisi'),
  fileId: z.number().positive('File ID baru wajib diisi'),
  documentType: z.string().min(1, 'Tipe dokumen wajib diisi'),
});

export const proposalRevisionSchema = z.object({
  proposalId: z.number().positive('ID proposal wajib diisi'),
  updatedDocuments: z
    .array(documentReplacementSchema)
    .min(1, 'Minimal 1 dokumen yang ditolak harus diperbarui'),
});

export type DocumentReplacementInput = z.infer<typeof documentReplacementSchema>;
export type ProposalRevisionInput = z.infer<typeof proposalRevisionSchema>;
