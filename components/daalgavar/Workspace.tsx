"use client";

import { useState } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { LEVELS } from "@/data/levels";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/cn";
import {
  LEVEL_KEYS,
  PROBLEMS_PER_TASK,
  TASK_MODES,
  TASK_PASS,
  TASKS_PER_LEVEL,
  TOPICS,
  makeAttempt,
  topicById,
  type Level,
} from "@/lib/problems";
import {
  EMPTY_PROGRESS,
  currentLevel,
  isProgressStore,
  levelPassed,
  levelUnlocked,
  recordAttempt,
  topicProgress,
  type ProgressStore,
} from "@/lib/taskProgress";
import { today, type Student, type TaskRecord } from "@/lib/tracker";
import { MathText } from "./MathText";
import { ProblemCard } from "./ProblemCard";
import { TaskCard, type AttemptResult } from "./TaskCard";
import { TopicTree } from "./TopicTree";

/** Оролдлого эхлэх үеийн seed-ийг хадгална — дууссаны дараа attempts нэмэгдэхэд бодлого, сонголт өөрчлөгдөхгүй */
type AttemptState = { results: AttemptResult[]; cursor: number; seed: string };

const onSaveError = () => alert("Явцыг хадгалж чадсангүй. Браузерын тохиргоог шалгана уу.");

type Props = {
  /** Явцын түлхүүр — сурагчийн id эсвэл "guest" */
  sid: string;
  /** Бүртгэлтэй сурагч (зочин бол undefined) — дүн нь автоматаар бүртгэгдэнэ */
  student?: Student;
  topicId: string;
  onTopic: (id: string) => void;
  addRecord: (rec: Omit<TaskRecord, "id" | "created">) => void;
};

/**
 * Даалгавартай ажиллах: сэдэв → R1–R4 түвшин → 3 даалгавар × 5 бодлого.
 * Даалгавар 4/5-аар тэнцэнэ; түвшний 3 даалгавар бүгд тэнцвэл дараагийн түвшин нээгдэнэ.
 */
export function Workspace({ sid, student, topicId, onTopic, addRecord }: Props) {
  const [store, setStore] = useLocalStorage<ProgressStore>("daalgavar-v1", EMPTY_PROGRESS, isProgressStore, onSaveError);
  const topic = topicById(topicId);
  const tp = topicProgress(store, sid, topic.id);

  // null — хүрсэн хамгийн өндөр түвшинг автоматаар харуулна
  const [levelSel, setLevelSel] = useState<number | null>(null);
  const level = (levelSel !== null && levelUnlocked(tp, levelSel) ? levelSel : currentLevel(tp)) as Level;
  const [task, setTask] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, AttemptState>>({});

  const keyOf = (l: number, t: number) => `${sid}|${topic.id}|${l}|${t}`;
  const key = keyOf(level, task);
  const prog = tp[level][task];
  const att = attempts[key] ?? { results: [], cursor: 0, seed: `${key}|${prog.attempts}` };
  const seed = att.seed;
  // React Compiler автоматаар memoize хийнэ; seed-ээс тодорхой тул дахин үүсгэхэд ижил гарна
  const problems = makeAttempt(topic, level, seed);
  const finished = att.cursor >= PROBLEMS_PER_TASK;
  const nextUnpassed = tp[level].findIndex((t, i) => i !== task && !t.passed);

  // Сэдэв (гаднаас ч) солигдоход түвшин, даалгаврыг эхнээс нь
  const [prevTopic, setPrevTopic] = useState(topicId);
  if (prevTopic !== topicId) {
    setPrevTopic(topicId);
    setLevelSel(null);
    setTask(0);
  }
  const selectTopic = (id: string) => onTopic(id);
  const selectLevel = (l: number) => {
    setLevelSel(l);
    setTask(0);
  };

  const onCheck = (correct: boolean, given: string) => {
    const results = [...att.results, { correct, given, problem: problems[att.cursor] }];
    setAttempts((a) => ({ ...a, [key]: { results, cursor: att.cursor, seed } }));
    if (levelSel === null) setLevelSel(level); // дуусахад түвшин автоматаар үсрэхгүй
    if (results.length === PROBLEMS_PER_TASK) {
      const score = results.filter((r) => r.correct).length;
      setStore((s) => recordAttempt(s, sid, topic.id, level, task, score, PROBLEMS_PER_TASK));
      if (student) {
        addRecord({
          studentId: student.id,
          task: `${topic.title} · Даалгавар ${task + 1}`,
          level: LEVELS[level].name,
          score,
          date: today(),
        });
      }
    }
  };

  const next = () => setAttempts((a) => ({ ...a, [key]: { ...att, cursor: att.cursor + 1 } }));
  const retry = () =>
    setAttempts((a) => {
      const rest = { ...a };
      delete rest[key];
      return rest;
    });

  // Түвшний нийт үзүүлэлт: хадгалсан + дуусаагүй оролдлогууд
  const levelStats = tp[level].reduce(
    (acc, t, i) => {
      const live = attempts[keyOf(level, i)]?.results ?? [];
      const unsaved = live.length < PROBLEMS_PER_TASK ? live : [];
      acc.solved += t.solved + unsaved.length;
      acc.correct += t.correct + unsaved.filter((r) => r.correct).length;
      acc.passed += t.passed ? 1 : 0;
      return acc;
    },
    { solved: 0, correct: 0, passed: 0 },
  );

  const strandIndex = TOPICS.indexOf(topic);
  const nextTopic = TOPICS[strandIndex + 1];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Сэдвийн мод — утсан дээр эвхэгддэг */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+1rem)]">
          <details className="group border border-s-border bg-s-bg lg:hidden">
            <summary className="cursor-pointer px-4 py-3 font-display text-label font-bold uppercase">
              Сэдэв: {topic.index}. {topic.title}
            </summary>
            <div className="border-t border-s-border p-2">
              <TopicTree store={store} student={sid} selected={topic.id} onSelect={selectTopic} />
            </div>
          </details>
          <div className="hidden max-h-[calc(100svh-var(--nav-h)-2rem)] overflow-y-auto border border-s-border bg-s-bg p-2 lg:block">
            <TopicTree store={store} student={sid} selected={topic.id} onSelect={selectTopic} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {/* Гарчиг */}
          <div className="flex flex-col gap-2">
            <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-s-sub">
              {topic.strandTitle} › {topic.index}
            </p>
            <h2 className="font-display text-heading leading-headline font-bold uppercase">{topic.title}</h2>
            <p className="text-body text-s-sub">Түвшингээ сонгоно уу.</p>
          </div>

          {/* R1–R4 */}
          <div role="tablist" aria-label="Түвшин" className="flex flex-wrap gap-2">
            {LEVEL_KEYS.map((k, l) => {
              const unlocked = levelUnlocked(tp, l);
              const passed = levelPassed(tp, l);
              const on = l === level;
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  disabled={!unlocked}
                  onClick={() => selectLevel(l)}
                  title={unlocked ? LEVELS[l].name : `${LEVEL_KEYS[l - 1]} түвшний 3 даалгаврыг тэнцсэний дараа нээгдэнэ`}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 border px-4 py-2 transition-colors disabled:cursor-not-allowed",
                    on ? "border-accent bg-accent text-foreground" : "border-s-border hover:border-accent",
                    !unlocked && "opacity-50 hover:border-s-border",
                  )}
                >
                  <span aria-hidden="true">{passed ? "✓" : !unlocked ? "🔒" : LEVELS[l].icon}</span>
                  <span className="font-display text-label font-bold">{k}</span>
                  <span className="text-eyebrow uppercase">{LEVELS[l].name}</span>
                </button>
              );
            })}
          </div>

          {/* Түвшний явц */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border border-s-border bg-s-bg px-5 py-4 text-body">
            <span>
              Бодсон <b>{levelStats.solved}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-full bg-ok" /> Зөв <b>{levelStats.correct}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-full bg-danger" /> Буруу <b>{levelStats.solved - levelStats.correct}</b>
            </span>
            <span>
              <b>
                {levelStats.passed}/{TASKS_PER_LEVEL}
              </b>{" "}
              даалгавар
            </span>
            <span className="ml-auto flex min-w-40 flex-1 items-center gap-3 sm:flex-none">
              <span aria-hidden="true" className="h-1.5 flex-1 bg-s-border sm:w-40">
                <span className="block h-full bg-ok transition-[width] duration-500" style={{ width: `${(levelStats.passed / TASKS_PER_LEVEL) * 100}%` }} />
              </span>
              <b className="font-display text-title text-ok">{Math.round((levelStats.passed / TASKS_PER_LEVEL) * 100)}%</b>
            </span>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
            {/* Бодлого эсвэл дүн */}
            <div className="min-w-0" aria-live="polite">
              {!finished ? (
                <ProblemCard
                  key={`${seed}|${att.cursor}`}
                  topic={topic}
                  level={level}
                  mode={TASK_MODES[task]}
                  problem={att.results[att.cursor]?.problem ?? problems[att.cursor]}
                  number={att.cursor + 1}
                  total={PROBLEMS_PER_TASK}
                  seed={`${seed}|${att.cursor}`}
                  answered={att.results[att.cursor]}
                  isLast={att.cursor + 1 === PROBLEMS_PER_TASK}
                  onCheck={onCheck}
                  onNext={next}
                />
              ) : (
                <AttemptSummary
                  results={att.results}
                  level={level}
                  task={task}
                  levelDone={levelPassed(tp, level)}
                  nextTask={nextUnpassed >= 0 ? nextUnpassed : undefined}
                  onRetry={retry}
                  onNextTask={(t) => setTask(t)}
                  onNextLevel={level < 3 ? () => selectLevel(level + 1) : undefined}
                  onNextTopic={nextTopic ? () => selectTopic(nextTopic.id) : undefined}
                />
              )}
            </div>

            {/* Даалгаврын картууд */}
            <div className="flex flex-col gap-3">
              {Array.from({ length: TASKS_PER_LEVEL }, (_, t) => (
                <TaskCard
                  key={t}
                  level={level}
                  index={t}
                  progress={tp[level][t]}
                  results={attempts[keyOf(level, t)]?.results ?? []}
                  active={t === task}
                  onSelect={() => setTask(t)}
                />
              ))}
              <p className="text-eyebrow leading-display text-s-sub">
                Даалгавар бүр {PROBLEMS_PER_TASK} бодлоготой, {TASK_PASS} ба түүнээс дээш зөв бол тэнцэнэ. {TASKS_PER_LEVEL} даалгавар
                бүгд тэнцвэл дараагийн түвшин нээгдэнэ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type SummaryProps = {
  results: AttemptResult[];
  level: number;
  task: number;
  levelDone: boolean;
  /** Тэнцээгүй үлдсэн дараагийн даалгавар */
  nextTask?: number;
  onRetry: () => void;
  onNextTask: (t: number) => void;
  onNextLevel?: () => void;
  onNextTopic?: () => void;
};

/** Оролдлогын дүн, буруу бодлогын бодолт, дараагийн алхам */
function AttemptSummary({ results, level, task, levelDone, nextTask, onRetry, onNextTask, onNextLevel, onNextTopic }: SummaryProps) {
  const score = results.filter((r) => r.correct).length;
  const passed = score >= TASK_PASS;
  return (
    <BracketCard accent className={cn("flex flex-col gap-5 p-6 sm:p-8", passed ? "bg-ok/10" : "bg-danger/5")}>
      <p className={cn("font-display text-impact leading-cap font-bold", passed ? "text-ok" : "text-danger")}>
        {score} / {PROBLEMS_PER_TASK}
      </p>
      <h3 className="font-display text-heading leading-headline font-bold uppercase">
        {levelDone && passed
          ? level < 3
            ? `${LEVEL_KEYS[level]} түвшинг давлаа! ${LEVEL_KEYS[level + 1]} нээгдлээ 🎉`
            : "Бүх түвшинг давлаа! 🏆"
          : passed
            ? `${LEVEL_KEYS[level]}-Даалгавар ${task + 1} тэнцлээ!`
            : `Тэнцэхэд ${TASK_PASS} зөв хэрэгтэй. Дахин оролдоорой.`}
      </h3>
      {results.some((r) => !r.correct) && (
        <div className="flex flex-col gap-3">
          <p className="text-eyebrow font-bold uppercase text-s-sub">Буруу бодсон бодлогын бодолт</p>
          <ul className="flex flex-col gap-3">
            {results.map((r, i) =>
              r.correct ? null : (
                <li key={i} className="border-l-2 border-danger pl-3 text-body leading-display">
                  <MathText text={`${i + 1}. ${r.problem.text}`} />
                  <small className="block text-s-sub">
                    <MathText text={r.problem.steps.join(" → ")} />
                  </small>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
      <Actions>
        {levelDone && passed && onNextLevel && <Button onClick={onNextLevel}>{LEVEL_KEYS[level + 1]} түвшин рүү</Button>}
        {levelDone && passed && !onNextLevel && onNextTopic && <Button onClick={onNextTopic}>Дараагийн сэдэв</Button>}
        {passed && !levelDone && nextTask !== undefined && (
          <Button onClick={() => onNextTask(nextTask)}>
            {LEVEL_KEYS[level]}-Даалгавар {nextTask + 1} рүү
          </Button>
        )}
        <Button onClick={onRetry} variant={passed ? "link" : "solid"}>
          {passed ? "Шинэ бодлогоор дахин бодох" : "Дахин оролдох"}
        </Button>
      </Actions>
    </BracketCard>
  );
}
