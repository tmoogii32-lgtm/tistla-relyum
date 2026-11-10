"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DiagnosticTest } from "@/components/daalgavar/Diagnostic";
import { DiagnosisReport } from "@/components/daalgavar/DiagnosisReport";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Form";
import { TableWrap, td, th } from "@/components/ui/Lists";
import { DIAG_QUESTIONS } from "@/data/diagnostic";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/cn";
import { EMPTY_DIAG, STATUS_LABEL, diagnose, isDiagStore, strandScores, type DiagAttempt, type DiagStore, type Status } from "@/lib/diagnosis";
import { TOPICS } from "@/lib/problems";
import { GUEST } from "@/lib/taskProgress";
import { today, type Student, type TaskRecord } from "@/lib/tracker";

const isString = (v: unknown): v is string => typeof v === "string";
const linkCls = "underline decoration-accent decoration-2 underline-offset-4 hover:text-accent";

const TONE: Record<Status, { text: string; bg: string; badge: string }> = {
  ok: { text: "text-ok", bg: "bg-ok/10", badge: "bg-ok/15 text-ok" },
  mid: { text: "text-warn", bg: "bg-warn/10", badge: "bg-warn/15 text-warn" },
  low: { text: "text-danger", bg: "bg-danger/10", badge: "bg-danger/15 text-danger" },
};

const scrollTo = (id: string) =>
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));

type Props = {
  students: Student[];
  addRecord: (rec: Omit<TaskRecord, "id" | "created">) => void;
};

/**
 * Оношлох сорил: сурагч сонгож сорил өгөх → товч дүн → бүх сурагчийн жагсаалт → сонгосон сурагчийн бүтэн тайлан
 * (онош, Мэдлэг × Блумын матриц, нөхөх төлөвлөгөө, зөвлөгөө, хариу). Хүрээ бүрийн дүн бүртгэлд автоматаар орно.
 */
export function DiagnosisSection({ students, addRecord }: Props) {
  const router = useRouter();
  const [store, setStore] = useLocalStorage<DiagStore>("onosh-v1", EMPTY_DIAG, isDiagStore);
  const [active, setActive] = useLocalStorage<string>("daalgavar-student", GUEST, isString);
  const [, setTopic] = useLocalStorage<string>("daalgavar-topic", TOPICS[0].id, isString);
  const [testing, setTesting] = useState(false);
  const [sel, setSel] = useState<string | null>(null);

  // Сорил өгөх сурагч
  const student = students.find((s) => s.id === active);
  const sid = student ? student.id : GUEST;
  const myHistory = store[sid] ?? [];
  const myLatest = myHistory[myHistory.length - 1];
  const myDiag = myLatest ? diagnose(myLatest) : null;

  // Бүх сурагчийн сүүлийн дүн
  const rows = [...students.map((s) => ({ id: s.id, name: s.name, cls: s.cls })), { id: GUEST, name: "Зочин (бүртгэлгүй)", cls: "—" }]
    .filter((r) => store[r.id]?.length)
    .map((r) => {
      const history = store[r.id];
      const latest = history[history.length - 1];
      return { ...r, history, latest, d: diagnose(latest) };
    });
  const selectedId = sel && rows.some((r) => r.id === sel) ? sel : (rows.find((r) => r.id === active)?.id ?? rows[0]?.id);
  const selected = rows.find((r) => r.id === selectedId);

  const submit = (a: DiagAttempt) => {
    setStore((s) => ({ ...s, [sid]: [...(s[sid] ?? []), a] }));
    setTesting(false);
    setSel(sid);
    if (student) {
      // Хүрээ бүрийн дүнг 5-ын хуваарьт бүртгэнэ (80% = 4 = тэнцэх босго)
      strandScores(diagnose(a)).forEach(({ strand, score }) =>
        addRecord({ studentId: student.id, task: `Оношлох сорил · ${strand}`, level: "Онош", score, date: today() }),
      );
    }
    scrollTo("onosh-test");
  };

  /** Тухайн сурагчаар дахин сорил өгөх */
  const retakeFor = (id: string) => {
    setActive(id);
    setTesting(true);
    scrollTo("onosh-test");
  };

  /** Тухайн сурагч, сэдвээр "Даалгавартай ажиллах" хуудас руу */
  const openTopic = (topicId: string) => {
    if (!selected) return;
    setActive(selected.id);
    setTopic(topicId);
    router.push("/daalgavar#ajillah");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Сорил өгөх */}
      <div id="onosh-test" className="flex scroll-mt-4 flex-col gap-6">
        <BracketCard className="flex flex-col gap-4 bg-s-raised md:flex-row md:items-end md:justify-between">
          <Field label="Сорил өгөх сурагч" className="md:w-96">
            <select
              value={sid}
              onChange={(e) => {
                setActive(e.target.value);
                setTesting(false);
              }}
              className={inputClass}
            >
              <option value={GUEST}>Зочин (бүртгэлгүй)</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cls})
                </option>
              ))}
            </select>
          </Field>
          <p className="max-w-xl text-body leading-display text-s-sub">
            {student ? (
              <>
                Сорилын хүрээ бүрийн дүн <strong className="text-s-fg">{student.name}</strong>-ийн нэр дээр автоматаар бүртгэгдэнэ.
              </>
            ) : (
              <>
                Зочин горимд дүн бүртгэгдэхгүй. Сурагчаа дээрх{" "}
                <a href="#students" className={linkCls}>
                  жагсаалтад бүртгээд
                </a>{" "}
                сонгоно уу.
              </>
            )}
          </p>
        </BracketCard>

        {testing ? (
          <DiagnosticTest onSubmit={submit} onCancel={myLatest ? () => setTesting(false) : undefined} />
        ) : myLatest && myDiag ? (
          <BracketCard accent className={cn("grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center", TONE[myDiag.status].bg)}>
            <div className="flex flex-col items-start gap-1">
              <p className="text-eyebrow uppercase text-s-sub">
                {student ? `${student.name} · ` : ""}
                {myLatest.date}
              </p>
              <p className={cn("font-display text-impact leading-cap font-bold", TONE[myDiag.status].text)}>{myDiag.pct}%</p>
              <p className="text-body text-s-sub">
                {myDiag.earned}/{myDiag.possible} зөв
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className={cn("font-display text-heading leading-headline font-bold uppercase", TONE[myDiag.status].text)}>
                {STATUS_LABEL[myDiag.status]}
              </h3>
              <p className="text-body leading-display">
                Дэлгэрэнгүй онош, Мэдлэг × Блумын матриц, хоцрогдлоо нөхөх төлөвлөгөө, зөвлөгөө доор гарсан.
              </p>
              <Actions>
                <Button
                  onClick={() => {
                    setSel(sid);
                    scrollTo("onosh-report");
                  }}
                >
                  Онош, төлөвлөгөөг харах
                </Button>
                <Button variant="link" onClick={() => setTesting(true)}>
                  Сорилыг дахин өгөх
                </Button>
              </Actions>
            </div>
          </BracketCard>
        ) : (
          <BracketCard accent className="flex flex-col items-start gap-4 bg-s-bg p-6 sm:p-8">
            <p className="text-lead leading-display">
              {student ? `${student.name} оношлох сорил хараахан өгөөгүй байна.` : "Оношлох сорил өгч, аль сэдэвт хоцрогдол байгааг тодорхойл."}
            </p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-body leading-display text-s-sub">
              <li>Эхлээд хүрээ бүрт өөрийгөө 1–4 оноогоор үнэлнэ.</li>
              <li>Дараа нь {DIAG_QUESTIONS.length} даалгаварт хариулна — дурын дарааллаар шилжиж болно (~30 минут).</li>
              <li>Илгээсний дараа онош, Мэдлэг × Блумын матриц, хоцрогдлоо нөхөх төлөвлөгөө доор шууд гарна.</li>
            </ul>
            <Actions>
              <Button onClick={() => setTesting(true)}>Сорил эхлэх</Button>
            </Actions>
          </BracketCard>
        )}
      </div>

      {/* Бүх сурагчийн дүн */}
      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-title uppercase">Сорил өгсөн сурагчид</h3>
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
                        <span className={cn("inline-block px-2 py-1 text-eyebrow font-medium whitespace-nowrap uppercase", TONE[r.d.status].badge)}>
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
                            scrollTo("onosh-report");
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
        </div>
      )}

      {/* Сонгосон сурагчийн бүтэн тайлан */}
      {selected && (
        <div id="onosh-report" className="flex scroll-mt-4 flex-col gap-4">
          <h3 className="font-display text-heading leading-headline font-bold uppercase">{selected.name} — оношийн тайлан</h3>
          <DiagnosisReport
            key={`${selected.id}-${selected.history.length}`}
            attempt={selected.latest}
            previous={selected.history[selected.history.length - 2]}
            studentName={selected.name}
            onRetake={() => retakeFor(selected.id)}
            onOpenTopic={openTopic}
          />
          <p className="text-eyebrow text-s-sub">
            Төлөвлөгөөний ▶ сэдэв дээр дарахад{" "}
            <Link href="/daalgavar#ajillah" className={linkCls}>
              Даалгавартай ажиллах
            </Link>{" "}
            хуудас тухайн сурагч, сэдвээр нээгдэнэ.
          </p>
        </div>
      )}
    </div>
  );
}
