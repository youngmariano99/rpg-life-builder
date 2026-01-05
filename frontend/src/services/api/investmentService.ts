import { api } from "@/lib/api-client";
import { IInvestment } from "@/types";

export const investmentService = {
  getAll: async (): Promise<IInvestment[]> => {
    return api.get<IInvestment[]>("/investments");
  },

  create: async (data: Partial<IInvestment>): Promise<IInvestment> => {
    return api.post<IInvestment>("/investments", data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/investments/${id}`);
  }
};