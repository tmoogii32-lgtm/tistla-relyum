/* Түвшинчилсэн даалгаврын явц: сурагч → сэдэв → [түвшин][даалгавар] */

import { TASKS_PER_LEVEL, TASK_PASS } from "@/lib/problems";

export type TaskProgress = {
  /** Дууссан оролдлогын тоо (дараагийн оролдлогын seed) */
  attempts: number;
  /** Хамгийн өндөр дүн (5-аас) */
  best: number;
  passed: boolean;
  /** Бүх оролдлогоор нийт бодсон / зөв бодсон */
  solved: number;
  correct: number;
};

export type TopicProgress = TaskProgress[][];
/** studentId ("guest" — бүртгэлгүй) → topicId → явц */
export type ProgressStore = Record<string, Record<string, TopicProgress>>;

export const GUEST = "guest";
export const EMPTY_PROGRESS: ProgressStore = {};

const emptyTask = (): TaskProgress => ({ attempts: 0, best: 0, passed: false, solved: 0, correct: 0 });

export function topicProgress(store: ProgressStore, student: string, topicId: string): TopicProgress {
  const saved = store[student]?.[topicId];
  return [0, 1, 2, 3].map((l) =>
    Array.from({ length: TASKS_PER_LEVEL }, (_, t) => ({ ...emptyTask(), ...(saved?.[l]?.[t] ?? {}) })),
  );
}

export const levelPassed = (tp: TopicProgress, level: number) => tp[level].every((t) => t.passed);

/** Т1 үргэлж нээлттэй; дараагийнх нь өмнөх түвшний 3 даалгавар бүгд тэнцсэн үед */
export const levelUnlocked = (tp: TopicProgress, level: number) => level === 0 || levelPassed(tp, level - 1);

/** Нээлттэй хамгийн өндөр түвшин (0–3) */
export const currentLevel = (tp: TopicProgress) => [3, 2, 1, 0].find((l) => levelUnlocked(tp, l)) ?? 0;

export const topicDone = (tp: TopicProgress) => levelPassed(tp, 3);

/** Оролдлого дууссаны дараах шинэ store */
export function recordAttempt(store: ProgressStore, student: string, topicId: string, level: number, task: number, score: number, total: number): ProgressStore {
  const tp = topicProgress(store, student, topicId);
  const cur = tp[level][task];
  tp[level][task] = {
    attempts: cur.attempts + 1,
    best: Math.max(cur.best, score),
    passed: cur.passed || score >= TASK_PASS,
    solved: cur.solved + total,
    correct: cur.correct + score,
  };
  return { ...store, [student]: { ...store[student], [topicId]: tp } };
}

export function isProgressStore(v: unknown): v is ProgressStore {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
