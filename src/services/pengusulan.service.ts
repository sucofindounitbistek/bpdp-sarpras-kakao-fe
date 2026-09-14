import { proposalService, ProposalListQueryParams } from './proposal.service';
import type {
  CreateProposalPayload,
  UpdateProposalPayload,
  ListProposalDocumentValidationQueryParams,
} from '@/types/pengusulan';

export { proposalService };

export const pengusulanService = {
  async getList(params?: ProposalListQueryParams) {
    return proposalService.getList(params);
  },

  async getById(id: string | number) {
    return proposalService.getById(id);
  },

  async submitNew(payload: CreateProposalPayload) {
    return proposalService.create(payload);
  },

  async updateProposal(id: string | number, payload: UpdateProposalPayload) {
    return proposalService.update(id, payload);
  },

  async deleteProposal(id: string | number) {
    return proposalService.delete(id);
  },

  async getProposalDocumentValidations(params?: ListProposalDocumentValidationQueryParams) {
    return proposalService.getProposalDocumentValidations(params);
  },
};
