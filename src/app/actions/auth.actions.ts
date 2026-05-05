"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ID } from "node-appwrite";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/features/auth/schemas/auth.schema";
import {
  createAdminAccount,
  createAdminUsers,
  createSessionAccount,
} from "@/lib/appwrite/admin";
import {
  clearSessionCookie,
  getSessionSecret,
  setSessionCookie,
} from "@/lib/appwrite/session";

export type AuthActionResult =
  | { ok: true; message: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

function fieldErrorsFromIssues(
  issues: Array<{ path: PropertyKey[]; message: string }>,
) {
  return issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = String(issue.path[0] ?? "form");
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

function authErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Authentication failed. Please try again.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid") || message.includes("credentials")) {
    return "Email or password is incorrect.";
  }

  if (
    message.includes("already exists") ||
    message.includes("duplicate") ||
    message.includes("user_already_exists")
  ) {
    return "An account with this email already exists.";
  }

  if (message.includes("password")) {
    return "Password does not meet the configured security requirements.";
  }

  return "Authentication failed. Please try again.";
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

async function createSession(email: string, password: string, remember = true) {
  const session = await createAdminAccount().createEmailPasswordSession({
    email,
    password,
  });

  await setSessionCookie(session.secret, remember ? session.expire : undefined);
}

export async function loginAction(input: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  try {
    await createSession(
      parsed.data.email,
      parsed.data.password,
      parsed.data.remember,
    );
    return { ok: true, message: "Signed in successfully." };
  } catch (error) {
    return { ok: false, error: authErrorMessage(error) };
  }
}

export async function signupAction(input: unknown): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  try {
    await createAdminUsers().create({
      userId: ID.unique(),
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name,
    });
    await createSession(parsed.data.email, parsed.data.password);

    return { ok: true, message: "Account created successfully." };
  } catch (error) {
    return { ok: false, error: authErrorMessage(error) };
  }
}

export async function forgotPasswordAction(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  try {
    const origin = await getRequestOrigin();
    const resetUrl = new URL("/reset-password", origin);

    await createAdminAccount().createRecovery({
      email: parsed.data.email,
      url: resetUrl.toString(),
    });
  } catch {
    // Keep this response neutral so registered emails cannot be enumerated.
  }

  return {
    ok: true,
    message:
      "If an account exists for that email, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  try {
    await createAdminAccount().updateRecovery({
      userId: parsed.data.userId,
      secret: parsed.data.secret,
      password: parsed.data.password,
    });

    return {
      ok: true,
      message: "Password updated. You can now sign in.",
    };
  } catch {
    return {
      ok: false,
      error:
        "This password reset link is invalid or has expired. Request a new link and try again.",
    };
  }
}

export async function logoutAction() {
  const sessionSecret = await getSessionSecret();

  if (sessionSecret) {
    try {
      await createSessionAccount(sessionSecret).deleteSession({
        sessionId: "current",
      });
    } catch {
      // The local cookie is still cleared when Appwrite has already expired it.
    }
  }

  await clearSessionCookie();
  redirect("/login");
}
