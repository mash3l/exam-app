import { z } from "zod";
import { quizUiSingleChoiceFieldSchema } from "@/features/exams/schemas/question.schema";

/** Draft answers while taking a quiz (answerId filled per question before submit). */
export const quizSessionAnswersFormSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  startedAt: z.string().optional(),
  answers: z.array(quizUiSingleChoiceFieldSchema),
});

export type QuizSessionAnswersFormValues = z.infer<typeof quizSessionAnswersFormSchema>;
