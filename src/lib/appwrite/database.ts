import { ID, Query } from "node-appwrite";

import { createAdminDatabases } from "@/lib/appwrite/admin";
import { getServerAppwriteConfig } from "@/lib/appwrite/config";
import { toAppwriteError } from "@/lib/appwrite/errors";
import { invoiceDocumentPermissions } from "@/lib/appwrite/permissions";
import type {
  AppwriteInvoiceDocument,
  Invoice,
  InvoiceDocumentData,
  InvoiceList,
  InvoiceStatus,
} from "@/types/invoice";
import type { AppResult } from "@/types/result";

type ListInvoicesOptions = {
  limit?: number;
  cursorAfter?: string;
  status?: InvoiceStatus;
};

export type CreateInvoiceDocumentInput = InvoiceDocumentData;

export type UpdateInvoiceDocumentInput = Partial<
  Omit<InvoiceDocumentData, "userId" | "createdAt">
>;

function mapInvoiceDocument(document: AppwriteInvoiceDocument): Invoice {
  return {
    id: document.$id,
    userId: document.userId,
    clientName: document.clientName,
    clientEmail: document.clientEmail,
    amount: document.amount,
    vatRate: document.vatRate,
    vatAmount: document.vatAmount,
    total: document.total,
    dueDate: document.dueDate,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    paidAt: document.paidAt,
  };
}

function getInvoiceCollectionConfig() {
  const config = getServerAppwriteConfig();

  return {
    databaseId: config.databaseId,
    collectionId: config.invoicesCollectionId,
  };
}

export async function listInvoiceDocumentsByUser(
  userId: string,
  options: ListInvoicesOptions = {},
): Promise<AppResult<InvoiceList>> {
  try {
    const databases = createAdminDatabases();
    const collectionConfig = getInvoiceCollectionConfig();
    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("createdAt"),
      Query.limit(options.limit ?? 50),
    ];

    if (options.status) {
      queries.push(Query.equal("status", options.status));
    }

    if (options.cursorAfter) {
      queries.push(Query.cursorAfter(options.cursorAfter));
    }

    const response = await databases.listDocuments<AppwriteInvoiceDocument>({
      ...collectionConfig,
      queries,
      total: true,
    });

    return {
      ok: true,
      data: {
        invoices: response.documents.map(mapInvoiceDocument),
        total: response.total,
      },
    };
  } catch (error) {
    return toAppwriteError(error);
  }
}

export async function getInvoiceDocumentForUser(
  invoiceId: string,
  userId: string,
): Promise<AppResult<Invoice>> {
  try {
    const databases = createAdminDatabases();
    const document = await databases.getDocument<AppwriteInvoiceDocument>({
      ...getInvoiceCollectionConfig(),
      documentId: invoiceId,
    });

    if (document.userId !== userId) {
      return { ok: false, error: "Invoice not found.", status: 404 };
    }

    return { ok: true, data: mapInvoiceDocument(document) };
  } catch (error) {
    return toAppwriteError(error);
  }
}

export async function createInvoiceDocument(
  input: CreateInvoiceDocumentInput,
): Promise<AppResult<Invoice>> {
  try {
    const databases = createAdminDatabases();
    const document = await databases.createDocument<AppwriteInvoiceDocument>({
      ...getInvoiceCollectionConfig(),
      documentId: ID.unique(),
      data: input,
      permissions: invoiceDocumentPermissions(input.userId),
    });

    return { ok: true, data: mapInvoiceDocument(document) };
  } catch (error) {
    return toAppwriteError(error);
  }
}

export async function updateInvoiceDocumentForUser(
  invoiceId: string,
  userId: string,
  input: UpdateInvoiceDocumentInput,
): Promise<AppResult<Invoice>> {
  const existing = await getInvoiceDocumentForUser(invoiceId, userId);

  if (!existing.ok) {
    return existing;
  }

  try {
    const databases = createAdminDatabases();
    const document = await databases.updateDocument<AppwriteInvoiceDocument>({
      ...getInvoiceCollectionConfig(),
      documentId: invoiceId,
      data: input,
      permissions: invoiceDocumentPermissions(userId),
    });

    return { ok: true, data: mapInvoiceDocument(document) };
  } catch (error) {
    return toAppwriteError(error);
  }
}

export async function deleteInvoiceDocumentForUser(
  invoiceId: string,
  userId: string,
): Promise<AppResult<{ id: string }>> {
  const existing = await getInvoiceDocumentForUser(invoiceId, userId);

  if (!existing.ok) {
    return existing;
  }

  try {
    const databases = createAdminDatabases();
    await databases.deleteDocument({
      ...getInvoiceCollectionConfig(),
      documentId: invoiceId,
    });

    return { ok: true, data: { id: invoiceId } };
  } catch (error) {
    return toAppwriteError(error);
  }
}
