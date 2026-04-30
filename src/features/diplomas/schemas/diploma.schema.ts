import { z } from "zod";
import { paginationQuerySchema } from "@/shared/schemas/pagination.schema";

export const diplomaIdParamsSchema = z
  .object({
    id: z.string().uuid("Please provide a valid diploma ID"),
  })
  .strict();

export const getDiplomasQuerySchema = paginationQuerySchema.merge(
  z
    .object({
      sortBy: z.enum(["title", "createdAt"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .strict()
);

const imageUrlSchema = z.union([
  z.string().url("Please provide a valid image URL"),
  z.string().regex(/^\/api\/upload\/temp\/[a-zA-Z0-9-]+$/, "Invalid upload temp URL"),
  z.literal(""),
]).optional();

export const createDiplomaBodySchema = z
  .object({
    title: z.string({ message: "Title is required" }).min(1, "Title cannot be empty"),
    description: z.string().nullable().default(null),
    image: imageUrlSchema.optional(),
  })
  .strict();

export const updateDiplomaBodySchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    description: z.string().optional(),
    image: imageUrlSchema.optional(),
  })
  .strict();
