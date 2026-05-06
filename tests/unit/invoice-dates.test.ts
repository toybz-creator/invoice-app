import { describe, expect, it } from "vitest";

import { getDueDateState } from "@/features/invoices/lib/dates";

describe("invoice due-date utilities", () => {
  it("marks overdue unpaid invoices", () => {
    expect(
      getDueDateState(
        "2026-05-01T00:00:00.000Z",
        "unpaid",
        new Date("2026-05-05T12:00:00.000Z"),
      ),
    ).toMatchObject({
      label: "4 days overdue",
      tone: "danger",
      isOverdue: true,
      isDueSoon: false,
    });
  });

  it("marks due soon invoices without treating paid invoices as overdue", () => {
    expect(
      getDueDateState(
        "2026-05-08T00:00:00.000Z",
        "unpaid",
        new Date("2026-05-05T12:00:00.000Z"),
      ),
    ).toMatchObject({
      label: "Due in 3 days",
      tone: "warning",
      isDueSoon: true,
    });

    expect(
      getDueDateState(
        "2026-04-01T00:00:00.000Z",
        "paid",
        new Date("2026-05-05T12:00:00.000Z"),
      ),
    ).toMatchObject({
      label: "Paid",
      tone: "success",
      isOverdue: false,
    });
  });
});
