"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DiagnosisReport } from "@/components/daalgavar/DiagnosisReport";
import { BracketCard } from "@/components/ui/BracketCard";
import { Button } from "@/components/ui/Button";
import { TableWrap, td, th } from "@/components/ui/Lists";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/cn";
import { EMPTY_DIAG, STATUS_LABEL, diagnose, isDiagStore, type DiagStore, type Status } from "@/lib/diagnosis";
import { TOPICS } from "@/lib/problems";
import { GUEST } from "@/lib/taskProgress";
import type { Student } from "@/lib/tracker";

const isString = (v: unknown): v is string => typeof v === "string";

const BADGE: Record<Status, string> = {
  ok: "bg-ok/15 text-ok",
  mid: "bg-warn/15 text-warn",
  low: "bg-danger/15 text-danger",
};

/**
 * Сурагч бүрийн оношлох сорилын дүн: жагсаалт + сонгосон сурагчийн бүтэн тайлан
 * (онош, Мэдлэг × Блумын матриц, нөхөх төлөвлөгөө, зөвлөгөө, хариу).
 * Сорилыг "Даалгавартай ажиллах" хуудсанд өгнө.
 */
export function DiagnosisSection({ students }: { students: Student[] }) {
  const router = useRouter();
  const [store] = useLocalStorage<DiagStore>("onosh-v1", EMPTY_DIAG, isDiagStore);
  const [active, setActive] = useLocalStorage<string>("daalgavar-student", GUEST, isString);
  const [, setTopic] = useLocalStorage<string>("daalgavar-topic", TOPICS[0].id, isString);
  const [sel, setSel] = useState<string | null>(null);

  const rows = [...students.map((s) => ({ id: s.id, name: s.name, cls: s.cls })), { id: GUEST, name: "Зочин (бүртгэлгүй)", cls: "—" }]
    .filter((r) => store[r.id]?.length)
    .map((r) => {
      const history = store[r.id];
      const latest = history[history.length - 1];
      return { ...r, history, latest, d: diagnose(latest) };
    });

  const selectedId = sel && rows.some((r) => r.id === sel) ? sel : (rows.find((r) => r.id === active)?.id ?? rows[0]?.id);
  const selected = rows.find((r) => r.id === selectedId);

  /** Тухайн сурагчийг сонгоод "Даалгавартай ажиллах" хуудас руу */
  const goWork = (hash: string, topicId?: string) => {
    if (!selected) return;
    setActive(selected.id);
    if (topicId) setTopic(topicId);
    router.push(`/daalgavar${hash}`);
  };

  if (!rows.length) {
    return (
      <BracketCard className="flex flex-col items-start gap-4 bg-s-bg">
        <p className="text-body leading-display text-s-sub">
          Одоогоор оношлох сорил өгсөн сурагч алга. Сурагч &quot;Даалгавартай ажиллах&quot; хуудсанд нэрээ сонгоод сорил өгөхөд дүн, онош,
          нөхөх төлөвлөгөө нь энд гарна.
        </p>
        <Button href="/daalgavar#onosh">Оношлох сорил өгөх</Button>
      </BracketCard>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <TableWrap>
        <table className="w-full min-w-[46rem] border-collapse">
          <thead>
            <tr>
              {["Сурагч", "Анги", "Огноо", "Оноо", "Хувь", "Төлөв", "Давтах сэдэв", "Оролдлого"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
              <th className={th}>
                <span className="sr-only">Үйлдэл</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const on = r.id === selectedId;
              return (
                <tr key={r.id} className={on ? "bg-accent-muted" : undefined}>
                  <td className={cn(td, "font-medium")}>{r.name}</td>
                  <td className={td}>{r.cls}</td>
                  <td className={cn(td, "whitespace-nowrap")}>{r.latest.date}</td>
                  <td className={td}>
                    {r.d.earned}/{r.d.possible}
                  </td>
                  <td className={cn(td, "font-bold")}>{r.d.pct}%</td>
                  <td className={td}>
                    <span className={cn("inline-block px-2 py-1 text-eyebrow font-medium whitespace-nowrap uppercase", BADGE[r.d.status])}>
                      {STATUS_LABEL[r.d.status]}
                    </span>
                  </td>
                  <td className={td}>
                    {r.d.weakTopics.length ? (
                      <>
                        {r.d.weakTopics
                          .slice(0, 2)
                          .map((t) => t.topic)
                          .join(", ")}
                        {r.d.weakTopics.length > 2 && <span className="text-s-sub"> +{r.d.weakTopics.length - 2}</span>}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={td}>{r.history.length}</td>
                  <td className={td}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setSel(r.id);
                        requestAnimationFrame(() => document.getElementById("onosh-report")?.scrollIntoView({ behavior: "smooth", block: "start" }));
                      }}
                      className="cursor-pointer text-eyebrow font-bold whitespace-nowrap uppercase underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                    >
                      {on ? "Харж байна" : "Онош харах"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>

      {selected && (
        <div id="onosh-report" className="flex scroll-mt-[calc(var(--nav-h)+1rem)] flex-col gap-4">
          <h3 className="font-display text-heading leading-headline font-bold uppercase">
            {selected.name} — оношийн тайлан
          </h3>
          <DiagnosisReport
            key={selected.id}
            attempt={selected.latest}
            previous={selected.history[selected.history.length - 2]}
            studentName={selected.name}
            onRetake={() => goWork("#onosh")}
            onOpenTopic={(topicId) => goWork("#ajillah", topicId)}
          />
        </div>
      )}
    </div>
  );
}
