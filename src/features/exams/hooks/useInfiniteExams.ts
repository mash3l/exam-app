import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Exam } from "@/types/models";

type ExamsPage = {
  data: Exam[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function unwrapExamsResponse(data: unknown): ExamsPage {
  const root = data as Record<string, unknown>;
  const payload = (root.payload ?? root) as Record<string, unknown>;
  const list = (payload.data ?? payload.exams ?? payload) as Exam[];
  const pagination = (payload.pagination ?? root.pagination) as ExamsPage["pagination"];

  return {
    data: Array.isArray(list) ? list : [],
    pagination: pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export function useInfiniteExams(diplomaId: string) {
  return useInfiniteQuery({
    queryKey: ["exams", "infinite", diplomaId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get("/api/exams", {
        params: { page: pageParam, limit: 20, diplomaId },
      });
      return unwrapExamsResponse(response.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(diplomaId) && diplomaId !== "undefined",
  });
}
