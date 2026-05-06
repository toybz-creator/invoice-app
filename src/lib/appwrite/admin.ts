import "server-only";

import { Account, Client, TablesDB, Users } from "node-appwrite";

import { getServerAppwriteConfig } from "@/lib/appwrite/config";

export function createAdminAppwriteClient() {
  const config = getServerAppwriteConfig();

  return new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);
}

export function createAdminTablesDB() {
  return new TablesDB(createAdminAppwriteClient());
}

export function createAdminUsers() {
  return new Users(createAdminAppwriteClient());
}

export function createAdminAccount() {
  return new Account(createAdminAppwriteClient());
}

export function createSessionAppwriteClient(sessionSecret: string) {
  const config = getServerAppwriteConfig();

  return new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setSession(sessionSecret);
}

export function createSessionAccount(sessionSecret: string) {
  return new Account(createSessionAppwriteClient(sessionSecret));
}
