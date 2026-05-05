import { Permission, Role } from "node-appwrite";

export function invoiceDocumentPermissions(userId: string) {
  const owner = Role.user(userId);

  return [
    Permission.read(owner),
    Permission.update(owner),
    Permission.delete(owner),
  ];
}
