import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Exam } from "@/features/exams/types";

export const useExamDetails = (examId: string) => {
  return useQuery({
    queryKey: ["exam-details", examId],
    queryFn: async () => {
      const response = await api.get(`/api/exams/${examId}`);
      return (response.data?.payload?.exam || response.data?.data || response.data) as Exam;
    },
    enabled: !!examId && examId !== "undefined",
  });
};
