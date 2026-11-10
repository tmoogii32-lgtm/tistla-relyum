"use client";

import { useState, type SubmitEvent } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Button } from "@/components/ui/Button";
import { Field, FormError, inputClass } from "@/components/ui/Form";
import { TableWrap, td, th } from "@/components/ui/Lists";
import { StatCard } from "@/components/ui/StatCard";
import { LEVELS, MAX_SCORE, PASS_SCORE, type LevelName } from "@/data/levels";
import { useHydrated } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/cn";
import { FORM_URL } from "@/lib/site";
import {
  averagePercent,
  behindTasks,
  byNewest,
  compareTasks,
  recordsOf,
  studentStatus,
  today,
  type Student,
  type TaskRecord,
  type TrackerState,
} from "@/lib/tracker";

/* ---------- Төлвийн шошго ---------- */
const BADGE = {
  ok: ["Тэнцсэн", "bg-ok/15 text-ok"],
  behind: ["Хоцрогдолтой", "bg-danger/15 text-danger"],
  none: ["Дүнгүй", "bg-s-raised text-s-sub"],
  failed: ["Тэнцээгүй", "bg-danger/15 text-danger"],
} as const;

export function StatusBadge({ status }: { status: keyof typeof BADGE }) {
  const [label, cls] = BADGE[status];
  return <span className={cn("inline-block px-2 py-1 text-eyebrow font-medium whitespace-nowrap uppercase", cls)}>{label}</span>;
}

const iconBtn = "cursor-pointer text-eyebrow uppercase text-s-sub underline-offset-4 hover:text-danger hover:underline";
export const cardTitle = "font-display text-title leading-headline font-bold uppercase";

/* ---------- Нийт үзүүлэлт ---------- */
export function TrackerSummary({ state }: { state: TrackerState }) {
  const behind = state.students.filter((s) => studentStatus(state, s.id) === "behind").length;
  const avg = averagePercent(state.records);
  const items = [
    { value: state.students.length, label: "Бүртгэлтэй сурагч" },
    { value: state.records.length, label: "Даалгаврын бүртгэл" },
    { value: behind, label: "Хоцрогдолтой сурагч" },
    { value: avg === null ? "—" : `${avg}%`, label: "Дундаж гүйцэтгэл" },
  ];
  return (
    <div aria-live="polite" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <StatCard key={i.label} value={i.value} label={i.label} />
      ))}
    </div>
  );
}

/* ---------- 1. Сурагч бүртгэх ---------- */
type StudentFormProps = {
  state: TrackerState;
  classes: string[];
  onAdd: (name: string, cls: string) => void;
};

export function StudentForm({ state, classes, onAdd }: StudentFormProps) {
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [error, setError] = useState("");

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = name.trim().replace(/\s+/g, " ");
    const c = cls.trim();
    if (!n || !c) return setError("Овог нэр болон ангийг бөглөнө үү.");
    const exists = state.students.some((s) => s.name.toLowerCase() === n.toLowerCase() && s.cls.toLowerCase() === c.toLowerCase());
    if (exists) return setError(`${c} ангийн ${n} аль хэдийн бүртгэгдсэн байна.`);
    setError("");
    onAdd(n, c);
    setName("");
    (e.currentTarget.elements.namedItem("student-name") as HTMLInputElement | null)?.focus();
  };

  return (
    <BracketCard className="flex flex-col gap-6 bg-s-raised">
      <h2 className={cardTitle}>1. Шалгалт өгөх сурагч бүртгэх</h2>
      <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-4" noValidate>
        <Field label="Овог нэр">
          <input
            name="student-name"
            type="text"
            required
            maxLength={60}
            placeholder="Жишээ: Б. Тэмүүлэн"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Анги">
          <input
            type="text"
            required
            maxLength={10}
            placeholder="Жишээ: 7а"
            list="class-list"
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            className={inputClass}
          />
          <datalist id="class-list">
            {classes.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit">Сурагч нэмэх</Button>
      </form>
    </BracketCard>
  );
}

type StudentTableProps = {
  state: TrackerState;
  students: Student[];
  classes: string[];
  classFilter: string;
  onClassFilter: (v: string) => void;
  onShowRecords: (id: string) => void;
  onDelete: (s: Student) => void;
};

export function StudentTable({ state, students, classes, classFilter, onClassFilter, onShowRecords, onDelete }: StudentTableProps) {
  const visible = students.filter((s) => !classFilter || s.cls === classFilter);
  return (
    <BracketCard className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className={cardTitle}>Бүртгэлтэй сурагчид</h2>
        <Field label="Ангиар шүүх" hideLabel>
          <select value={classFilter} onChange={(e) => onClassFilter(e.target.value)} className={cn(inputClass, "w-auto")}>
            <option value="">Бүх анги</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <TableWrap>
        <table className="w-full min-w-[40rem] border-collapse">
          <thead>
            <tr>
              {["#", "Овог нэр", "Анги", "Даалгавар", "Дундаж", "Төлөв"].map((h) => (
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
            {visible.map((s, i) => {
              const recs = recordsOf(state, s.id);
              const avg = averagePercent(recs);
              return (
                <tr key={s.id}>
                  <td className={td}>{i + 1}</td>
                  <td className={td}>
                    <button
                      type="button"
                      title="Даалгаврын бүртгэлийг харах"
                      onClick={() => onShowRecords(s.id)}
                      className="cursor-pointer text-left font-medium underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                    >
                      {s.name}
                    </button>
                  </td>
                  <td className={td}>{s.cls}</td>
                  <td className={td}>{recs.length}</td>
                  <td className={td}>{avg === null ? "—" : `${avg}%`}</td>
                  <td className={td}>
                    <StatusBadge status={studentStatus(state, s.id)} />
                  </td>
                  <td className={td}>
                    <button type="button" aria-label={`${s.name} сурагчийг устгах`} onClick={() => onDelete(s)} className={iconBtn}>
                      Устгах
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length && (
          <p className="p-6 text-center text-body text-s-sub">
            {students.length ? "Энэ ангид сурагч алга байна." : "Одоогоор сурагч бүртгэгдээгүй байна."}
          </p>
        )}
      </TableWrap>
    </BracketCard>
  );
}

/* ---------- 2. Даалгаврын дүн ---------- */
type TaskFormProps = {
  students: Student[];
  taskNames: string[];
  studentId: string;
  onStudent: (id: string) => void;
  onAdd: (rec: Omit<TaskRecord, "id" | "created">) => void;
};

export function TaskForm({ students, taskNames, studentId, onStudent, onAdd }: TaskFormProps) {
  const hydrated = useHydrated();
  const [task, setTask] = useState("");
  const [level, setLevel] = useState<LevelName>("Суурь");
  const [score, setScore] = useState("0");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  // Static prerender-ийн огноо гарахгүйн тулд өнөөдрийг зөвхөн client дээр бөглөнө
  const shownDate = date || (hydrated ? today() : "");

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    const t = task.trim().replace(/\s+/g, " ");
    const n = Number(score);
    if (!students.some((s) => s.id === studentId)) return setError("Эхлээд сурагчаа сонгоно уу.");
    if (!t) return setError("Даалгаврын нэрийг оруулна уу.");
    if (!Number.isInteger(n) || n < 0 || n > MAX_SCORE) return setError(`Дүн 0-оос ${MAX_SCORE} хүртэлх бүхэл тоо байна.`);
    setError("");
    onAdd({ studentId, task: t, level, score: n, date: shownDate || today() });
    setScore("0");
  };

  return (
    <BracketCard className="flex flex-col gap-6 bg-s-raised">
      <h2 className={cardTitle}>2. Даалгаврын дүн бүртгэх</h2>
      <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-4" noValidate>
        <Field label="Сурагч">
          <select required value={studentId} onChange={(e) => onStudent(e.target.value)} className={inputClass}>
            <option value="">— Сурагч сонгох —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.cls})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Даалгавар / сэдэв">
          <input
            type="text"
            required
            maxLength={80}
            placeholder="Жишээ: Рационал тоо"
            list="task-list"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className={inputClass}
          />
          <datalist id="task-list">
            {taskNames.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Түвшин">
            <select required value={level} onChange={(e) => setLevel(e.target.value as LevelName)} className={inputClass}>
              {LEVELS.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.icon} {l.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`Зөв бодсон (${MAX_SCORE}-аас)`}>
            <input
              type="number"
              min={0}
              max={MAX_SCORE}
              step={1}
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Огноо">
          <input type="date" required value={shownDate} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit">Дүн бүртгэх</Button>
      </form>
    </BracketCard>
  );
}

type RecordTableProps = {
  state: TrackerState;
  students: Student[];
  selected: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function RecordTable({ state, students, selected, onSelect, onDelete }: RecordTableProps) {
  const student = students.find((s) => s.id === selected);
  const nameOf = (id: string) => students.find((s) => s.id === id)?.name ?? "—";
  const records = state.records.filter((r) => !selected || r.studentId === selected).sort(byNewest);

  return (
    <BracketCard className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className={cardTitle}>{student ? `${student.name} — даалгаврын бүртгэл` : "Сурагчийн даалгаврын бүртгэл"}</h2>
        <Field label="Сурагч сонгох" hideLabel>
          <select value={selected} onChange={(e) => onSelect(e.target.value)} className={cn(inputClass, "w-auto")}>
            <option value="">Бүх сурагч</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.cls})
              </option>
            ))}
          </select>
        </Field>
      </div>
      <TableWrap>
        <table className="w-full min-w-[40rem] border-collapse">
          <thead>
            <tr>
              {["Огноо", "Сурагч", "Даалгавар", "Түвшин", "Дүн", "Үр дүн"].map((h) => (
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
            {records.map((r) => (
              <tr key={r.id}>
                <td className={cn(td, "whitespace-nowrap")}>{r.date}</td>
                <td className={td}>{nameOf(r.studentId)}</td>
                <td className={td}>{r.task}</td>
                <td className={td}>{r.level}</td>
                <td className={td}>
                  {r.score}/{MAX_SCORE}
                </td>
                <td className={td}>
                  <StatusBadge status={r.score >= PASS_SCORE ? "ok" : "failed"} />
                </td>
                <td className={td}>
                  <button type="button" aria-label="Бүртгэл устгах" onClick={() => onDelete(r.id)} className={iconBtn}>
                    Устгах
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!records.length && <p className="p-6 text-center text-body text-s-sub">Даалгаврын бүртгэл алга байна.</p>}
      </TableWrap>
    </BracketCard>
  );
}

/**
 * Хоцрогдолтой сурагчдын үнэлгээний бүртгэл: даалгавар + түвшин бүрийн
 * хамгийн сүүлийн дүн нь 4-өөс доош байгаа мөрүүд.
 */
export function BehindTable({ state, students, onShowRecords }: {
  state: TrackerState;
  students: Student[];
  onShowRecords: (id: string) => void;
}) {
  const rows = students.flatMap((s) => behindTasks(state, s.id).sort(compareTasks).map((r) => ({ student: s, record: r })));
  const behindCount = new Set(rows.map((r) => r.student.id)).size;

  return (
    <BracketCard accent className="flex min-w-0 flex-col gap-6 bg-danger/5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className={cardTitle}>Хоцрогдолтой сурагчдын үнэлгээний бүртгэл</h2>
          <p className="text-body leading-display text-s-sub">
            Даалгавар, түвшин бүрийн хамгийн сүүлийн дүн нь {PASS_SCORE}-өөс доош байгаа сурагчид. Дахин бодож тэнцвэл жагсаалтаас
            автоматаар хасагдана.
          </p>
        </div>
        {rows.length > 0 && (
          <p className="font-display text-title uppercase">
            <span className="text-danger">{behindCount}</span> сурагч · <span className="text-danger">{rows.length}</span> даалгавар
          </p>
        )}
      </div>
      <TableWrap>
        <table className="w-full min-w-[40rem] border-collapse">
          <thead>
            <tr>
              {["Сурагч", "Анги", "Даалгавар / сэдэв", "Түвшин", "Сүүлийн дүн", "Огноо"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ student, record }) => (
              <tr key={record.id}>
                <td className={td}>
                  <button
                    type="button"
                    title="Даалгаврын бүртгэлийг харах"
                    onClick={() => onShowRecords(student.id)}
                    className="cursor-pointer text-left font-medium underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                  >
                    {student.name}
                  </button>
                </td>
                <td className={td}>{student.cls}</td>
                <td className={td}>{record.task}</td>
                <td className={td}>{record.level}</td>
                <td className={cn(td, "font-bold text-danger")}>
                  {record.score}/{MAX_SCORE}
                </td>
                <td className={cn(td, "whitespace-nowrap")}>{record.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="p-6 text-center text-body text-s-sub">
            {state.records.length ? "Хоцрогдолтой сурагч алга байна. 🎉" : "Дүн бүртгэгдсэний дараа энд хоцрогдолтой сурагчид гарна."}
          </p>
        )}
      </TableWrap>
      {rows.length > 0 && (
        <div>
          <Button href="/daalgavar">Түвшинчилсэн даалгавраар нөхөн сургах</Button>
        </div>
      )}
    </BracketCard>
  );
}

/** Хоцрогдлыг илрүүлэх оношлох сорил руу орох холбоос */
export function ExamLinkCard() {
  const formValid = /^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/.test(FORM_URL.trim());
  return (
    <BracketCard accent className="flex flex-col items-start justify-between gap-6 bg-s-raised p-6 sm:p-8 lg:flex-row lg:items-center">
      <div className="flex max-w-2xl flex-col gap-2">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">1-р алхам · Оношлох</p>
        <h2 className="font-display text-heading leading-headline font-bold uppercase">Хоцрогдлыг илрүүлэх шалгалт</h2>
        <p className="text-body leading-display text-s-sub">
          Сурагчид эхлээд оношлох сорил өгч, мэдлэгийн төрөл × Блумын түвшин бүрийн хоцрогдлоо тодорхойлно. Дараа нь гарсан дүнг доорх
          хэсэгт сурагч бүрээр бүртгэнэ.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 max-sm:w-full max-sm:flex-col">
        {formValid && <Button href={FORM_URL}>Оношлох сорил өгөх</Button>}
        <Button href="/daalgavar">Даалгавартай ажиллах</Button>
      </div>
    </BracketCard>
  );
}
