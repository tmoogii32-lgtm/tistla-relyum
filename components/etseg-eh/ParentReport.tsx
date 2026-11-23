"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { CheckList, TableWrap, td, th } from "@/components/ui/Lists";
import { StatCard } from "@/components/ui/StatCard";
import { LEVEL_ORDER, MAX_SCORE, PASS_SCORE, type LevelName } from "@/data/levels";
import { cn } from "@/lib/cn";
import { STATUS_LABEL, diagnose, statusOf, type Status } from "@/lib/diagnosis";
import { NOT_CONFIGURED, fetchParentReport, type ParentReport as Report } from "@/lib/parent";
import { averagePercent, byNewest, compareTasks, latestResults, type TaskRecord } from "@/lib/tracker";

const TONE: Record<Status, { text: string; bg: string; border: string }> = {
  ok: { text: "text-ok", bg: "bg-ok/10", border: "border-ok" },
  mid: { text: "text-warn", bg: "bg-warn/10", border: "border-warn" },
  low: { text: "text-danger", bg: "bg-danger/10", border: "border-danger" },
};
const h2 = "font-display text-heading leading-headline font-bold uppercase";

const DIAG_LEVEL = "Онош";
const topicOf = (task: string) => task.split(" · ")[0];

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Нэмэлт даалгаврын явц сэдэв бүрээр: хүрсэн түвшин, тэнцсэн даалгавар, сүүлд бодсон огноо */
function topicSummary(records: TaskRecord[]) {
  const map = new Map<string, { topic: string; level: number; passed: number; total: number; last: string }>();
  const latest = latestResults(records);
  records.forEach((r) => {
    const topic = topicOf(r.task);
    const cur = map.get(topic) ?? { topic, level: 0, passed: 0, total: 0, last: r.date };
    cur.level = Math.max(cur.level, LEVEL_ORDER.indexOf(r.level as LevelName));
    if (r.date > cur.last) cur.last = r.date;
    map.set(topic, cur);
  });
  latest.forEach((r) => {
    const cur = map.get(topicOf(r.task))!;
    cur.total += 1;
    if (r.score >= PASS_SCORE) cur.passed += 1;
  });
  return [...map.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
}

/** Эцэг эхэд зориулсан тайлан: онош, нөхөх төлөвлөгөө, нэмэлт даалгаврын явц */
export function ParentReport() {
  const token = useSearchParams().get("t")?.trim() ?? "";
  const [result, setResult] = useState<{ token: string; report: Report | null; error: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    fetchParentReport(token)
      .then((report) => alive && setResult({ token, report, error: "" }))
      .catch((e: Error) => alive && setResult({ token, report: null, error: e.message }));
    return () => {
      alive = false;
    };
  }, [token]);

  if (!token) return <Notice title="Холбоос дутуу байна">Багшаас ирсэн холбоосыг бүтнээр нь нээнэ үү.</Notice>;
  if (!result || result.token !== token)
    return (
      <p role="status" className="text-body text-s-sub">
        Тайланг ачаалж байна…
      </p>
    );
  if (result.error)
    return (
      <Notice title="Тайланг ачаалж чадсангүй">
        {result.error === NOT_CONFIGURED
          ? "Эцэг эхийн тайлан Supabase-д тохируулагдаагүй байна. Багшид мэдэгдэнэ үү."
          : "Интернэт холболтоо шалгаад хуудсаа дахин ачаална уу."}
      </Notice>
    );
  if (!result.report)
    return (
      <Notice title="Холбоос хүчингүй байна">
        Энэ холбоос шинэчлэгдсэн эсвэл буруу байна. Багшаасаа шинэ холбоос авна уу.
      </Notice>
    );

  return <ReportView r={result.report} />;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <BracketCard accent className="flex flex-col gap-3 bg-s-raised p-6 sm:p-8">
      <h2 className={h2}>{title}</h2>
      <p className="text-body leading-display text-s-sub">{children}</p>
    </BracketCard>
  );
}

function ReportView({ r }: { r: Report }) {
  const tasks = r.records.filter((x) => x.level !== DIAG_LEVEL);
  const latestTasks = latestResults(tasks);
  const behind = latestTasks.filter((x) => x.score < PASS_SCORE).sort(compareTasks);
  const passedCount = latestTasks.length - behind.length;
  const avg = averagePercent(tasks);

  const last = r.diag.at(-1);
  const prev = r.diag.length > 1 ? r.diag.at(-2) : undefined;
  const d = last ? diagnose(last) : null;
  const prevPct = prev ? diagnose(prev).pct : null;

  const lastDate = [...r.records].sort(byNewest)[0]?.date ?? last?.date;
  const topics = topicSummary(tasks);
  const recent = [...r.records].sort(byNewest).slice(0, 15);

  return (
    <div className="flex flex-col gap-10">
      {/* Сурагч */}
      <div className="flex flex-col gap-1">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">{r.cls} анги</p>
        <h2 className="font-display text-display leading-headline font-bold uppercase">{r.name}</h2>
        {lastDate && <p className="text-body text-s-sub">Сүүлд шинэчлэгдсэн: {lastDate}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={d ? `${d.pct}%` : "—"} label="Оношлох сорил" />
        <StatCard value={tasks.length} label="Бодсон нэмэлт даалгавар" />
        <StatCard value={passedCount} label="Тэнцсэн даалгавар" />
        <StatCard value={avg === null ? "—" : `${avg}%`} label="Дундаж гүйцэтгэл" />
      </div>

      {/* 1. Онош ба нөхөх төлөвлөгөө */}
      <BracketCard accent className="flex flex-col gap-6 bg-s-bg p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">1 · Онош</p>
          <h2 className={h2}>Хоцрогдлоо нөхөх төлөвлөгөө</h2>
        </div>
        {!d || !last ? (
          <p className="text-body leading-display text-s-sub">Хүүхэд тань оношлох сорил хараахан өгөөгүй байна.</p>
        ) : (
          <>
            <div className={cn("flex flex-col gap-2 border-l-4 p-4", TONE[d.status].border, TONE[d.status].bg)}>
              <p className={cn("font-display text-title font-bold uppercase", TONE[d.status].text)}>
                {d.pct}% · {d.status === "ok" ? "Хоцрогдолгүй" : d.status === "mid" ? "Хэсэгчлэн хоцрогдолтой" : "Хоцрогдолтой"}
              </p>
              <p className="text-body text-s-sub">
                {last.date}-нд өгсөн сорил · {d.earned}/{d.possible} зөв
                {prevPct !== null && (
                  <span className={cn("ml-2 font-bold", d.pct >= prevPct ? "text-ok" : "text-danger")}>
                    {d.pct >= prevPct ? "▲" : "▼"} {Math.abs(d.pct - prevPct)}% (өмнөх {prevPct}%)
                  </span>
                )}
              </p>
            </div>

            {d.weakTopics.length === 0 ? (
              <p className="text-body leading-display">🏆 Бүх сэдвийг эзэмшсэн байна. Ахисан, гүнзгий түвшний даалгавраар мэдлэгээ гүнзгийрүүлж байна.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {d.weakTopics.map((t, i) => {
                  const s = statusOf(t.pct);
                  return (
                    <li key={t.topic} className={cn("grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-l-4 p-4", TONE[s].border, TONE[s].bg)}>
                      <span className="grid size-8 place-items-center bg-surface-black font-display text-label font-bold text-accent">{i + 1}</span>
                      <div className="flex flex-col gap-1">
                        <p className="text-label">
                          <b className="font-display uppercase">{t.topic}</b> <span className="text-s-sub">({t.strand})</span> —{" "}
                          <span className={cn("font-bold", TONE[s].text)}>
                            {t.pct}% · {STATUS_LABEL[s]}
                          </span>
                        </p>
                        <p className="text-body leading-display text-s-sub">
                          {s === "low"
                            ? "Суурь (Т1) түвшнээс эхэлж давтана: 3 даалгаврыг тус бүр 5-аас 4-өөр давах хүртэл бодно."
                            : "Суурь түвшнийг хурдан давж, Дунд (Т2) түвшинд бататгана."}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="text-body leading-display">
              📅 Дахин оношлох сорил өгөх хугацаа: <b>{addDays(last.date, 14)}</b> орчим (2 долоо хоногийн дараа ахицаа харьцуулна).
            </p>
          </>
        )}
      </BracketCard>

      {/* 2. Нэмэлт даалгаврын явц */}
      <BracketCard className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">2 · Нэмэлт даалгавар</p>
          <h2 className={h2}>Даалгавартай ажиллаж буй байдал</h2>
          <p className="text-body leading-display text-s-sub">
            Сэдэв бүр 4 түвшинтэй (Суурь → Дунд → Ахисан → Гүнзгий). Даалгавар бүр 5 бодлоготой, {PASS_SCORE} ба түүнээс дээш зөв бол тэнцэнэ.
          </p>
        </div>
        {!topics.length ? (
          <p className="text-body text-s-sub">Нэмэлт даалгавар хараахан бодоогүй байна.</p>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[36rem] border-collapse">
              <thead>
                <tr>
                  {["Сэдэв", "Хүрсэн түвшин", "Тэнцсэн", "Сүүлд бодсон"].map((x) => (
                    <th key={x} className={th}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr key={t.topic}>
                    <td className={cn(td, "font-medium")}>{t.topic}</td>
                    <td className={td}>
                      Т{t.level + 1} · {LEVEL_ORDER[t.level]}
                    </td>
                    <td className={cn(td, t.passed === t.total ? "text-ok" : "text-warn", "font-bold")}>
                      {t.passed}/{t.total}
                    </td>
                    <td className={cn(td, "whitespace-nowrap")}>{t.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}

        {behind.length > 0 && (
          <div className="flex flex-col gap-3 border-l-4 border-danger bg-danger/5 p-4">
            <p className="font-display text-label font-bold uppercase text-danger">Дахин бодох шаардлагатай ({behind.length})</p>
            <ul className="flex flex-col gap-1 text-body leading-display">
              {behind.map((b) => (
                <li key={`${b.task}|${b.level}`}>
                  {b.task} · {b.level} — <b className="text-danger">{b.score}/{MAX_SCORE}</b> <span className="text-s-sub">({b.date})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BracketCard>

      {/* 3. Сүүлийн дүнгүүд */}
      {recent.length > 0 && (
        <BracketCard className="flex min-w-0 flex-col gap-6">
          <h2 className={h2}>Сүүлийн дүнгүүд</h2>
          <TableWrap>
            <table className="w-full min-w-[36rem] border-collapse">
              <thead>
                <tr>
                  {["Огноо", "Даалгавар", "Түвшин", "Дүн"].map((x) => (
                    <th key={x} className={th}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((x, i) => (
                  <tr key={i}>
                    <td className={cn(td, "whitespace-nowrap")}>{x.date}</td>
                    <td className={td}>{x.task}</td>
                    <td className={td}>{x.level}</td>
                    <td className={cn(td, "font-bold", x.score >= PASS_SCORE ? "text-ok" : "text-danger")}>
                      {x.score}/{MAX_SCORE}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </BracketCard>
      )}

      {/* 4. Зөвлөмж */}
      <BracketCard className="flex flex-col gap-4 bg-s-raised">
        <h2 className={h2}>Гэрээсээ хэрхэн дэмжих вэ?</h2>
        <CheckList
          items={[
            "Өдөр бүр 20–30 минут тогтмол цагт даалгавар бодуулаарай. Богино боловч тогтмол давтлага хамгийн үр дүнтэй.",
            "Хүүхдээсээ «Энэ бодлогыг яаж бодсоноо тайлбарлаад өгөөч» гэж асуугаарай. Тайлбарлах нь ойлголтыг бататгадаг.",
            "Алдаа гаргахад загнахгүй, бодолтынхоо алхмыг дахин шалгахыг урамшуулаарай.",
            "Дахин бодох шаардлагатай даалгаврыг тэнцтэл нь давтуулж, ахицыг нь магтаарай.",
            "Асуух зүйл байвал ангийн багштайгаа холбогдоорой.",
          ]}
        />
      </BracketCard>
    </div>
  );
}
