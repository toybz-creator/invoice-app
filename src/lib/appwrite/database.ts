import { ID, Query } from "node-appwrite";

import { createAdminTablesDB } from "@/lib/appwrite/admin";
import { getServerAppwriteConfig } from "@/lib/appwrite/config";
import { toAppwriteError } from "@/lib/appwrite/errors";
import { invoiceRowPermissions } from "@/lib/appwrite/permissions";
import { withAppwriteRetry } from "@/lib/appwrite/retry";
import type {
  AppwriteInvoiceRow,
  Invoice,
  InvoiceList,
  InvoiceRowData,
  InvoiceStatus,
} from "@/types/invoice";
import type { AppResult } from "@/types/result";

type ListInvoicesOptions = {
  limit?: number;
  cursorAfter?: string;
  status?: InvoiceStatus;
};

export type CreateInvoiceRowInput = InvoiceRowData;

export type UpdateInvoiceRowInput = Partial<Omit<InvoiceRowData, "userId">>;

function mapInvoiceRow(row: AppwriteInvoiceRow): Invoice {
  return {
    id: row.$id,
    userId: row.userId,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    amount: row.amount,
    vatRate: row.vatRate,
    vatAmount: row.vatAmount,
    total: row.total,
    dueDate: row.dueDate,
    status: row.status,
    $createdAt: row.$createdAt,
    $updatedAt: row.$updatedAt,
    paidAt: row.paidAt,
  };
}

function getInvoiceTableConfig() {
  const config = getServerAppwriteConfig();

  return {
    databaseId: config.databaseId,
    tableId: config.invoicesTableId,
  };
}

export async function listInvoiceRowsByUser(
  userId: string,
  options: ListInvoicesOptions = {},
): Promise<AppResult<InvoiceList>> {
  try {
    const tablesDB = createAdminTablesDB();
    const tableConfig = getInvoiceTableConfig();
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
        tablesDB.listRows<AppwriteInvoiceRow>({
          ...tableConfig,
          queries,
          total: true,
        }),
      {
        context: { userId, status: options.status },
        label: "List invoice rows",
      },
    );

    return {
      ok: true,
      data: {
        invoices: response.rows
          .map(mapInvoiceRow)
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

export async function getInvoiceRowForUser(
  invoiceId: string,
  userId: string,
): Promise<AppResult<Invoice>> {
  try {
    const tablesDB = createAdminTablesDB();
    const row = await withAppwriteRetry(
      () =>
        tablesDB.getRow<AppwriteInvoiceRow>({
          ...getInvoiceTableConfig(),
          rowId: invoiceId,
        }),
      { context: { invoiceId, userId }, label: "Get invoice row" },
    );

    if (row.userId !== userId) {
      return { ok: false, error: "Invoice not found.", status: 404 };
    }

    return { ok: true, data: mapInvoiceRow(row) };
  } catch (error) {
    return toAppwriteError(error);
  }
}

export async function createInvoiceRow(
  input: CreateInvoiceRowInput,
): Promise<AppResult<Invoice>> {
  try {
    const tablesDB = createAdminTablesDB();
    const row = await withAppwriteRetry(
      () =>
        tablesDB.createRow<AppwriteInvoiceRow>({
          ...getInvoiceTableConfig(),
          rowId: ID.unique(),
          data: input,
          permissions: invoiceRowPermissions(input.userId),
        }),
      {
        context: { userId: input.userId, status: input.status },
        label: "Create invoice row",
      },
    );

    return { ok: true, data: mapInvoiceRow(row) };
  } catch (error) {
    return toAppwriteError(error);
  }
}

export async function updateInvoiceRowForUser(
  invoiceId: string,
  userId: string,
  input: UpdateInvoiceRowInput,
): Promise<AppResult<Invoice>> {
  const existing = await getInvoiceRowForUser(invoiceId, userId);

  if (!existing.ok) {
    return existing;
  }

  try {
    const tablesDB = createAdminTablesDB();
    const row = await withAppwriteRetry(
      () =>
        tablesDB.updateRow<AppwriteInvoiceRow>({
          ...getInvoiceTableConfig(),
          rowId: invoiceId,
          data: input,
          permissions: invoiceRowPermissions(userId),
        }),
      { context: { invoiceId, userId }, label: "Update invoice row" },
    );

    return { ok: true, data: mapInvoiceRow(row) };
  } catch (error) {
    return toAppwriteError(error);
  }
}

export async function deleteInvoiceRowForUser(
  invoiceId: string,
  userId: string,
): Promise<AppResult<{ id: string }>> {
  const existing = await getInvoiceRowForUser(invoiceId, userId);

  if (!existing.ok) {
    return existing;
  }

  try {
    const tablesDB = createAdminTablesDB();
    await withAppwriteRetry(
      () =>
        tablesDB.deleteRow({
          ...getInvoiceTableConfig(),
          rowId: invoiceId,
        }),
      { context: { invoiceId, userId }, label: "Delete invoice row" },
    );

    return { ok: true, data: { id: invoiceId } };
  } catch (error) {
    return toAppwriteError(error);
  }
}
