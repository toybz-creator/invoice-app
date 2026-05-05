import { describe, expect, it } from "vitest";

import {
  fallbackSessionCookieName,
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/appwrite/session-cookie";

describe("Appwrite session cookie helpers", () => {
  it("uses the Appwrite project-aware session cookie name", () => {
    expect(getSessionCookieName("project-id")).toBe("a_session_project-id");
  });

  it("falls back when middleware runs before env is configured", () => {
    expect(getSessionCookieName()).toBe(fallbackSessionCookieName);
  });

  it("keeps the browser-facing session cookie httpOnly and sameSite lax", () => {
    expect(getSessionCookieOptions("2026-01-01T00:00:00.000Z")).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date("2026-01-01T00:00:00.000Z"),
    });
  });
});
