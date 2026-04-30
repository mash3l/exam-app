import { z } from "zod";

export const answerBodySchema = z
  .object({
    text: z.string({ message: "Answer text is required" }).min(1, "Answer text cannot be empty"),
    isCorrect: z.boolean({ message: "Please specify whether this answer is correct" }),
  })
  .strict();

export const questionIdParamsSchema = z
  .object({
    id: z.string().uuid("Please provide a valid question ID"),
  })
  .strict();

export const getQuestionsByExamParamsSchema = z
  .object({
    examId: z.string().uuid("Please provide a valid exam ID"),
  })
  .strict();

/** Query for GET /questions/exam/:examId — sort only (title = question text). */
export const getQuestionsByExamQuerySchema = z
  .object({
    sortBy: z.enum(["title", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .strict();

export const createQuestionBodySchema = z
  .object({
    text: z.string({ message: "Question text is required" }).min(1, "Question text cannot be empty"),
    answers: z
      .array(answerBodySchema)
      .min(2, "At least 2 answers are required")
      .refine(
        (answers) => answers.filter((a) => a.isCorrect).length === 1,
        "Exactly one answer must be marked as correct"
      ),
  })
  .strict();

const bulkQuestionItemSchema = z
  .object({
    text: z.string({ message: "Question text is required" }).min(1, "Question text cannot be empty"),
    answers: z
      .array(answerBodySchema, "Answers must be a valid array")
      .min(2, "At least 2 answers are required")
      .refine(
        (answers: z.infer<typeof answerBodySchema>[]) => answers.filter((a) => a.isCorrect).length === 1,
        "Exactly one answer must be marked as correct"
      ),
  })
  .strict();

export const createBulkQuestionsBodySchema = z
  .object({
    questions: z.array(bulkQuestionItemSchema, "Questions must be a valid array").min(1, "At least one question is required"),
  })
  .strict();

export const updateQuestionBodySchema = z
  .object({
    text: z.string().min(1, "Question text cannot be empty").optional(),
    answers: z
      .array(answerBodySchema, "Answers must be a valid array")
      .min(2, "At least 2 answers are required")
      .refine(
        (answers: z.infer<typeof answerBodySchema>[]) => answers.filter((a) => a.isCorrect).length === 1,
        "Exactly one answer must be marked as correct"
      )
      .optional(),
  })
  .strict();

/** Single-choice row inside `answers` array (FormProvider + submitExamBodySchema). */
export const quizSingleChoiceFieldSchema = z.object({
  questionId: z.string().uuid("Invalid question"),
  answerId: z.string().uuid("Please select an answer"),
});

/** Multiple-choice row inside `answers` array. */
export const quizMultiChoiceFieldSchema = z.object({
  questionId: z.string().uuid("Invalid question"),
  answerIds: z.array(z.string().uuid()).min(1, "Select at least one option"),
});

/** Learner quiz UI: ids may be non-UUID (e.g. numeric keys from `buildOptionsFromQuestion`). */
export const quizUiSingleChoiceFieldSchema = z.object({
  questionId: z.string().min(1, "Question id is required"),
  answerId: z.string().min(1, "Please select an answer"),
});

/** Learner quiz UI — multiple selection row. */
export const quizUiMultiChoiceFieldSchema = z.object({
  questionId: z.string().min(1, "Question id is required"),
  answerIds: z.array(z.string().min(1)).min(1, "Select at least one option"),
});
