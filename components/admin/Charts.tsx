"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { useState, type ReactNode } from "react";
import { Bar, Line } from "react-chartjs-2";
import { BracketCard } from "@/components/ui/BracketCard";
import { cn } from "@/lib/cn";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip);

/* Нэг цуваатай график — сайтын цэнхэрийн бараан алхам (цайвар #02d2e3 нь цагаан дээр 1.8:1 тул).
   Хүснэгтээр харах сонголт бүх графикт бий. */
export const MARK = "#0b8f9c";
const GRID = "#dfe5e9";
const INK = "#535450";

function useFont() {
  const [family] = useState(() => (typeof window === "undefined" ? undefined : getComputedStyle(document.body).fontFamily));
  return family;
}

type Row = { label: string; value: number | null; note?: string };

/** Гарчиг + график + "Хүснэгтээр харах" */
export function ChartCard({
  title,
  sub,
  rows,
  valueHeader,
  children,
  className,
}: {
  title: string;
  sub?: string;
  rows: Row[];
  valueHeader: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <BracketCard className={cn("flex min-w-0 flex-col gap-4 bg-s-bg p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-title leading-headline font-bold uppercase">{title}</h3>
        {sub && <p className="text-body leading-display text-s-sub">{sub}</p>}
      </div>
      {rows.length ? children : <p className="py-8 text-center text-body text-s-sub">Өгөгдөл алга</p>}
      {rows.length > 0 && (
        <details className="text-body">
          <summary className="cursor-pointer text-eyebrow font-medium uppercase text-s-sub hover:text-accent">Хүснэгтээр харах</summary>
          <table className="mt-3 w-full border-collapse tabular-nums">
            <tbody>
              <tr>
                <th className="border-b border-s-border py-1 pr-4 text-left text-eyebrow uppercase text-s-sub">Нэр</th>
                <th className="border-b border-s-border py-1 text-right text-eyebrow uppercase text-s-sub">{valueHeader}</th>
              </tr>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="border-b border-s-border py-1 pr-4">
                    {r.label}
                    {r.note && <span className="text-s-sub"> · {r.note}</span>}
                  </td>
                  <td className="border-b border-s-border py-1 text-right">{r.value ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </BracketCard>
  );
}

const axisCommon = (family?: string) => ({
  grid: { color: GRID, lineWidth: 1 },
  border: { display: false },
  ticks: { color: INK, font: { family, size: 11 } },
});

/**
 * Баганан график (нэг цуваа). `horizontal` — урт нэртэй ангилалд.
 * `unit` — "%" бол 0–100 тэнхлэг.
 */
export function BarChart({
  rows,
  unit,
  horizontal,
  label,
  height,
}: {
  rows: Row[];
  unit: "%" | "";
  horizontal?: boolean;
  label: string;
  height?: number;
}) {
  const family = useFont();
  const valueAxis = {
    ...axisCommon(family),
    beginAtZero: true,
    ...(unit === "%" ? { max: 100, ticks: { ...axisCommon(family).ticks, stepSize: 20, callback: (v: string | number) => `${v}%` } } : {}),
    ...(unit === "" ? { ticks: { ...axisCommon(family).ticks, precision: 0 } } : {}),
  };
  const catAxis = { ...axisCommon(family), grid: { display: false } };
  const options: ChartOptions<"bar"> = {
    indexAxis: horizontal ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const r = rows[ctx.dataIndex];
            return ` ${r.value ?? "—"}${unit}${r.note ? ` · ${r.note}` : ""}`;
          },
        },
      },
    },
    scales: horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis },
  };
  const h = height ?? (horizontal ? Math.max(160, rows.length * 34 + 40) : 260);
  return (
    <div className="relative w-full" style={{ height: h }}>
      <Bar
        options={options}
        role="img"
        aria-label={label}
        data={{
          labels: rows.map((r) => r.label),
          datasets: [
            {
              label,
              data: rows.map((r) => r.value),
              backgroundColor: MARK,
              hoverBackgroundColor: "#086f79",
              maxBarThickness: 24,
              borderRadius: 4,
              borderSkipped: "start",
            },
          ],
        }}
      />
    </div>
  );
}

/** Шугаман график (нэг цуваа, %), огноо бүрийн дундаж */
export function LineChart({ rows, label }: { rows: Row[]; label: string }) {
  const family = useFont();
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const r = rows[ctx.dataIndex];
            return ` ${r.value}%${r.note ? ` · ${r.note}` : ""}`;
          },
        },
      },
    },
    scales: {
      x: { ...axisCommon(family), grid: { display: false } },
      y: { ...axisCommon(family), beginAtZero: true, max: 100, ticks: { ...axisCommon(family).ticks, stepSize: 20, callback: (v) => `${v}%` } },
    },
  };
  return (
    <div className="relative h-[260px] w-full">
      <Line
        options={options}
        role="img"
        aria-label={label}
        data={{
          labels: rows.map((r) => r.label),
          datasets: [
            {
              label,
              data: rows.map((r) => r.value),
              borderColor: MARK,
              backgroundColor: MARK,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBorderColor: "#f7fafb",
              pointBorderWidth: 2,
              tension: 0,
            },
          ],
        }}
      />
    </div>
  );
}
