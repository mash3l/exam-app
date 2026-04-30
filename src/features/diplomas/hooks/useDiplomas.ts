import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DiplomasResponse } from "@/features/diplomas/types";

export const useDiplomas = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["diplomas", page, limit],
    queryFn: async (): Promise<DiplomasResponse> => {
      const response = await api.get("/api/diplomas", {
        params: { page, limit },
      });

      // API shape: { status, code, payload: { data: Diploma[], pagination } }
      return response.data?.payload ?? response.data;
    },
  });
};
