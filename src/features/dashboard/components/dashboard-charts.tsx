"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  MonthlySummaryPoint,
  StatusSummaryPoint,
} from "@/features/invoices/lib/finance";
import { formatNaira } from "@/features/invoices/lib/finance";

type DashboardChartsProps = {
  statusSummary: StatusSummaryPoint[];
  monthlySummary: MonthlySummaryPoint[];
};

const statusColors = {
  paid: "#1ba37b",
  unpaid: "#c8ee44",
};

function EmptyChartState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-lg bg-[#fafafa] px-6 text-center text-sm text-[#929eae]">
      {label}
    </div>
  );
}

function ChartFrame({
  children,
  height,
}: {
  children: ReactNode;
  height: number;
}) {
  return (
    <div className="mt-6 min-w-0 w-full" style={{ height, minWidth: 0 }}>
      {children}
    </div>
  );
}

function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    year: "2-digit",
  }).format(new Date(year, monthIndex - 1, 1));
}

function formatAxisAmount(value: number) {
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return `${value}`;
}

export function DashboardCharts({
  statusSummary,
  monthlySummary,
}: DashboardChartsProps) {
  const hasStatusData = statusSummary.some((point) => point.count > 0);
  const hasMonthlyData = monthlySummary.length > 0;

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section
        className="min-w-0 rounded-lg border border-[#f2f4f7] bg-white p-5"
        aria-labelledby="monthly-trend-title"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="monthly-trend-title"
              className="text-lg font-semibold text-[#1b212d]"
            >
              Working Capital
            </h2>
            <p className="text-sm text-[#929eae]">
              Paid revenue and collected VAT by month
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#1b212d]">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#1ba37b]" />
              Revenue
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#c8ee44]" />
              VAT
            </span>
          </div>
        </div>

        <ChartFrame height={300}>
          {hasMonthlyData ? (
            <ResponsiveContainer
              width="100%"
              height={300}
              minWidth={0}
              minHeight={260}
            >
              <AreaChart
                data={monthlySummary.map((point) => ({
                  ...point,
                  label: formatMonthLabel(point.month),
                }))}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#f3f5f8"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929eae", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929eae", fontSize: 12 }}
                  tickFormatter={formatAxisAmount}
                  width={42}
                />
                <Tooltip
                  formatter={(value) => formatNaira(Number(value))}
                  labelClassName="text-[#1b212d]"
                  contentStyle={{
                    border: "1px solid #f2f4f7",
                    borderRadius: 8,
                    boxShadow: "0 16px 40px rgba(27, 33, 45, 0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1ba37b"
                  strokeWidth={2}
                  fill="#1ba37b"
                  fillOpacity={0.08}
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="vat"
                  stroke="#c8ee44"
                  strokeWidth={2}
                  fill="#c8ee44"
                  fillOpacity={0.12}
                  name="VAT"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState label="Paid invoices will appear in the monthly trend once revenue is recorded." />
          )}
        </ChartFrame>
      </section>

      <section
        className="min-w-0 rounded-lg border border-[#f2f4f7] bg-white p-5"
        aria-labelledby="status-chart-title"
      >
        <h2 id="status-chart-title" className="text-lg font-semibold">
          Paid vs Unpaid
        </h2>
        <p className="text-sm text-[#929eae]">
          Invoice count and exposure by status
        </p>

        <ChartFrame height={180}>
          {hasStatusData ? (
            <ResponsiveContainer
              width="100%"
              height={180}
              minWidth={0}
              minHeight={160}
            >
              <PieChart>
                <Pie
                  data={statusSummary}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {statusSummary.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusColors[entry.status]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, props) => [
                    `${value} invoice${Number(value) === 1 ? "" : "s"} (${formatNaira(
                      Number(props.payload?.total ?? 0),
                    )})`,
                    props.payload?.status,
                  ]}
                  contentStyle={{
                    border: "1px solid #f2f4f7",
                    borderRadius: 8,
                    boxShadow: "0 16px 40px rgba(27, 33, 45, 0.08)",
                    textTransform: "capitalize",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState label="Create an invoice to see paid and unpaid status split." />
          )}
        </ChartFrame>

        <div className="mt-4 space-y-3">
          {statusSummary.map((point) => (
            <div key={point.status} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 capitalize text-[#1b212d]">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: statusColors[point.status] }}
                  />
                  {point.status}
                </span>
                <span className="font-mono font-semibold">
                  {formatNaira(point.total)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#f2f4f7]">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${hasStatusData ? Math.max((point.count / Math.max(...statusSummary.map((item) => item.count))) * 100, point.count > 0 ? 8 : 0) : 0}%`,
                    backgroundColor: statusColors[point.status],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="min-w-0 rounded-lg border border-[#f2f4f7] bg-white p-5 xl:col-span-2"
        aria-labelledby="status-bars-title"
      >
        <h2 id="status-bars-title" className="text-lg font-semibold">
          Status Exposure
        </h2>
        <p className="text-sm text-[#929eae]">
          Value comparison for paid revenue and pending payments
        </p>
        <ChartFrame height={220}>
          {hasStatusData ? (
            <ResponsiveContainer
              width="100%"
              height={220}
              minWidth={0}
              minHeight={180}
            >
              <BarChart data={statusSummary} margin={{ left: 0, right: 8 }}>
                <CartesianGrid
                  stroke="#f3f5f8"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929eae", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929eae", fontSize: 12 }}
                  tickFormatter={formatAxisAmount}
                  width={42}
                />
                <Tooltip
                  formatter={(value) => formatNaira(Number(value))}
                  contentStyle={{
                    border: "1px solid #f2f4f7",
                    borderRadius: 8,
                    boxShadow: "0 16px 40px rgba(27, 33, 45, 0.08)",
                    textTransform: "capitalize",
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} name="Total">
                  {statusSummary.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusColors[entry.status]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState label="Status exposure appears after the first invoice is saved." />
          )}
        </ChartFrame>
      </section>
    </div>
  );
}
