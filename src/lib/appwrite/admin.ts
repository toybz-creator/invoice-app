import "server-only";

import { Client, Databases, Users } from "node-appwrite";

import { getServerAppwriteConfig } from "@/lib/appwrite/config";

export function createAdminAppwriteClient() {
  const config = getServerAppwriteConfig();

  return new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);
}

export function createAdminDatabases() {
  return new Databases(createAdminAppwriteClient());
}

export function createAdminUsers() {
  return new Users(createAdminAppwriteClient());
}
