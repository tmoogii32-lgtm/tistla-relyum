"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_DIAG, type DiagAttempt, type DiagStore } from "@/lib/diagnosis";
import { getSupabase } from "@/lib/supabase";
import { EMPTY_STATE, uid, type RecordLevel, type Student, type TaskRecord, type TrackerState } from "@/lib/tracker";

/* Сурагч, дүнгийн бүртгэл, оношлох сорилын хариулт — Supabase (students, records, diag_submissions).
   Багш нэвтэрсэн үед түүний өгөгдөл ачаалагдана. Өөрчлөлт шууд дэлгэцэнд гарч (optimistic),
   дараа нь Supabase-д бичигдэнэ; алдаа гарвал буцаан ачаална.
   Сурагч /soril хуудсаар илгээсэн сорил ч энд (diag, records) орж ирнэ. */

export type TrackerStatus = "loading" | "signedOut" | "ready";
type Snapshot = { status: TrackerStatus; email: string | null; state: TrackerState; diag: DiagStore };

const INITIAL: Snapshot = { status: "loading", email: null, state: EMPTY_STATE, diag: EMPTY_DIAG };
let snap = INITIAL;
const listeners = new Set<() => void>();
let started = false;
/** Өгөгдөл нь ачаалагдсан (эсвэл ачаалагдаж буй) багшийн id */
let userId: string | null = null;

function set(next: Partial<Snapshot>) {
  snap = { ...snap, ...next };
  listeners.forEach((l) => l());
}
const update = (fn: (s: TrackerState) => TrackerState) => set({ state: fn(snap.state) });

const fail = (msg = "Supabase-д хадгалж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.") => alert(msg);

/* ---------- DB ↔ app хөрвүүлэлт ---------- */
type StudentRow = { id: string; name: string; cls: string; created_at: string };
type RecordRow = { id: string; student_id: string; task: string; level: string; score: number; date: string; created_at: string };
type DiagRow = { student_id: string; answers: number[]; self: number[]; date: string };

/** Сурагч бүрийн оролдлогууд (created_at-аар эрэмбэлэгдсэн → сүүлийнх нь хамгийн сүүлд) */
function toDiagStore(rows: DiagRow[]): DiagStore {
  const store: DiagStore = {};
  rows.forEach((r) => (store[r.student_id] ??= []).push({ date: r.date, answers: r.answers, self: r.self }));
  return store;
}
const diagRow = (studentId: string, a: DiagAttempt, created = Date.now()) => ({
  id: uid(),
  student_id: studentId,
  answers: a.answers,
  self: a.self,
  date: a.date,
  created_at: new Date(created).toISOString(),
});

const toStudent = (r: StudentRow): Student => ({ id: r.id, name: r.name, cls: r.cls, created: Date.parse(r.created_at) });
const toRecord = (r: RecordRow): TaskRecord => ({
  id: r.id,
  studentId: r.student_id,
  task: r.task,
  level: r.level as RecordLevel,
  score: r.score,
  date: r.date,
  created: Date.parse(r.created_at),
});
const studentRow = (s: Student) => ({ id: s.id, name: s.name, cls: s.cls, created_at: new Date(s.created).toISOString() });
const recordRow = (r: TaskRecord) => ({
  id: r.id,
  student_id: r.studentId,
  task: r.task,
  level: r.level,
  score: r.score,
  date: r.date,
  created_at: new Date(r.created).toISOString(),
});

/**
 * Supabase нэг удаад 1000 мөр буцаадаг тул хуудаслан уншина.
 * `teacherId` — админ RLS-ээр бүх багшийн мөрийг харах эрхтэй тул багшийн хуудсанд өөрийнхөөр нь шүүнэ.
 */
export async function fetchAll<T>(table: string, columns: string, teacherId?: string): Promise<T[]> {
  const PAGE = 1000;
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    let q = getSupabase().from(table).select(columns);
    if (teacherId) q = q.eq("teacher_id", teacherId);
    const { data, error } = await q.order("created_at").range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...(data as T[]));
    if (data.length < PAGE) return out;
  }
}

async function load(id: string) {
  try {
    const [students, records, diag] = await Promise.all([
      fetchAll<StudentRow>("students", "id,name,cls,created_at", id),
      fetchAll<RecordRow>("records", "id,student_id,task,level,score,date,created_at", id),
      fetchAll<DiagRow>("diag_submissions", "student_id,answers,self,date", id),
    ]);
    if (userId !== id) return; // энэ хооронд гарсан / өөр багш нэвтэрсэн
    set({ status: "ready", state: { students: students.map(toStudent), records: records.map(toRecord) }, diag: toDiagStore(diag) });
  } catch {
    if (userId !== id) return;
    set({ status: "ready", state: EMPTY_STATE, diag: EMPTY_DIAG });
    fail("Бүртгэлийг Supabase-аас ачаалж чадсангүй. Хуудсаа дахин ачаална уу.");
  }
}
const reload = () => userId && void load(userId);
/** Сурагчдын шинээр илгээсэн сорилыг татах */
export const refresh = () => reload();

function start() {
  if (started) return;
  started = true;
  getSupabase().auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;
    if (!user) {
      userId = null;
      set({ status: "signedOut", email: null, state: EMPTY_STATE, diag: EMPTY_DIAG });
      return;
    }
    set({ email: user.email ?? null });
    if (userId === user.id) return; // токен шинэчлэгдсэн гэх мэт — дахин ачаалах шаардлагагүй
    userId = user.id;
    set({ status: "loading", state: EMPTY_STATE, diag: EMPTY_DIAG });
    // onAuthStateChange дотроос Supabase-ийг шууд дуудвал гацдаг тул дараагийн tick-д
    setTimeout(() => void load(user.id), 0);
  });
}

function subscribe(cb: () => void) {
  start();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/* ---------- Нэвтрэлт ---------- */
export async function signIn(email: string, password: string) {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  return error;
}

/** Шинэ багшийн бүртгэл. `needsConfirm` — и-мэйлээ баталгаажуулах шаардлагатай эсэх */
export async function signUp(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.href },
  });
  return { error, needsConfirm: !error && !data.session };
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

/* ---------- Өгөгдөл өөрчлөх ---------- */
function addStudent(name: string, cls: string) {
  const student: Student = { id: uid(), name, cls, created: Date.now() };
  update((s) => ({ ...s, students: [...s.students, student] }));
  void getSupabase()
    .from("students")
    .insert(studentRow(student))
    .then(({ error }) => {
      if (!error) return;
      update((s) => ({ ...s, students: s.students.filter((x) => x.id !== student.id) }));
      fail();
    });
  return student;
}

function deleteStudent(id: string) {
  update((s) => ({ students: s.students.filter((x) => x.id !== id), records: s.records.filter((r) => r.studentId !== id) }));
  const diag = { ...snap.diag };
  delete diag[id];
  set({ diag });
  // records, diag_submissions нь ON DELETE CASCADE-аар хамт устна
  void getSupabase()
    .from("students")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (!error) return;
      fail();
      reload();
    });
}

function addRecord(rec: Omit<TaskRecord, "id" | "created">) {
  const record: TaskRecord = { ...rec, id: uid(), created: Date.now() };
  update((s) => ({ ...s, records: [...s.records, record] }));
  void getSupabase()
    .from("records")
    .insert(recordRow(record))
    .then(({ error }) => {
      if (!error) return;
      update((s) => ({ ...s, records: s.records.filter((r) => r.id !== record.id) }));
      fail("Дүнг Supabase-д бүртгэж чадсангүй. Интернэт холболтоо шалгана уу.");
    });
}

/** Багшийн дэлгэц дээр бүртгэлтэй сурагчаар өгүүлсэн оношлох сорил */
function addDiagnosis(studentId: string, a: DiagAttempt) {
  const prev = snap.diag;
  set({ diag: { ...prev, [studentId]: [...(prev[studentId] ?? []), a] } });
  void getSupabase()
    .from("diag_submissions")
    .insert(diagRow(studentId, a))
    .then(({ error }) => {
      if (!error) return;
      fail("Сорилын хариултыг Supabase-д хадгалж чадсангүй. Интернэт холболтоо шалгана уу.");
      reload();
    });
}

function deleteRecord(id: string) {
  update((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }));
  void getSupabase()
    .from("records")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (!error) return;
      fail();
      reload();
    });
}

function clearAll() {
  if (!userId) return;
  set({ state: EMPTY_STATE, diag: EMPTY_DIAG });
  void getSupabase()
    .from("students")
    .delete()
    .eq("teacher_id", userId)
    .then(({ error }) => {
      if (!error) return;
      fail();
      reload();
    });
}

/**
 * Энэ браузерт (localStorage) өмнө хадгалсан бүртгэлийг Supabase руу хуулна.
 * id-г хэвээр нь хадгалдаг тул даалгаврын явц сурагчтайгаа холбоотой үлдэнэ; давтан ажиллуулахад давхардахгүй.
 */
export async function importLegacy(legacy: TrackerState, legacyDiag: DiagStore) {
  if (!userId) throw new Error("Нэвтрээгүй байна");
  const db = getSupabase();
  const CHUNK = 500;
  const studentIds = new Set(legacy.students.map((s) => s.id));
  const records = legacy.records.filter((r) => studentIds.has(r.studentId));
  // Оношлох сорилын хуучин оролдлогууд — дарааллаа хадгалахын тулд created_at-ыг 1ms-ээр ялгана
  const base = Date.now();
  const diagRows = Object.entries(legacyDiag)
    .filter(([sid, list]) => studentIds.has(sid) && Array.isArray(list))
    .flatMap(([sid, list]) => list.map((a, i) => diagRow(sid, a, base + i)));
  for (let i = 0; i < legacy.students.length; i += CHUNK) {
    const rows = legacy.students.slice(i, i + CHUNK).map(studentRow);
    const { error } = await db.from("students").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
  }
  for (let i = 0; i < records.length; i += CHUNK) {
    const rows = records.slice(i, i + CHUNK).map(recordRow);
    const { error } = await db.from("records").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
  }
  for (let i = 0; i < diagRows.length; i += CHUNK) {
    const { error } = await db.from("diag_submissions").insert(diagRows.slice(i, i + CHUNK));
    if (error) throw error;
  }
  await load(userId);
}

/** Сурагч ба дүнгийн бүртгэл, оношлох сорилын хариулт (Supabase) + нэвтэрсэн багшийн төлөв */
export function useTracker() {
  const s = useSyncExternalStore(subscribe, () => snap, () => INITIAL);
  return {
    state: s.state,
    diag: s.diag,
    status: s.status,
    email: s.email,
    addStudent,
    deleteStudent,
    addRecord,
    deleteRecord,
    addDiagnosis,
    clearAll,
  };
}
