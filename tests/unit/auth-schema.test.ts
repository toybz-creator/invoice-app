import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "@/features/auth/schemas/auth.schema";

describe("auth schemas", () => {
  it("normalizes login email and accepts a valid password", () => {
    expect(
      loginSchema.parse({
        email: " OWNER@EXAMPLE.COM ",
        password: "password123",
      }),
    ).toMatchObject({
      email: "owner@example.com",
      password: "password123",
    });
  });

  it("rejects invalid signup input with field errors", () => {
    const result = signupSchema.safeParse({
      name: "",
      email: "not-email",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors).toMatchObject({
      name: expect.any(Array),
      email: expect.any(Array),
      password: expect.any(Array),
    });
  });
});
