"use client";

import { useState, type SubmitEvent } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Form";
import { PROJECT_STEPS, REFLECT_QUESTIONS, ROLES, STATIONS, type Station } from "@/data/interaktiv";
import { judge, normalize } from "@/lib/judge";
import { cn } from "@/lib/cn";
import { AnswerField, Feedback, miniBtn, TaskHead, Timer, type Tone } from "./shared";

/** Гишүүдийн нэр → санамсаргүй үүрэг. 3 гишүүнтэй бол Илтгэгчийг Уншигч хавсарна. */
function RoleAssigner() {
  const [names, setNames] = useState(["", "", "", ""]);
  const [assigned, setAssigned] = useState<{ role: string; task: string; who: string }[] | null>(null);
  const [note, setNote] = useState("");

  const assign = () => {
    const filled = names.map((n) => n.trim()).filter(Boolean);
    if (filled.length < 3) {
      setAssigned(null);
      setNote("Дор хаяж 3 гишүүний нэрийг оруулна уу.");
      return;
    }
    const shuffled = [...filled];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setNote("");
    setAssigned(ROLES.map((r, idx) => ({ role: r.name, task: r.task, who: shuffled[idx] ?? shuffled[0] })));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {names.map((v, i) => (
          <Field key={i} label={`Гишүүн ${i + 1}`}>
            <input
              type="text"
              maxLength={30}
              placeholder={i === 3 ? "Нэр (заавал биш)" : "Нэр"}
              value={v}
              onChange={(e) => setNames((ns) => ns.map((x, j) => (j === i ? e.target.value : x)))}
              className={inputClass}
            />
          </Field>
        ))}
      </div>
      <div>
        <Button onClick={assign}>Үүрэг хуваарилах</Button>
      </div>
      <ul aria-live="polite" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {note && <li className="text-body text-danger sm:col-span-2 lg:col-span-4">{note}</li>}
        {assigned?.map((a) => (
          <li key={a.role} className="flex flex-col gap-1 border border-s-border p-4">
            <strong className="font-display text-label uppercase">
              {a.role}: <span className="text-accent">{a.who}</span>
            </strong>
            <span className="text-body leading-display text-s-sub">{a.task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Нэг станцын бодлого. Зөв бол түгжээний цифр нээгдэнэ. */
function StationCard({ station, index, solved, onSolve }: { station: Station; index: number; solved: boolean; onSolve: () => void }) {
  const [value, setValue] = useState("");
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<{ tone: Tone; text: string } | null>(null);
  const item = { type: "num" as const, answer: station.answer, unit: station.unit };

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (solved) return;
    const res = judge(item, value);
    if (res === "empty") return setFeedback({ tone: "neutral", text: "Хариугаа оруулна уу." });
    if (res === "ok") {
      onSolve();
      return setFeedback({ tone: "ok", text: `Зөв! Түгжээний ${index + 1}-р цифр: ${station.answer}` });
    }
    const t = tries + 1;
    setTries(t);
    setFeedback({
      tone: "bad",
      text: t >= 2 ? `Дахин нягтал. Зөвлөгөө: ${station.hint}` : "Буруу байна. Шалгагч бодолтыг дахин нягталъя.",
    });
  };

  return (
    <BracketCard accent={solved} className={cn("h-full", solved ? "bg-ok/10" : "bg-s-raised")}>
      <form onSubmit={submit} autoComplete="off" className="flex h-full flex-col gap-4">
        <h4 className="font-display text-label font-bold uppercase">{station.title}</h4>
        <p className="flex-1 text-body leading-display">{station.q}</p>
        <AnswerField item={item} name={`station-${index}`} value={value} onChange={setValue} disabled={solved} />
        <div>
          <button type="submit" disabled={solved} className={miniBtn}>
            Шалгах
          </button>
        </div>
        <Feedback tone={feedback?.tone}>{feedback?.text}</Feedback>
      </form>
    </BracketCard>
  );
}

const CODE = STATIONS.map((s) => s.answer).join("");

/** 4 цифрийн түгжээ */
function CodeLock({ found }: { found: (number | null)[] }) {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (normalize(value) === CODE) {
      setOpen(true);
      setMsg("🔓 Түгжээ нээгдлээ! Багаараа амжилттай давлаа. Одоо доорх эргэцүүллийн асуултыг ярилцаарай.");
    } else {
      setMsg(found.includes(null) ? "Код буруу. Бүх станцын цифрийг цуглуулсан уу?" : "Код буруу. Цифрүүдийг станцын дарааллаар бичээрэй.");
    }
  };

  return (
    <div data-surface="dark">
    <BracketCard accent className={cn("flex flex-col gap-6 bg-surface-black p-6 sm:p-8", open && "outline-2 -outline-offset-2 outline-ok")}>
      <div aria-label="Цуглуулсан цифрүүд" className="flex gap-3">
        {found.map((d, i) => (
          <span
            key={i}
            aria-label={`${i + 1}-р цифр: ${d === null ? "олдоогүй" : d}`}
            className={cn(
              "grid size-14 place-items-center border-2 font-display text-heading font-bold",
              d === null ? "border-on-dark-faint text-on-dark-faint" : "border-accent text-accent",
            )}
          >
            {d === null ? "?" : d}
          </span>
        ))}
      </div>
      <form onSubmit={submit} autoComplete="off" className="flex flex-wrap items-end gap-4">
        <Field label="Түгжээний код">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={cn(inputClass, "w-40 font-display text-heading tracking-[0.3em]")}
          />
        </Field>
        <Button type="submit">Түгжээ нээх</Button>
      </form>
      <p role="status" className={cn("min-h-6 text-label", open && "text-ok")}>
        {msg}
      </p>
    </BracketCard>
    </div>
  );
}

/** Багаар: Код тайлах сорилго */
export function TeamChallenge() {
  const [found, setFound] = useState<(number | null)[]>(() => STATIONS.map(() => null));

  return (
    <>
      <RoleAssigner />
      <Timer seconds={15 * 60} label="Багийн хугацаа" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {STATIONS.map((s, i) => (
          <StationCard
            key={s.title}
            station={s}
            index={i}
            solved={found[i] !== null}
            onSolve={() => setFound((f) => f.map((v, j) => (j === i ? s.answer : v)))}
          />
        ))}
      </div>
      <CodeLock found={found} />
      <BracketCard className="flex flex-col gap-3">
        <h4 className="font-display text-label font-bold uppercase">Багийн эргэцүүлэл</h4>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-body leading-display">
          {REFLECT_QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </BracketCard>
    </>
  );
}

/** Багийн төсөл: Манай ангийн судалгаа — алхмын checklist */
export function TeamProject() {
  const [checked, setChecked] = useState<boolean[]>(() => PROJECT_STEPS.map(() => false));
  const done = checked.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 border-t border-s-border pt-10">
      <TaskHead
        title="Багийн төсөл: Манай ангийн судалгаа"
        text="Баг ангийнхнаасаа өгөгдөл цуглуулж (жишээ нь: өдөрт унтдаг цаг, гэрээс сургууль хүртэлх зай), дундаж, медиан, моод, далайцыг олж, диаграмм зурж танилцуулна. 1–2 хичээл."
        knowledge="Ойлголт · Журам"
        bloom="Задлан шинжлэх · Бүтээх"
      />
      <ol className="flex flex-col gap-2">
        {PROJECT_STEPS.map((s, i) => (
          <li key={s}>
            <label className="flex cursor-pointer items-start gap-3 border border-s-border p-4 text-body leading-display has-checked:border-ok has-checked:bg-ok/10">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                className="mt-0.5 size-4 accent-accent"
              />
              <span>
                <span className="mr-2 font-bold text-accent">{i + 1}.</span>
                {s}
              </span>
            </label>
          </li>
        ))}
      </ol>
      <p aria-live="polite" className="font-display text-title uppercase">
        Явц: {done} / {PROJECT_STEPS.length}
        {done === PROJECT_STEPS.length && " — Төсөл бэлэн! 🎉"}
      </p>
    </div>
  );
}
