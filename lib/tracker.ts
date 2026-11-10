/* Хоцрогдлыг тооцох — сурагч ба даалгаврын бүртгэлийн цэвэр функцүүд.
   (хуучин hotsrogdol.js-ийн тооцоолол) */

import { LEVEL_ORDER, MAX_SCORE, PASS_SCORE, type LevelName } from "@/data/levels";

export type Student = { id: string; name: string; cls: string; created: number };
/** "Онош" — оношлох сорилын хүрээний дүн (5-ын хуваарьт) */
export type RecordLevel = LevelName | "Онош";

export type TaskRecord = {
  id: string;
  studentId: string;
  task: string;
  level: RecordLevel;
  score: number;
  /** YYYY-MM-DD */
  date: string;
  created: number;
};
export type TrackerState = { students: Student[]; records: TaskRecord[] };
export type StudentStatus = "ok" | "behind" | "none";

export const EMPTY_STATE: TrackerState = { students: [], records: [] };

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function recordsOf(state: TrackerState, studentId: string) {
  return state.records.filter((r) => r.studentId === studentId);
}

export function byNewest(a: TaskRecord, b: TaskRecord) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return (b.created || 0) - (a.created || 0);
}

/** Даалгавар + түвшин бүрийн хамгийн сүүлийн дүн */
export function latestResults(records: TaskRecord[]) {
  const latest = new Map<string, TaskRecord>();
  [...records].sort(byNewest).forEach((r) => {
    const key = `${r.task.toLowerCase()}|${r.level}`;
    if (!latest.has(key)) latest.set(key, r);
  });
  return [...latest.values()];
}

export function behindTasks(state: TrackerState, studentId: string) {
  return latestResults(recordsOf(state, studentId)).filter((r) => r.score < PASS_SCORE);
}

/** Дундаж гүйцэтгэл (%) — бүртгэлгүй бол null */
export function averagePercent(records: TaskRecord[]) {
  if (!records.length) return null;
  const sum = records.reduce((s, r) => s + r.score, 0);
  return Math.round((sum / (records.length * MAX_SCORE)) * 100);
}

export function studentStatus(state: TrackerState, studentId: string): StudentStatus {
  if (!recordsOf(state, studentId).length) return "none";
  return behindTasks(state, studentId).length ? "behind" : "ok";
}

export function compareStudents(a: Student, b: Student) {
  return a.cls.localeCompare(b.cls, "mn") || a.name.localeCompare(b.name, "mn");
}

export function compareTasks(a: TaskRecord, b: TaskRecord) {
  return a.task.localeCompare(b.task, "mn") || LEVEL_ORDER.indexOf(a.level as LevelName) - LEVEL_ORDER.indexOf(b.level as LevelName);
}

/** Том жижиг үсэг харгалзахгүй давхардлыг арилгана */
export function unique(values: string[]) {
  const seen = new Set<string>();
  return values.filter((v) => {
    const k = v.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function isTrackerState(data: unknown): data is TrackerState {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as TrackerState).students) &&
    Array.isArray((data as TrackerState).records)
  );
}

/** Excel-д нээгдэх CSV мөрүүд */
export function toCsvRows(state: TrackerState) {
  const rows: (string | number)[][] = [["Овог нэр", "Анги", "Огноо", "Даалгавар", "Түвшин", "Зөв бодсон", "Нийт", "Үр дүн"]];
  [...state.students].sort(compareStudents).forEach((s) => {
    const recs = recordsOf(state, s.id).sort(byNewest);
    if (!recs.length) {
      rows.push([s.name, s.cls, "", "", "", "", "", "Дүнгүй"]);
      return;
    }
    recs.forEach((r) => {
      rows.push([s.name, s.cls, r.date, r.task, r.level, r.score, MAX_SCORE, r.score >= PASS_SCORE ? "Тэнцсэн" : "Тэнцээгүй"]);
    });
  });
  return rows;
}
