"use client";

import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip, type ChartOptions } from "chart.js";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { HIGH_IMPACT, INTERVENTIONS } from "@/data/tuvshin";
import { cn } from "@/lib/cn";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/* Сайтын token-уудтай ижил өнгө (canvas CSS хувьсагч уншдаггүй) */
const ACCENT = "#02d2e3";
const DANGER = "#ef5b5b";
const MUTED = "#b6c1c8";
const GRID = "#dfe5e9";

type Filter = "all" | "high" | "low";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Бүх интервенц" },
  { value: "high", label: `Өндөр үр дүнтэй (d ≥ ${HIGH_IMPACT.toFixed(2)})` },
  { value: "low", label: `Бага / Үр дүнгүй (d < ${HIGH_IMPACT.toFixed(2)})` },
];

function colorOf(v: number) {
  if (v === 0) return DANGER;
  return v >= 0.45 ? ACCENT : MUTED;
}

/** Интервенцүүдийн үр нөлөөний хэмжээ (d) — хэвтээ баганан график, шүүлтүүртэй */
export function ImpactChart() {
  const [filter, setFilter] = useState<Filter>("all");
  // next/font-ын үүсгэсэн фонтын нэрийг canvas-д дамжуулна (client-д л байна)
  const [fontFamily] = useState(() => (typeof window === "undefined" ? undefined : getComputedStyle(document.body).fontFamily));

  const rows = INTERVENTIONS.filter((d) =>
    filter === "high" ? d.value >= HIGH_IMPACT : filter === "low" ? d.value < HIGH_IMPACT : true,
  );

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const item = rows[ctx.dataIndex];
            return ` Effect Size: d = ${item.value} | Задалгааны зардал: ${item.cost}`;
          },
        },
      },
    },
    scales: {
      x: {
        min: -0.1,
        max: 0.8,
        grid: { color: GRID },
        title: { display: true, text: "Стандарт хазайлт (d) - 0.40+ нь өндөр үр ашигтай", font: { size: 11, family: fontFamily } },
        ticks: { font: { family: fontFamily } },
      },
      y: { grid: { display: false }, ticks: { font: { size: 11, family: fontFamily } } },
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-s-border pb-4">
        <div role="group" aria-label="Шүүлтүүр" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "cursor-pointer border px-4 py-2 text-eyebrow font-semibold uppercase transition-colors",
                filter === f.value ? "border-accent bg-accent text-foreground" : "border-s-border hover:border-accent",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-eyebrow text-s-sub italic">Эх сурвалж: Education Endowment Foundation (EEF) & World Bank 2024</p>
      </div>

      <div className="relative mx-auto h-[22rem] w-full max-w-3xl md:h-100">
        <Bar
          options={options}
          aria-label="Интервенцүүдийн үр нөлөөний хэмжээ"
          role="img"
          data={{
            labels: rows.map((d) => d.label),
            datasets: [
              {
                label: "Үр нөлөөний хэмжээ (Effect Size - d)",
                data: rows.map((d) => d.value),
                backgroundColor: rows.map((d) => colorOf(d.value)),
                borderSkipped: false,
              },
            ],
          }}
        />
      </div>

      {/* Дэлгэц уншигчид зориулсан хүснэгт */}
      <table className="sr-only">
        <caption>Интервенцүүдийн үр нөлөөний хэмжээ</caption>
        <thead>
          <tr>
            <th>Интервенц</th>
            <th>d</th>
            <th>Зардал</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.value}</td>
              <td>{d.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
