import { z } from "zod";
import { phoneRegex } from "@/shared/constants/phone.constant";
import { strongPasswordSchema } from "@/lib/validations/password";

const phoneSchemaOptional = z
  .string()
  .regex(phoneRegex, "Please enter a valid Egyptian mobile number (e.g. 01551234567)")
  .optional()
  .or(z.literal(""));

const otpCodeSchema = z
  .string({ message: "Verification code is required" })
  .length(6, "Verification code must be exactly 6 digits");

/** Send OTP to email (step 1 before registration). */
export const sendEmailVerificationBodySchema = z
  .object({
    email: z.string({ message: "Email is required" }).email("Please enter a valid email address"),
  })
  .strict();

/** Confirm OTP; email is then marked verified for registration. */
export const confirmEmailVerificationBodySchema = z
  .object({
    email: z.string({ message: "Email is required" }).email("Please enter a valid email address"),
    code: otpCodeSchema,
  })
  .strict();

export const registerBodySchema = z
  .object({
    username: z
      .string({ message: "Username is required" })
      .min(2, "Username must be at least 2 characters")
      .max(50, "Username must be at most 50 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string({ message: "Email is required" }).email("Please enter a valid email address"),
    password: strongPasswordSchema,
    confirmPassword: z.string({ message: "Please confirm your password" }),
    firstName: z.string({ message: "First name is required" }).min(1).max(100, "First name is too long"),
    lastName: z.string({ message: "Last name is required" }).min(1).max(100, "Last name is too long"),
    phone: phoneSchemaOptional,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .strict();

export const loginBodySchema = z
  .object({
    username: z.string({ message: "Username is required" }).min(1, "Username is required"),
    password: z.string({ message: "Password is required" }).min(1),
  })
  .strict();

export const forgotPasswordBodySchema = z
  .object({
    email: z.string({ message: "Email is required" }).email("Please enter a valid email address"),
  })
  .strict();

export const resetPasswordBodySchema = z
  .object({
    token: z.string({ message: "Reset token is required" }).min(1),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string({ message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .strict();

/** Forgot-password UI step 3 (token wired when API exists). */
export const forgotPasswordResetFormSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: z.string({ message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .strict();

/** Register wizard: user info step (same rules as registerBodySchema fields; no `.pick()` because registerBodySchema uses `.refine()`). */
export const registerUserInfoStepSchema = z
  .object({
    username: z
      .string({ message: "Username is required" })
      .min(2, "Username must be at least 2 characters")
      .max(50, "Username must be at most 50 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    firstName: z.string({ message: "First name is required" }).min(1).max(100, "First name is too long"),
    lastName: z.string({ message: "Last name is required" }).min(1).max(100, "Last name is too long"),
    phone: phoneSchemaOptional,
  })
  .strict();

/** Register wizard: password step. */
export const registerPasswordStepSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string({ message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .strict();
