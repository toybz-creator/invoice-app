import { describe, expect, it } from "vitest";

import {
  formatAppwriteConfigError,
  parseAppEnvironment,
  parsePublicAppwriteConfig,
  parseServerAppwriteConfig,
} from "@/lib/appwrite/config";

const validEnv = {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: "https://cloud.appwrite.io/v1",
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: "project-id",
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: "database-id",
  NEXT_PUBLIC_APPWRITE_INVOICES_TABLE_ID: "invoices",
  APPWRITE_API_KEY: "server-key",
};

describe("Appwrite config", () => {
  it("parses public environment variables", () => {
    expect(parsePublicAppwriteConfig(validEnv)).toEqual({
      endpoint: "https://cloud.appwrite.io/v1",
      projectId: "project-id",
      databaseId: "database-id",
      invoicesTableId: "invoices",
    });
  });

  it("keeps the legacy collection env key as a compatibility fallback", () => {
    expect(
      parsePublicAppwriteConfig({
        ...validEnv,
        NEXT_PUBLIC_APPWRITE_INVOICES_TABLE_ID: undefined,
        NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID: "legacy-invoices",
      }),
    ).toMatchObject({
      invoicesTableId: "legacy-invoices",
    });
  });

  it("requires the server API key for server config", () => {
    expect(() =>
      parseServerAppwriteConfig({
        ...validEnv,
        APPWRITE_API_KEY: undefined,
      }),
    ).toThrow();
  });

  it("formats config validation failures without exposing values", () => {
    try {
      parsePublicAppwriteConfig({
        ...validEnv,
        NEXT_PUBLIC_APPWRITE_ENDPOINT: "not-a-url",
      });
    } catch (error) {
      expect(formatAppwriteConfigError(error)).toContain("endpoint");
      expect(formatAppwriteConfigError(error)).not.toContain("server-key");
    }
  });

  it("parses the application environment key", () => {
    expect(parseAppEnvironment({ APP_ENV: "development" })).toBe("development");
    expect(parseAppEnvironment({ APP_ENV: "production" })).toBe("production");
  });
});
