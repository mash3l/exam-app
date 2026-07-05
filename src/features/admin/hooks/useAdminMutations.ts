import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { clientApiUrl } from "@/lib/client-api";

export function useCreateDiploma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; description: string | null; image?: string }) => {
      const response = await api.post("/api/diplomas", body);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["diplomas"] });
    },
  });
}

export function useUpdateDiploma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: { title?: string; description?: string; image?: string };
    }) => {
      const response = await api.put(`/api/diplomas/${id}`, body);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["diplomas"] });
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const response = await api.post("/api/exams", body);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: Record<string, unknown>;
    }) => {
      const response = await api.put(`/api/exams/${id}`, body);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["exams"] });
      void queryClient.invalidateQueries({ queryKey: ["exam-details", variables.id] });
    },
  });
}

export function useCreateQuestionsBulk(examId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const response = await fetch(clientApiUrl(`/api/questions/exam/${examId}/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || "Failed to save questions");
      }
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
    },
  });
}

export function useUpdateQuestion(questionId: string, examId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const response = await fetch(clientApiUrl(`/api/questions/${questionId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || "Failed to update question");
      }
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
    },
  });
}
