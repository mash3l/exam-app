import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { submitExamBodySchema } from "@/features/exams/schemas/exam-submission.schema";
import type { QuizResultsPayload } from "@/features/exams/components/quiz/QuizResults";

export type SubmitExamInput = {
  examId: string;
  answers: Array<{ questionId: string; answerId: string }>;
  startedAt?: string;
};

function mapSubmissionResponse(data: unknown): QuizResultsPayload {
  const root = data as Record<string, unknown>;
  const payload = (root.payload ?? root) as Record<string, unknown>;
  const submission = (payload.submission ?? payload) as Record<string, unknown>;
  const analytics = (payload.analytics ?? payload.results) as QuizResultsPayload["analytics"];

  return {
    submission: submission
      ? {
          correctAnswers: Number(submission.correctAnswers ?? 0) || 0,
          wrongAnswers: Number(submission.wrongAnswers ?? 0) || 0,
          totalQuestions: Number(submission.totalQuestions ?? 0) || 0,
        }
      : undefined,
    analytics: Array.isArray(analytics) ? analytics : [],
  };
}

export function useSubmitExam() {
  return useMutation({
    mutationFn: async (input: SubmitExamInput) => {
      const body = submitExamBodySchema.parse({
        examId: input.examId,
        answers: input.answers,
        startedAt: input.startedAt,
      });

      const response = await api.post("/api/submissions", body);
      return mapSubmissionResponse(response.data);
    },
  });
}
