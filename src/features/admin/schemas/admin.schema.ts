import { z } from "zod";
import { paginationQuerySchema } from "@/shared/schemas/pagination.schema";

const adminAuditCategoryValues = ["DIPLOMA", "EXAM", "QUESTION", "USER", "SYSTEM"] as const;
const adminAuditActionValues = ["CREATE", "UPDATE", "DELETE", "SET_IMMUTABLE", "SEED_DATA"] as const;

export const getAdminAuditLogsQuerySchema = paginationQuerySchema.merge(
  z
    .object({
      category: z.enum(adminAuditCategoryValues).optional(),
      action: z.enum(adminAuditActionValues).optional(),
      actorUserId: z.string().uuid("Please provide a valid user ID").optional(),
      sortBy: z.enum(["action", "user", "entity", "createdAt"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .strict()
);

export const setImmutableParamsSchema = z
  .object({
    id: z.string().uuid("Please provide a valid ID"),
  })
  .strict();

export const adminAuditLogIdParamsSchema = z
  .object({
    id: z.string().uuid("Please provide a valid audit log ID"),
  })
  .strict();

export const setImmutableBodySchema = z
  .object({
    immutable: z.boolean({ message: "immutable must be true or false" }),
  })
  .strict();
