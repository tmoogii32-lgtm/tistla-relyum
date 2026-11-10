"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Form";
import { StatCard } from "@/components/ui/StatCard";
import { BLOOM, DIAG_QUESTIONS, DIAG_STRANDS, KNOWLEDGE } from "@/data/diagnostic";
import { analyzeSub, latestPerStudent, summarize, type AnalyzedSub } from "@/lib/analytics";
import { downloadCsv } from "@/lib/csv";
import { STATUS_LABEL, type Status } from "@/lib/diagnosis";
import { today, unique } from "@/lib/tracker";
import { BarChart, ChartCard, LineChart, MARK } from "./Charts";
import type { AdminApi } from "./useAdminData";

const STATUS_ORDER: Status[] = ["ok", "mid", "low"];
const STATUS_FILL: Record<Status, string> = { ok: "var(--color-ok)", mid: "var(--color-warn)", low: "var(--color-danger)" };

export type Filters = { teacher: string; cls: string; from: string; to: string; latestOnly: boolean };
export const NO_FILTERS: Filters = { teacher: "", cls: "", from: "", to: "", latestOnly: true };

/** Шүүлтүүрт тохирох, оношлогдсон сорилууд (сурагчийн нэр, анги, багшийн хамт) */
export function filterSubs(api: AdminApi, f: Filters) {
  const students = new Map(api.students.map((s) => [s.id, s]));
  const all: (AnalyzedSub & { teacherId: string; name: string })[] = api.subs
    .filter((s) => students.has(s.studentId))
    .filter((s) => !f.teacher || s.teacherId === f.teacher)
    .filter((s) => !f.from || s.date >= f.from)
    .filter((s) => !f.to || s.date <= f.to)
    .map((s) => {
      const st = students.get(s.studentId)!;
      return { ...analyzeSub({ ...s, cls: st.cls }), teacherId: s.teacherId, name: st.name };
    })
    .filter((s) => !f.cls || s.cls === f.cls);
  return f.latestOnly ? (latestPerStudent(all) as typeof all) : all;
}

/** Судалгаа: шүүлтүүр → үзүүлэлт → графикууд */
export function Analytics({ api }: { api: AdminApi }) {
  const [f, setF] = useState<Filters>(NO_FILTERS);
  const subs = filterSubs(api, f);
  const s = summarize(subs);
  const classes = unique(api.students.filter((st) => !f.teacher || st.teacherId === f.teacher).map((st) => st.cls)).sort((a, b) =>
    a.localeCompare(b, "mn"),
  );
  const teacherEmail = new Map(api.teachers.map((t) => [t.id, t.email]));
  const set = (patch: Partial<Filters>) => setF((x) => ({ ...x, ...patch }));

  const exportCsv = () => {
    if (!subs.length) return alert("Татах өгөгдөл алга.");
    const header = [
      "Багш",
      "Сурагч",
      "Анги",
      "Огноо",
      "Зөв",
      "Нийт",
      "Хувь",
      "Төлөв",
      ...DIAG_STRANDS.map((x) => `${x} %`),
      ...DIAG_QUESTIONS.map((_, i) => `А${i + 1}`),
    ];
    const rows = subs.map((x) => [
      teacherEmail.get(x.teacherId) ?? "",
      x.name,
      x.cls,
      x.date,
      x.d.earned,
      x.d.possible,
      x.d.pct,
      STATUS_LABEL[x.d.status],
      ...DIAG_STRANDS.map((st) => x.d.byStrand.find((b) => b.strand === st)?.pct ?? ""),
      // Асуулт бүр: 1 — зөв, 0 — буруу/хариулаагүй
      ...DIAG_QUESTIONS.map((q, i) => (x.attempt.answers[i] === q.answer ? 1 : 0)),
    ]);
    downloadCsv([header, ...rows], `sudalgaa-${today()}.csv`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Шүүлтүүр — нэг мөрөнд */}
      <div className="grid gap-4 border-b border-s-border pb-6 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
        <Field label="Багш">
          <select value={f.teacher} onChange={(e) => set({ teacher: e.target.value, cls: "" })} className={inputClass}>
            <option value="">Бүх багш</option>
            {api.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.email}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Анги">
          <select value={f.cls} onChange={(e) => set({ cls: e.target.value })} className={inputClass}>
            <option value="">Бүх анги</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Эхлэх огноо">
          <input type="date" value={f.from} max={f.to || undefined} onChange={(e) => set({ from: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Дуусах огноо">
          <input type="date" value={f.to} min={f.from || undefined} onChange={(e) => set({ to: e.target.value })} className={inputClass} />
        </Field>
        <Button variant="link" onClick={() => setF(NO_FILTERS)} className="lg:mb-3">
          Цэвэрлэх
        </Button>
        <label className="flex cursor-pointer items-center gap-2 text-body sm:col-span-2 lg:col-span-5">
          <input
            type="checkbox"
            checked={f.latestOnly}
            onChange={(e) => set({ latestOnly: e.target.checked })}
            className="size-4 accent-accent"
          />
          Сурагч бүрийн зөвхөн сүүлийн оролдлогыг тооцох (давхар тоолохгүй)
        </label>
      </div>

      {/* Үзүүлэлт */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={s.students} label="Сорил өгсөн сурагч" />
        <StatCard value={s.attempts} label={f.latestOnly ? "Тооцсон оролдлого" : "Нийт оролдлого"} />
        <StatCard value={s.avgPct === null ? "—" : `${s.avgPct}%`} label="Дундаж гүйцэтгэл" />
        <StatCard value={s.attempts ? `${Math.round((s.status.low / s.attempts) * 100)}%` : "—"} label="Хоцрогдолтой (<50%)" />
      </div>

      <StatusBar counts={s.status} total={s.attempts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Хүрээ бүрийн дундаж"
          sub="Тоо тоолол, Алгебр, Геометр, Статистик, Стратеги — дундаж зөв хувь"
          valueHeader="Дундаж %"
          rows={s.attempts ? s.strands.map((x) => ({ label: x.label, value: x.pct })) : []}
        >
          <BarChart horizontal unit="%" label="Хүрээ бүрийн дундаж гүйцэтгэл" rows={s.strands.map((x) => ({ label: x.label, value: x.pct }))} />
        </ChartCard>

        <ChartCard
          title="Анги бүрийн харьцуулалт"
          sub="Ангийн дундаж гүйцэтгэл (n — сурагч/оролдлогын тоо)"
          valueHeader="Дундаж %"
          rows={s.classes.map((x) => ({ label: x.label, value: x.pct, note: `n=${x.n}` }))}
        >
          <BarChart unit="%" label="Анги бүрийн дундаж гүйцэтгэл" rows={s.classes.map((x) => ({ label: x.label, value: x.pct, note: `n=${x.n}` }))} />
        </ChartCard>

        <ChartCard
          title="Хамгийн сул сэдвүүд"
          sub="Зөв хариултын хувь хамгийн бага 8 сэдэв — давтлагын тэргүүлэх чиглэл"
          valueHeader="Зөв %"
          rows={s.attempts ? s.topics.slice(0, 8).map((x) => ({ label: x.label, value: x.pct, note: `${x.n} асуулт` })) : []}
        >
          <BarChart
            horizontal
            unit="%"
            label="Хамгийн сул сэдвүүдийн зөв хариултын хувь"
            rows={s.topics.slice(0, 8).map((x) => ({ label: x.label, value: x.pct, note: `${x.n} асуулт` }))}
          />
        </ChartCard>

        <ChartCard
          title="Гүйцэтгэлийн тархалт"
          sub="Нийт онооны хувиар бүлэглэсэн сурагчдын тоо"
          valueHeader="Сурагч"
          rows={s.attempts ? s.histogram.map((x) => ({ label: `${x.label}%`, value: x.n })) : []}
        >
          <BarChart unit="" label="Гүйцэтгэлийн тархалт" rows={s.histogram.map((x) => ({ label: `${x.label}%`, value: x.n }))} />
        </ChartCard>

        <ChartCard
          title="Асуулт бүрийн зөв хариултын хувь"
          sub="Асуултын шинжилгээ — хэт бага хувьтай асуулт ойлгомжгүй эсвэл хүнд байж болно"
          valueHeader="Зөв %"
          className="lg:col-span-2"
          rows={s.attempts ? s.items.map((x) => ({ label: `${x.label}-р асуулт`, value: x.pct, note: x.topic })) : []}
        >
          <BarChart unit="%" label="Асуулт бүрийн зөв хариултын хувь" rows={s.items.map((x) => ({ label: x.label, value: x.pct, note: x.topic }))} />
        </ChartCard>

        <ChartCard
          title="Мэдлэг × Блумын матриц"
          sub="Нүд бүр — тухайн мэдлэгийн төрөл, Блумын түвшний асуултуудын дундаж зөв хувь"
          valueHeader="Дундаж %"
          className="lg:col-span-2"
          rows={
            s.attempts
              ? KNOWLEDGE.flatMap((k, ki) => BLOOM.map((b, bi) => ({ label: `${k} × ${b}`, value: s.matrix[ki][bi] }))).filter((r) => r.value !== null)
              : []
          }
        >
          <Heatmap matrix={s.matrix} />
        </ChartCard>

        {s.byDate.length >= 2 && (
          <ChartCard
            title="Огноогоор дундаж гүйцэтгэл"
            sub="Тухайн өдөр сорил өгсөн сурагчдын дундаж"
            valueHeader="Дундаж %"
            className="lg:col-span-2"
            rows={s.byDate.map((x) => ({ label: x.label, value: x.pct, note: `n=${x.n}` }))}
          >
            <LineChart label="Огноогоор дундаж гүйцэтгэл" rows={s.byDate.map((x) => ({ label: x.label, value: x.pct, note: `n=${x.n}` }))} />
          </ChartCard>
        )}
      </div>

      <div>
        <Button onClick={exportCsv}>Судалгааны CSV татах</Button>
      </div>
    </div>
  );
}

/** Төлөвийн хуваарилалт — өндөр хэсэгчилсэн мөр, хэсэг бүр нэр, тоотой */
function StatusBar({ counts, total }: { counts: Record<Status, number>; total: number }) {
  if (!total) return null;
  const parts = STATUS_ORDER.map((st) => ({ st, n: counts[st], pct: Math.round((counts[st] / total) * 100) })).filter((p) => p.n);
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-title uppercase">Төлөвийн хуваарилалт</h3>
      <div
        role="img"
        aria-label={parts.map((p) => `${STATUS_LABEL[p.st]}: ${p.n} (${p.pct}%)`).join(", ")}
        className="flex h-7 w-full gap-0.5"
      >
        {parts.map((p) => (
          <div
            key={p.st}
            title={`${STATUS_LABEL[p.st]}: ${p.n} сурагч (${p.pct}%)`}
            className="flex min-w-0 items-center rounded px-1.5 text-eyebrow font-bold whitespace-nowrap text-[#090a0b]"
            style={{ flexGrow: p.n, flexBasis: 0, background: STATUS_FILL[p.st] }}
          >
            {/* Нарийн хэсэгт тоо бичихгүй — нэр, тоо нь доорх тайлбар, title-д бий */}
            {p.pct >= 15 && `${p.pct}%`}
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body">
        {STATUS_ORDER.map((st) => (
          <li key={st} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-sm" style={{ background: STATUS_FILL[st] }} />
            {STATUS_LABEL[st]} <span className="text-s-sub">· {counts[st]} сурагч</span>
          </li>
        ))}
      </ul>
      <p className="text-eyebrow text-s-sub">Эзэмшсэн ≥ 80%, Хэсэгчлэн 50–79%, Хоцрогдолтой &lt; 50%</p>
    </div>
  );
}

/** Мэдлэг × Блум — нэг өнгийн (цайвар → бараан) дулааны зураг, нүд бүрт тоо */
function Heatmap({ matrix }: { matrix: (number | null)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-separate border-spacing-0.5 tabular-nums">
        <thead>
          <tr>
            <th className="p-2 text-left text-eyebrow uppercase text-s-sub">Мэдлэг \ Блум</th>
            {BLOOM.map((b) => (
              <th key={b} className="p-2 text-center text-eyebrow uppercase text-s-sub">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {KNOWLEDGE.map((k, ki) => (
            <tr key={k}>
              <th className="p-2 text-left text-body font-medium">{k}</th>
              {BLOOM.map((b, bi) => {
                const v = matrix[ki][bi];
                const alpha = v === null ? 0 : 0.12 + (v / 100) * 0.8;
                return (
                  <td
                    key={b}
                    title={v === null ? `${k} × ${b}: даалгаваргүй` : `${k} × ${b}: ${v}%`}
                    className="rounded p-3 text-center text-body font-medium"
                    style={
                      v === null
                        ? { background: "var(--color-s-raised)", color: "var(--color-s-sub)" }
                        : { background: `color-mix(in srgb, ${MARK} ${Math.round(alpha * 100)}%, transparent)`, color: alpha > 0.55 ? "#fff" : "#090a0b" }
                    }
                  >
                    {v === null ? "—" : `${v}%`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-eyebrow text-s-sub">Цайвар — бага, бараан — өндөр гүйцэтгэл. &quot;—&quot; — тухайн нүдэнд асуулт байхгүй.</p>
    </div>
  );
}
