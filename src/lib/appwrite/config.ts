import { z } from "zod";

const publicConfigSchema = z.object({
  endpoint: z.string().url(),
  projectId: z.string().min(1),
  databaseId: z.string().min(1),
  invoicesCollectionId: z.string().min(1),
});

const serverConfigSchema = publicConfigSchema.extend({
  apiKey: z.string().min(1),
});

export type PublicAppwriteConfig = z.infer<typeof publicConfigSchema>;
export type ServerAppwriteConfig = z.infer<typeof serverConfigSchema>;

export type AppwriteEnv = Record<string, string | undefined> & {
  NEXT_PUBLIC_APPWRITE_ENDPOINT?: string;
  NEXT_PUBLIC_APPWRITE_PROJECT_ID?: string;
  NEXT_PUBLIC_APPWRITE_DATABASE_ID?: string;
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
    invoicesCollectionId: env.NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID,
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

export function getPublicAppwriteConfig() {
  return parsePublicAppwriteConfig(process.env);
}

export function getServerAppwriteConfig() {
  return parseServerAppwriteConfig(process.env);
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
