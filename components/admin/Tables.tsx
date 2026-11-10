"use client";

import { useState, type ReactNode } from "react";
import { MathText } from "@/components/daalgavar/MathText";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Form";
import { TableWrap, td, th } from "@/components/ui/Lists";
import { DIAG_QUESTIONS } from "@/data/diagnostic";
import { LEVEL_ORDER, MAX_SCORE } from "@/data/levels";
import { cn } from "@/lib/cn";
import { diagnose, STATUS_LABEL, type Status } from "@/lib/diagnosis";
import type { RecordLevel } from "@/lib/tracker";
import type { AdminApi, AdminRecord, AdminStudent, AdminSub } from "./useAdminData";

/* Админы засах, устгах хүснэгтүүд. */

const PAGE = 50;
const LEVELS: RecordLevel[] = [...LEVEL_ORDER, "Онош"];
const BADGE: Record<Status, string> = { ok: "bg-ok/15 text-ok", mid: "bg-warn/15 text-warn", low: "bg-danger/15 text-danger" };
const actionBtn = "cursor-pointer text-eyebrow font-bold whitespace-nowrap uppercase underline-offset-4 hover:underline";
const smallInput = "w-full min-h-9 border border-s-border bg-s-bg px-2 py-1 text-body focus:border-accent focus:outline-none";

function lookups(api: AdminApi) {
  const email = new Map(api.teachers.map((t) => [t.id, t.email]));
  const student = new Map(api.students.map((s) => [s.id, s]));
  return { email: (id: string) => email.get(id) ?? "—", student: (id: string) => student.get(id) };
}

/** Хайлт + багшийн шүүлтүүр — бүх хүснэгтэд нийтлэг */
function Toolbar({
  api,
  q,
  onQ,
  teacher,
  onTeacher,
  placeholder,
  children,
}: {
  api: AdminApi;
  q: string;
  onQ: (v: string) => void;
  teacher: string;
  onTeacher: (v: string) => void;
  placeholder: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Хайх">
        <input type="search" value={q} onChange={(e) => onQ(e.target.value)} placeholder={placeholder} className={inputClass} />
      </Field>
      <Field label="Багш">
        <select value={teacher} onChange={(e) => onTeacher(e.target.value)} className={inputClass}>
          <option value="">Бүх багш</option>
          {api.teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.email}
            </option>
          ))}
        </select>
      </Field>
      {children}
    </div>
  );
}

function More({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-body text-s-sub">
      <span>
        {Math.min(shown, total)} / {total} мөр
      </span>
      {shown < total && (
        <Button variant="link" onClick={onMore}>
          Цааш харуулах
        </Button>
      )}
    </div>
  );
}

const match = (q: string, ...xs: string[]) => !q || xs.some((x) => x.toLowerCase().includes(q.toLowerCase()));

/* ---------- Сорилын хариулт ---------- */
export function SubmissionsTable({ api }: { api: AdminApi }) {
  const { email, student } = lookups(api);
  const [q, setQ] = useState("");
  const [teacher, setTeacher] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState<string | null>(null);

  const rows = [...api.subs]
    .reverse() // шинэ нь эхэндээ
    .map((s) => ({ s, st: student(s.studentId), d: diagnose({ date: s.date, answers: s.answers, self: s.self }) }))
    .filter((r): r is typeof r & { st: AdminStudent } => !!r.st)
    .filter((r) => (!teacher || r.s.teacherId === teacher) && match(q, r.st.name, r.st.cls, r.s.date));

  const del = (s: AdminSub, name: string) => {
    if (confirm(`${name}-ийн ${s.date}-ны сорилын хариултыг устгах уу?`)) api.deleteSub(s.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <Toolbar api={api} q={q} onQ={setQ} teacher={teacher} onTeacher={setTeacher} placeholder="Сурагч, анги, огноо" />
      <p className="text-body leading-display text-s-sub">
        Хариултыг засахад онош, хувь, судалгааны графикууд шууд дахин тооцогдоно. Харин хүрээ бүрийн &quot;Онош&quot; дүн (Дүнгийн бүртгэл) автоматаар
        өөрчлөгдөхгүй — шаардлагатай бол тэндээс засна уу.
      </p>
      <TableWrap>
        <table className="w-full min-w-[52rem] border-collapse">
          <thead>
            <tr>
              {["Сурагч", "Анги", "Багш", "Огноо", "Оноо", "Хувь", "Төлөв"].map((h) => (
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
            {rows.slice(0, limit).map(({ s, st, d }) => (
              <SubRow key={s.id} s={s} st={st} d={d} teacherEmail={email(s.teacherId)} open={editing === s.id} onToggle={() => setEditing(editing === s.id ? null : s.id)} onDelete={() => del(s, st.name)} api={api} />
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} className={cn(td, "text-center text-s-sub")}>
                  Сорилын хариулт алга
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrap>
      <More shown={limit} total={rows.length} onMore={() => setLimit((l) => l + PAGE)} />
    </div>
  );
}

function SubRow({
  s,
  st,
  d,
  teacherEmail,
  open,
  onToggle,
  onDelete,
  api,
}: {
  s: AdminSub;
  st: AdminStudent;
  d: ReturnType<typeof diagnose>;
  teacherEmail: string;
  open: boolean;
  onToggle: () => void;
  onDelete: () => void;
  api: AdminApi;
}) {
  return (
    <>
      <tr className={open ? "bg-accent-muted" : undefined}>
        <td className={cn(td, "font-medium")}>{st.name}</td>
        <td className={td}>{st.cls}</td>
        <td className={cn(td, "text-s-sub")}>{teacherEmail}</td>
        <td className={cn(td, "whitespace-nowrap")}>{s.date}</td>
        <td className={td}>
          {d.earned}/{d.possible}
        </td>
        <td className={cn(td, "font-bold")}>{d.pct}%</td>
        <td className={td}>
          <span className={cn("inline-block px-2 py-1 text-eyebrow font-medium whitespace-nowrap uppercase", BADGE[d.status])}>{STATUS_LABEL[d.status]}</span>
        </td>
        <td className={td}>
          <div className="flex gap-4">
            <button type="button" aria-expanded={open} onClick={onToggle} className={cn(actionBtn, "decoration-accent decoration-2 hover:text-accent")}>
              {open ? "Хаах" : "Засах"}
            </button>
            <button type="button" onClick={onDelete} className={cn(actionBtn, "text-s-sub hover:text-danger")}>
              Устгах
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} className="border-b border-s-border bg-s-raised p-4">
            <AnswerEditor
              key={s.id}
              sub={s}
              onSave={(v) => {
                api.updateSub(s.id, v);
                onToggle();
              }}
              onCancel={onToggle}
            />
          </td>
        </tr>
      )}
    </>
  );
}

/** Асуулт бүрийн хариултыг засах — оноо шууд дахин тооцогдоно */
function AnswerEditor({ sub, onSave, onCancel }: { sub: AdminSub; onSave: (v: { answers: number[]; date: string }) => void; onCancel: () => void }) {
  const [answers, setAnswers] = useState(() => DIAG_QUESTIONS.map((_, i) => sub.answers[i] ?? -1));
  const [date, setDate] = useState(sub.date);
  const d = diagnose({ date, answers, self: sub.self });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-6">
        <Field label="Огноо" className="w-48">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={smallInput} />
        </Field>
        <p className="text-body">
          Шинэ дүн: <strong>{d.earned}/{d.possible}</strong> · <strong>{d.pct}%</strong> · {STATUS_LABEL[d.status]}
        </p>
      </div>
      <ol className="grid gap-2 md:grid-cols-2">
        {DIAG_QUESTIONS.map((q, i) => {
          const ok = answers[i] === q.answer;
          return (
            <li key={i} className="flex items-start gap-3 border border-s-border bg-s-bg p-2">
              <span className={cn("mt-1 w-6 shrink-0 text-center text-body font-bold", ok ? "text-ok" : "text-danger")} aria-label={ok ? "зөв" : "буруу"}>
                {ok ? "✓" : "✗"}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-eyebrow text-s-sub">
                  {i + 1}. {q.topic} · {q.strand}
                </p>
                <p className="text-body">
                  <MathText text={q.q} />
                </p>
                <select
                  aria-label={`${i + 1}-р асуултын хариулт`}
                  value={answers[i]}
                  onChange={(e) => setAnswers((a) => a.map((x, j) => (j === i ? Number(e.target.value) : x)))}
                  className={smallInput}
                >
                  <option value={-1}>— хариулаагүй</option>
                  {q.choices.map((c, ci) => (
                    <option key={ci} value={ci}>
                      {String.fromCharCode(65 + ci)}. {c.replace(/\[\[|\]\]/g, "")}
                      {ci === q.answer ? "  (зөв)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          );
        })}
      </ol>
      <Actions>
        <Button onClick={() => onSave({ answers, date })}>Хадгалах</Button>
        <Button variant="link" onClick={onCancel}>
          Болих
        </Button>
      </Actions>
    </div>
  );
}

/* ---------- Сурагчид ---------- */
export function StudentsTable({ api }: { api: AdminApi }) {
  const { email } = lookups(api);
  const [q, setQ] = useState("");
  const [teacher, setTeacher] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState<{ id: string; name: string; cls: string } | null>(null);
  const [error, setError] = useState("");

  const subCount = new Map<string, number>();
  api.subs.forEach((s) => subCount.set(s.studentId, (subCount.get(s.studentId) ?? 0) + 1));
  const recCount = new Map<string, number>();
  api.records.forEach((r) => recCount.set(r.studentId, (recCount.get(r.studentId) ?? 0) + 1));

  const rows = [...api.students]
    .sort((a, b) => a.cls.localeCompare(b.cls, "mn") || a.name.localeCompare(b.name, "mn"))
    .filter((s) => (!teacher || s.teacherId === teacher) && match(q, s.name, s.cls));

  const save = () => {
    if (!editing) return;
    const name = editing.name.trim().replace(/\s+/g, " ");
    const cls = editing.cls.trim();
    if (!name || name.length > 60 || !cls || cls.length > 10) return setError("Нэр (1–60) болон анги (1–10 тэмдэгт)-г зөв бөглөнө үү.");
    api.updateStudent(editing.id, { name, cls });
    setEditing(null);
    setError("");
  };

  const del = (s: AdminStudent) => {
    const n = (subCount.get(s.id) ?? 0) + (recCount.get(s.id) ?? 0);
    if (confirm(`${s.name} (${s.cls}) сурагчийг устгах уу?` + (n ? `\nТүүний ${n} сорил, дүнгийн бүртгэл мөн устна.` : ""))) api.deleteStudent(s.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <Toolbar api={api} q={q} onQ={setQ} teacher={teacher} onTeacher={setTeacher} placeholder="Нэр, анги" />
      {error && (
        <p role="alert" className="text-body text-danger">
          {error}
        </p>
      )}
      <TableWrap>
        <table className="w-full min-w-[46rem] border-collapse">
          <thead>
            <tr>
              {["Овог нэр", "Анги", "Багш", "Сорил", "Дүн"].map((h) => (
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
            {rows.slice(0, limit).map((s) => {
              const on = editing?.id === s.id;
              return (
                <tr key={s.id} className={on ? "bg-accent-muted" : undefined}>
                  <td className={cn(td, "font-medium")}>
                    {on ? (
                      <input aria-label="Овог нэр" maxLength={60} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={smallInput} />
                    ) : (
                      s.name
                    )}
                  </td>
                  <td className={td}>
                    {on ? (
                      <input aria-label="Анги" maxLength={10} value={editing.cls} onChange={(e) => setEditing({ ...editing, cls: e.target.value })} className={cn(smallInput, "w-24")} />
                    ) : (
                      s.cls
                    )}
                  </td>
                  <td className={cn(td, "text-s-sub")}>{email(s.teacherId)}</td>
                  <td className={td}>{subCount.get(s.id) ?? 0}</td>
                  <td className={td}>{recCount.get(s.id) ?? 0}</td>
                  <td className={td}>
                    <div className="flex gap-4">
                      {on ? (
                        <>
                          <button type="button" onClick={save} className={cn(actionBtn, "hover:text-accent")}>
                            Хадгалах
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className={cn(actionBtn, "text-s-sub")}>
                            Болих
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => setEditing({ id: s.id, name: s.name, cls: s.cls })} className={cn(actionBtn, "hover:text-accent")}>
                            Засах
                          </button>
                          <button type="button" onClick={() => del(s)} className={cn(actionBtn, "text-s-sub hover:text-danger")}>
                            Устгах
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={6} className={cn(td, "text-center text-s-sub")}>
                  Сурагч алга
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrap>
      <More shown={limit} total={rows.length} onMore={() => setLimit((l) => l + PAGE)} />
    </div>
  );
}

/* ---------- Дүнгийн бүртгэл ---------- */
type RecordDraft = Pick<AdminRecord, "id" | "task" | "level" | "score" | "date">;

export function RecordsTable({ api }: { api: AdminApi }) {
  const { email, student } = lookups(api);
  const [q, setQ] = useState("");
  const [teacher, setTeacher] = useState("");
  const [level, setLevel] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState<RecordDraft | null>(null);
  const [error, setError] = useState("");

  const rows = [...api.records]
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : b.created - a.created))
    .map((r) => ({ r, st: student(r.studentId) }))
    .filter((x): x is typeof x & { st: AdminStudent } => !!x.st)
    .filter(({ r, st }) => (!teacher || r.teacherId === teacher) && (!level || r.level === level) && match(q, st.name, st.cls, r.task, r.date));

  const save = () => {
    if (!editing) return;
    const task = editing.task.trim();
    if (!task || task.length > 200) return setError("Даалгаврын нэрийг (1–200 тэмдэгт) бөглөнө үү.");
    if (!Number.isInteger(editing.score) || editing.score < 0 || editing.score > MAX_SCORE) return setError(`Оноо 0–${MAX_SCORE} бүхэл тоо байна.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editing.date)) return setError("Огноог зөв оруулна уу.");
    api.updateRecord(editing.id, { task, level: editing.level, score: editing.score, date: editing.date });
    setEditing(null);
    setError("");
  };

  return (
    <div className="flex flex-col gap-4">
      <Toolbar api={api} q={q} onQ={setQ} teacher={teacher} onTeacher={setTeacher} placeholder="Сурагч, анги, даалгавар, огноо">
        <Field label="Түвшин">
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
            <option value="">Бүх түвшин</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </Toolbar>
      {error && (
        <p role="alert" className="text-body text-danger">
          {error}
        </p>
      )}
      <TableWrap>
        <table className="w-full min-w-[60rem] border-collapse">
          <thead>
            <tr>
              {["Сурагч", "Анги", "Багш", "Огноо", "Даалгавар", "Түвшин", "Оноо"].map((h) => (
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
            {rows.slice(0, limit).map(({ r, st }) => {
              const on = editing?.id === r.id;
              return (
                <tr key={r.id} className={on ? "bg-accent-muted" : undefined}>
                  <td className={cn(td, "font-medium")}>{st.name}</td>
                  <td className={td}>{st.cls}</td>
                  <td className={cn(td, "text-s-sub")}>{email(r.teacherId)}</td>
                  <td className={cn(td, "whitespace-nowrap")}>
                    {on ? <input type="date" aria-label="Огноо" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className={smallInput} /> : r.date}
                  </td>
                  <td className={td}>
                    {on ? <input aria-label="Даалгавар" maxLength={200} value={editing.task} onChange={(e) => setEditing({ ...editing, task: e.target.value })} className={smallInput} /> : r.task}
                  </td>
                  <td className={td}>
                    {on ? (
                      <select aria-label="Түвшин" value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value as RecordLevel })} className={smallInput}>
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    ) : (
                      r.level
                    )}
                  </td>
                  <td className={cn(td, "whitespace-nowrap")}>
                    {on ? (
                      <input
                        type="number"
                        aria-label="Оноо"
                        min={0}
                        max={MAX_SCORE}
                        step={1}
                        value={editing.score}
                        onChange={(e) => setEditing({ ...editing, score: Number(e.target.value) })}
                        className={cn(smallInput, "w-20")}
                      />
                    ) : (
                      `${r.score}/${MAX_SCORE}`
                    )}
                  </td>
                  <td className={td}>
                    <div className="flex gap-4">
                      {on ? (
                        <>
                          <button type="button" onClick={save} className={cn(actionBtn, "hover:text-accent")}>
                            Хадгалах
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className={cn(actionBtn, "text-s-sub")}>
                            Болих
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditing({ id: r.id, task: r.task, level: r.level, score: r.score, date: r.date })}
                            className={cn(actionBtn, "hover:text-accent")}
                          >
                            Засах
                          </button>
                          <button
                            type="button"
                            onClick={() => confirm(`${st.name}-ийн "${r.task}" дүнг устгах уу?`) && api.deleteRecord(r.id)}
                            className={cn(actionBtn, "text-s-sub hover:text-danger")}
                          >
                            Устгах
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={8} className={cn(td, "text-center text-s-sub")}>
                  Дүнгийн бүртгэл алга
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrap>
      <More shown={limit} total={rows.length} onMore={() => setLimit((l) => l + PAGE)} />
    </div>
  );
}

/* ---------- Багш нар ---------- */
export function TeachersTable({ api }: { api: AdminApi }) {
  const count = (list: { teacherId: string }[], id: string) => list.filter((x) => x.teacherId === id).length;
  return (
    <BracketCard className="flex flex-col gap-4 bg-s-bg p-0">
      <TableWrap className="border-0">
        <table className="w-full min-w-[40rem] border-collapse">
          <thead>
            <tr>
              {["И-мэйл", "Сорилын код", "Сурагч", "Сорил", "Дүн", "Эрх"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {api.teachers.map((t) => (
              <tr key={t.id}>
                <td className={cn(td, "font-medium")}>{t.email}</td>
                <td className={cn(td, "font-display tracking-[0.15em]")}>{t.code ?? <span className="text-s-sub">— (нэвтрээгүй)</span>}</td>
                <td className={td}>{count(api.students, t.id)}</td>
                <td className={td}>{count(api.subs, t.id)}</td>
                <td className={td}>{count(api.records, t.id)}</td>
                <td className={td}>{t.isAdmin ? <span className="bg-accent-muted px-2 py-1 text-eyebrow font-bold uppercase">Админ</span> : "Багш"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </BracketCard>
  );
}
