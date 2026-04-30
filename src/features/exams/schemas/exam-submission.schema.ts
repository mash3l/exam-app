import { z } from "zod";
import { paginationQuerySchema } from "@/shared/schemas/pagination.schema";

export const answerSubmissionItemSchema = z
  .object({
    questionId: z.string().uuid("Please provide a valid question ID"),
    answerId: z.string().uuid("Please provide a valid answer ID"),
  })
  .strict();

export const submissionIdParamsSchema = z
  .object({
    id: z.string().uuid("Please provide a valid submission ID"),
  })
  .strict();

export const getSubmissionsQuerySchema = paginationQuerySchema.and(
  z
    .object({
      examId: z.string().uuid("Please provide a valid exam ID").optional(),
    })
    .strict()
);

export const submitExamBodySchema = z
  .object({
    examId: z.string().uuid("Please provide a valid exam ID"),
    answers: z.array(answerSubmissionItemSchema).min(1, "At least one answer is required"),
    startedAt: z.string().datetime({ message: "Invalid date format" }).optional(),
  })
  .strict();
