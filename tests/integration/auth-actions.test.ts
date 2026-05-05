import { describe, expect, it } from "vitest";

import {
  forgotPasswordAction,
  loginAction,
  resetPasswordAction,
  signupAction,
} from "@/app/actions/auth.actions";

describe("auth actions", () => {
  it("returns field errors before touching Appwrite for invalid login input", async () => {
    await expect(
      loginAction({ email: "bad-email", password: "short" }),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: {
        email: expect.any(Array),
        password: expect.any(Array),
      },
    });
  });

  it("returns field errors before touching Appwrite for invalid signup input", async () => {
    await expect(
      signupAction({ name: "", email: "bad-email", password: "short" }),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: {
        name: expect.any(Array),
        email: expect.any(Array),
        password: expect.any(Array),
      },
    });
  });

  it("returns field errors before touching Appwrite for invalid forgot password input", async () => {
    await expect(
      forgotPasswordAction({ email: "bad-email" }),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: {
        email: expect.any(Array),
      },
    });
  });

  it("returns field errors before touching Appwrite for invalid reset password input", async () => {
    await expect(
      resetPasswordAction({
        userId: "",
        secret: "",
        password: "password123",
        confirmPassword: "different123",
      }),
    ).resolves.toMatchObject({
      ok: false,
      fieldErrors: {
        userId: expect.any(Array),
        secret: expect.any(Array),
        confirmPassword: expect.any(Array),
      },
    });
  });
});
