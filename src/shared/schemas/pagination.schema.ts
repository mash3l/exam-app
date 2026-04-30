import { z } from "zod";
import {
  DEFAULT_PAGINATION_PAGE,
  DEFAULT_PAGINATION_LIMIT,
  MAX_PAGINATION_LIMIT,
} from "@/shared/constants/pagination.constant";

/**
 * Reusable query schema for pagination. Use as-is or merge with other query params.
 */
export const paginationQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int("Page must be a whole number")
      .min(1, "Page must be at least 1")
      .default(DEFAULT_PAGINATION_PAGE),
    limit: z.coerce
      .number()
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(MAX_PAGINATION_LIMIT, `Limit cannot exceed ${MAX_PAGINATION_LIMIT}`)
      .default(DEFAULT_PAGINATION_LIMIT),
  })
  .strict();
