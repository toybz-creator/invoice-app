"use server";

import { redirect } from "next/navigation";
import { ID } from "node-appwrite";

import { loginSchema, signupSchema } from "@/features/auth/schemas/auth.schema";
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
