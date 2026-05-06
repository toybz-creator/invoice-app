export type DueDateState = {
  label: string;
  tone: "neutral" | "warning" | "danger" | "success";
  daysUntilDue: number;
  isOverdue: boolean;
  isDueSoon: boolean;
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDueDateState(
  dueDate: string,
  status: "paid" | "unpaid",
  now = new Date(),
): DueDateState {
  if (status === "paid") {
    return {
      label: "Paid",
      tone: "success",
      daysUntilDue: 0,
      isOverdue: false,
      isDueSoon: false,
    };
  }

  const due = startOfLocalDay(new Date(dueDate));
  const today = startOfLocalDay(now);
  const daysUntilDue = Math.ceil(
    (due.getTime() - today.getTime()) / 86_400_000,
  );

  if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);

    return {
      label: `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`,
      tone: "danger",
      daysUntilDue,
      isOverdue: true,
      isDueSoon: false,
    };
  }

  if (daysUntilDue === 0) {
    return {
      label: "Due today",
      tone: "warning",
      daysUntilDue,
      isOverdue: false,
      isDueSoon: true,
    };
  }

  return {
    label: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`,
    tone: daysUntilDue <= 7 ? "warning" : "neutral",
    daysUntilDue,
    isOverdue: false,
    isDueSoon: daysUntilDue <= 7,
  };
}

export function formatInvoiceDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function toDateInputValue(date: string) {
  return date.slice(0, 10);
}
