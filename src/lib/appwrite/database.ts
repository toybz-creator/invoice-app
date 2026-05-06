import { ID, Query } from "node-appwrite";

import { createAdminDatabases } from "@/lib/appwrite/admin";
import { getServerAppwriteConfig } from "@/lib/appwrite/config";
import { toAppwriteError } from "@/lib/appwrite/errors";
import { invoiceDocumentPermissions } from "@/lib/appwrite/permissions";
import { withAppwriteRetry } from "@/lib/appwrite/retry";
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
  Omit<InvoiceDocumentData, "userId">
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
    $createdAt: document.$createdAt,
    $updatedAt: document.$updatedAt,
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
      Query.limit(options.limit ?? 50),
    ];

    if (options.status) {
      queries.push(Query.equal("status", options.status));
    }

    if (options.cursorAfter) {
      queries.push(Query.cursorAfter(options.cursorAfter));
    }

    const response = await withAppwriteRetry(
      () =>
        databases.listDocuments<AppwriteInvoiceDocument>({
          ...collectionConfig,
          queries,
          total: true,
        }),
      {
        context: { userId, status: options.status },
        label: "List invoice documents",
      },
    );

    return {
      ok: true,
      data: {
        invoices: response.documents
          .map(mapInvoiceDocument)
          .sort(
            (first, second) =>
              new Date(second.$createdAt).getTime() -
              new Date(first.$createdAt).getTime(),
          ),
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
    const document = await withAppwriteRetry(
      () =>
        databases.getDocument<AppwriteInvoiceDocument>({
          ...getInvoiceCollectionConfig(),
          documentId: invoiceId,
        }),
      { context: { invoiceId, userId }, label: "Get invoice document" },
    );

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
    const document = await withAppwriteRetry(
      () =>
        databases.createDocument<AppwriteInvoiceDocument>({
          ...getInvoiceCollectionConfig(),
          documentId: ID.unique(),
          data: input,
          permissions: invoiceDocumentPermissions(input.userId),
        }),
      {
        context: { userId: input.userId, status: input.status },
        label: "Create invoice document",
      },
    );

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
    const document = await withAppwriteRetry(
      () =>
        databases.updateDocument<AppwriteInvoiceDocument>({
          ...getInvoiceCollectionConfig(),
          documentId: invoiceId,
          data: input,
          permissions: invoiceDocumentPermissions(userId),
        }),
      { context: { invoiceId, userId }, label: "Update invoice document" },
    );

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
    await withAppwriteRetry(
      () =>
        databases.deleteDocument({
          ...getInvoiceCollectionConfig(),
          documentId: invoiceId,
        }),
      { context: { invoiceId, userId }, label: "Delete invoice document" },
    );

    return { ok: true, data: { id: invoiceId } };
  } catch (error) {
    return toAppwriteError(error);
  }
}
