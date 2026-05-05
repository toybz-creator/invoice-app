import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(256, "Password must be 256 characters or fewer.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(128, "Full name must be 128 characters or fewer."),
  email: emailSchema,
  password: passwordSchema,
});

export const resetPasswordSchema = z
  .object({
    userId: z.string().min(1, "Password reset link is missing a user ID."),
    secret: z.string().min(1, "Password reset link is missing a secret."),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
