"use client";

import Link from "next/link";
import { useState } from "react";
import { BehindTable, RecordTable } from "@/components/hotsrogdol/parts";
import { useTracker } from "@/components/hotsrogdol/useTracker";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Form";
import { DIAG_QUESTIONS } from "@/data/diagnostic";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/cn";
import { EMPTY_DIAG, STATUS_LABEL, diagnose, isDiagStore, strandScores, type DiagAttempt, type DiagStore, type Status } from "@/lib/diagnosis";
import { TOPICS } from "@/lib/problems";
import { GUEST } from "@/lib/taskProgress";
import { compareStudents, today } from "@/lib/tracker";
import { DiagnosticTest } from "./Diagnostic";
import { Workspace } from "./Workspace";

const isString = (v: unknown): v is string => typeof v === "string";

const SUMMARY_TONE: Record<Status, { text: string; bg: string }> = {
  ok: { text: "text-ok", bg: "bg-ok/10" },
  mid: { text: "text-warn", bg: "bg-warn/10" },
  low: { text: "text-danger", bg: "bg-danger/10" },
};
const linkCls = "underline decoration-accent decoration-2 underline-offset-4 hover:text-accent";

function StepTitle({ n, title, text, id }: { n: number; title: string; text: string; id: string }) {
  return (
    <div id={id} className="flex scroll-mt-[calc(var(--nav-h)+1rem)] flex-col gap-2 border-t border-s-border pt-10">
      <p className="flex items-center gap-3">
        <span className="grid size-9 place-items-center bg-accent font-display text-title font-bold text-foreground">{n}</span>
        <span className="font-display text-heading leading-headline font-bold uppercase">{title}</span>
      </p>
      <p className="max-w-3xl text-body leading-display text-s-sub">{text}</p>
    </div>
  );
}

/**
 * Даалгавартай ажиллах хуудасны бүх хэсэг нэг state хуваалцана:
 * сурагч → ① оношлох сорил (шууд онош, зөвлөгөө) → ② түвшинчилсэн даалгавар → ③ автомат дүнгийн бүртгэл.
 */
export function Hub() {
  const { state: tracker, addRecord, deleteRecord } = useTracker();
  const [studentId, setStudentId] = useLocalStorage<string>("daalgavar-student", GUEST, isString);
  const [diagStore, setDiagStore] = useLocalStorage<DiagStore>("onosh-v1", EMPTY_DIAG, isDiagStore);

  const students = [...tracker.students].sort(compareStudents);
  const student = students.find((s) => s.id === studentId);
  const sid = student ? student.id : GUEST;

  // "Хоцрогдлыг тооцох" хуудасны зөвлөгөөнөөс ч сэдэв сонгогддог тул хадгална
  const [topicId, setTopicId] = useLocalStorage<string>("daalgavar-topic", TOPICS[0].id, isString);
  const [testing, setTesting] = useState(false);
  const [recordSel, setRecordSel] = useState<string | null>(null);

  const history = diagStore[sid] ?? [];
  const latest = history[history.length - 1];
  const latestDiag = latest ? diagnose(latest) : null;

  const submitDiag = (a: DiagAttempt) => {
    setDiagStore((s) => ({ ...s, [sid]: [...(s[sid] ?? []), a] }));
    setTesting(false);
    if (student) {
      // Хүрээ бүрийн дүнг 5-ын хуваарьт бүртгэнэ (80% = 4 = тэнцэх босго)
      strandScores(diagnose(a)).forEach(({ strand, score }) =>
        addRecord({ studentId: student.id, task: `Оношлох сорил · ${strand}`, level: "Онош", score, date: today() }),
      );
    }
    requestAnimationFrame(() => document.getElementById("onosh")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const confirmDeleteRecord = (id: string) => {
    if (confirm("Энэ дүнгийн бүртгэлийг устгах уу?")) deleteRecord(id);
  };

  const recSelected = recordSel ?? (student ? student.id : "");

  return (
    <div className="flex flex-col gap-10">
      {/* Сурагч сонгох */}
      <BracketCard className="flex flex-col gap-4 bg-s-raised md:flex-row md:items-end md:justify-between">
        <Field label="Сурагч" className="md:w-96">
          <select
            value={sid}
            onChange={(e) => {
              setStudentId(e.target.value);
              setRecordSel(null);
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
              Сорил болон даалгавар бүрийн дүн <strong className="text-s-fg">{student.name}</strong>-ийн нэр дээр{" "}
              <a href="#burtgel" className={linkCls}>
                дүнгийн бүртгэлд
              </a>{" "}
              автоматаар орно. Багш гараар бүртгэх шаардлагагүй.
            </>
          ) : (
            <>
              Зочин горимд явц энэ браузерт хадгалагдах ч дүн бүртгэгдэхгүй.{" "}
              <Link href="/hotsrogdol#students" className={linkCls}>
                Сурагч бүртгэх →
              </Link>
            </>
          )}
        </p>
      </BracketCard>

      {/* ① Оношлох сорил */}
      <StepTitle
        n={1}
        id="onosh"
        title="Оношлох сорил"
        text={`Мэдлэгийн 4 төрөл ба Блумын матрицаар хоцрогдлыг оношилно: 4 өөрийн үнэлгээ, ${DIAG_QUESTIONS.length} сонгох даалгавар, ~30 минут. Илгээмэгц дүн гарч, дэлгэрэнгүй онош, Мэдлэг × Блумын матриц, хоцрогдлоо нөхөх төлөвлөгөө "Хоцрогдлыг тооцох" хэсэгт хадгалагдана.`}
      />
      {testing ? (
        <DiagnosticTest onSubmit={submitDiag} onCancel={latest ? () => setTesting(false) : undefined} />
      ) : latest && latestDiag ? (
        <BracketCard accent className={cn("grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center", SUMMARY_TONE[latestDiag.status].bg)}>
          <div className="flex flex-col items-start gap-1">
            <p className="text-eyebrow uppercase text-s-sub">
              {student ? `${student.name} · ` : ""}
              {latest.date}
            </p>
            <p className={cn("font-display text-impact leading-cap font-bold", SUMMARY_TONE[latestDiag.status].text)}>{latestDiag.pct}%</p>
            <p className="text-body text-s-sub">
              {latestDiag.earned}/{latestDiag.possible} зөв
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className={cn("font-display text-heading leading-headline font-bold uppercase", SUMMARY_TONE[latestDiag.status].text)}>
              {STATUS_LABEL[latestDiag.status]}
            </h3>
            <p className="text-body leading-display">
              Дэлгэрэнгүй онош, Мэдлэг × Блумын матриц, хоцрогдлоо нөхөх төлөвлөгөө, зөвлөгөө{" "}
              <b>&quot;Хоцрогдлыг тооцох&quot;</b> хэсэгт гарсан.
            </p>
            <Actions>
              <Button href="/hotsrogdol#onosh">Онош, төлөвлөгөөг харах</Button>
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
            <li>Дараа нь {DIAG_QUESTIONS.length} даалгаварт хариулна — дурын дарааллаар шилжиж болно.</li>
            <li>Илгээсний дараа зөв хариу, тайлбар, онош, нөхөх төлөвлөгөө шууд гарна.</li>
          </ul>
          <Actions>
            <Button onClick={() => setTesting(true)}>Сорил эхлэх</Button>
          </Actions>
        </BracketCard>
      )}

      {/* ② Даалгавартай ажиллах */}
      <StepTitle
        n={2}
        id="ajillah"
        title="Даалгавартай ажиллах"
        text="Сэдвээ сонгоод R1-ээс эхэл. Түвшин бүр 3 даалгавартай, даалгавар бүр 5 бодлоготой; 4 ба түүнээс дээш зөв бол тэнцэж, 3 даалгавраа давбал дараагийн түвшин нээгдэнэ."
      />
      <Workspace sid={sid} student={student} topicId={topicId} onTopic={setTopicId} addRecord={addRecord} />

      {/* ③ Дүнгийн бүртгэл */}
      <StepTitle
        n={3}
        id="burtgel"
        title="Дүнгийн бүртгэл"
        text="Оношлох сорил болон даалгавар бүрийн дүн энд автоматаар бүртгэгдэнэ. Даалгавар, түвшин бүрийн хамгийн сүүлийн дүн 4-өөс доош бол хоцрогдолтойд тооцогдоно."
      />
      <div className="grid gap-6">
        <RecordTable state={tracker} students={students} selected={recSelected} onSelect={setRecordSel} onDelete={confirmDeleteRecord} />
        <BehindTable
          state={tracker}
          students={recSelected ? students.filter((s) => s.id === recSelected) : students}
          onShowRecords={(id) => setRecordSel(id)}
        />
      </div>
    </div>
  );
}
