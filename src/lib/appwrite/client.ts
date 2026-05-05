import { Account, Client, Databases } from "appwrite";

import { getPublicAppwriteConfig } from "@/lib/appwrite/config";

let browserClient: Client | null = null;

export function createBrowserAppwriteClient() {
  const config = getPublicAppwriteConfig();

  return new Client().setEndpoint(config.endpoint).setProject(config.projectId);
}

export function getBrowserAppwriteClient() {
  browserClient ??= createBrowserAppwriteClient();
  return browserClient;
}

export function getBrowserAccount() {
  return new Account(getBrowserAppwriteClient());
}

export function getBrowserDatabases() {
  return new Databases(getBrowserAppwriteClient());
}
