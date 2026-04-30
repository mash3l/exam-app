import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const useDiplomaDetails = (diplomaId: string) => {
  return useQuery({
    queryKey: ["diploma-details", diplomaId],
    queryFn: async () => {
      // بنكلم الـ Endpoint بتاع الدبلومة
      const response = await api.get(`/api/diplomas/${diplomaId}`);
      // بنسحب الداتا
      return response.data?.payload?.data || response.data?.data || response.data;
    },
    enabled: !!diplomaId && diplomaId !== "undefined",
  });
};
