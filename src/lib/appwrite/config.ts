import { z } from "zod";

const publicConfigSchema = z.object({
  endpoint: z.string().url(),
  projectId: z.string().min(1),
  databaseId: z.string().min(1),
  invoicesTableId: z.string().min(1),
});

const serverConfigSchema = publicConfigSchema.extend({
  apiKey: z.string().min(1),
});

const appEnvironmentSchema = z
  .enum(["development", "preview", "production", "test"])
  .default("development");

export type PublicAppwriteConfig = z.infer<typeof publicConfigSchema>;
export type ServerAppwriteConfig = z.infer<typeof serverConfigSchema>;
export type AppEnvironment = z.infer<typeof appEnvironmentSchema>;

export type AppwriteEnv = Record<string, string | undefined> & {
  APP_ENV?: string;
  NEXT_PUBLIC_APPWRITE_ENDPOINT?: string;
  NEXT_PUBLIC_APPWRITE_PROJECT_ID?: string;
  NEXT_PUBLIC_APPWRITE_DATABASE_ID?: string;
  NEXT_PUBLIC_APPWRITE_INVOICES_TABLE_ID?: string;
  NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID?: string;
  APPWRITE_API_KEY?: string;
};

export function parsePublicAppwriteConfig(
  env: AppwriteEnv,
): PublicAppwriteConfig {
  return publicConfigSchema.parse({
    endpoint: env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    invoicesTableId:
      env.NEXT_PUBLIC_APPWRITE_INVOICES_TABLE_ID ??
      env.NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID,
  });
}

export function parseServerAppwriteConfig(
  env: AppwriteEnv,
): ServerAppwriteConfig {
  return serverConfigSchema.parse({
    ...parsePublicAppwriteConfig(env),
    apiKey: env.APPWRITE_API_KEY,
  });
}

export function getPublicAppwriteConfig(): PublicAppwriteConfig {
  const env = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    invoicesTableId:
      process.env.NEXT_PUBLIC_APPWRITE_INVOICES_TABLE_ID ??
      process.env.NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID,
  };

  const parsed = publicConfigSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(formatAppwriteConfigError(parsed.error));
  }

  return parsed.data;
}

export function getServerAppwriteConfig(): ServerAppwriteConfig {
  const env = {
    ...getPublicAppwriteConfig(),
    apiKey: process.env.APPWRITE_API_KEY,
  };

  const parsed = serverConfigSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(formatAppwriteConfigError(parsed.error));
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[Appwrite Config] Using endpoint: ${parsed.data.endpoint}`);
  }

  return parsed.data;
}

export function parseAppEnvironment(env: AppwriteEnv): AppEnvironment {
  return appEnvironmentSchema.parse(env.APP_ENV ?? process.env.NODE_ENV);
}

export function getAppEnvironment() {
  return parseAppEnvironment(process.env);
}

export function formatAppwriteConfigError(error: unknown) {
  if (!(error instanceof z.ZodError)) {
    return "Appwrite configuration could not be loaded.";
  }

  const missing = error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean)
    .join(", ");

  return missing
    ? `Appwrite configuration is invalid or missing: ${missing}.`
    : "Appwrite configuration is invalid.";
}
