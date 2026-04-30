import { z } from "zod";
import { phoneRegex } from "@/shared/constants/phone.constant";
import { strongPasswordSchema } from "@/lib/validations/password";

export const idParamsSchema = z
  .object({
    id: z.string().uuid("Please provide a valid ID"),
  })
  .strict();

const profilePhotoUrlSchema = z
  .union([
    z.string().url("Please provide a valid image URL"),
    z.string().regex(/^\/api\/upload\/temp\/[a-zA-Z0-9-]+$/, "Invalid upload temp URL"),
    z.literal(""),
  ])
  .optional();

export const phoneOptionalSchema = z
  .string()
  .regex(phoneRegex, "Please enter a valid Egyptian mobile number (e.g. 01551234567)")
  .optional()
  .or(z.literal(""));

/** Full profile form (UI): names required, phone optional. */
export const accountProfileFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(100, "First name is too long"),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
    phone: phoneOptionalSchema,
  })
  .strict();

export const updateProfileBodySchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(100, "First name is too long").optional(),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long").optional(),
    profilePhoto: profilePhotoUrlSchema,
    phone: phoneOptionalSchema,
  })
  .strict()
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.profilePhoto !== undefined ||
      data.phone !== undefined,
    { message: "At least one of firstName, lastName, profilePhoto, or phone is required" }
  );

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string({ message: "Current password is required" }).min(1),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string({ message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .strict();

export const requestEmailChangeBodySchema = z
  .object({
    newEmail: z.string({ message: "New email is required" }).email("Please enter a valid email address"),
  })
  .strict();

export const confirmEmailChangeBodySchema = z
  .object({
    code: z.string({ message: "Verification code is required" }).length(6, "Code must be exactly 6 digits"),
  })
  .strict();
