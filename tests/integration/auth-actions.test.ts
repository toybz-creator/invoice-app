import { describe, expect, it } from "vitest";

import { loginAction, signupAction } from "@/app/actions/auth.actions";

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
});
