import { describe, expect, it } from "vitest";

import {
  formatAppwriteConfigError,
  parsePublicAppwriteConfig,
  parseServerAppwriteConfig,
} from "@/lib/appwrite/config";

const validEnv = {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: "https://cloud.appwrite.io/v1",
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: "project-id",
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: "database-id",
  NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID: "invoices",
  APPWRITE_API_KEY: "server-key",
};

describe("Appwrite config", () => {
  it("parses public environment variables", () => {
    expect(parsePublicAppwriteConfig(validEnv)).toEqual({
      endpoint: "https://cloud.appwrite.io/v1",
      projectId: "project-id",
      databaseId: "database-id",
      invoicesCollectionId: "invoices",
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
});
