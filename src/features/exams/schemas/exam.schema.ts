import { z } from "zod";
import { paginationQuerySchema } from "@/shared/schemas/pagination.schema";

export const examIdParamsSchema = z
  .object({
    id: z.string().uuid("Please provide a valid exam ID"),
  })
  .strict();

export const getExamsQuerySchema = paginationQuerySchema.merge(
  z
    .object({
      diplomaId: z.string().uuid("Please provide a valid diploma ID").optional(),
      sortBy: z.enum(["title", "createdAt", "questions"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .strict()
);

const imageUrlSchema = z.union([
  z.string().url("Please provide a valid image URL"),
  z.string().regex(/^\/api\/upload\/temp\/[a-zA-Z0-9-]+$/, "Invalid upload temp URL"),
  z.literal(""),
]);

export const createExamBodySchema = z
  .object({
    title: z.string({ message: "Title is required" }).min(1, "Title cannot be empty"),
    description: z.string().nullable().default(null),
    image: imageUrlSchema.optional(),
    duration: z.number().int().positive("Duration must be a positive number of minutes"),
    diplomaId: z.string().uuid("Please provide a valid diploma ID"),
  })
  .strict();

export const updateExamBodySchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").nullable().default(null).optional(),
    description: z.string().nullable().default(null).optional(),
    image: imageUrlSchema.optional(),
    duration: z
      .number()
      .int()
      .positive("Duration must be a positive number of minutes")
      .nullable()
      .default(null)
      .optional(),
    diplomaId: z.string().uuid("Please provide a valid diploma ID").optional(),
  })
  .strict();
