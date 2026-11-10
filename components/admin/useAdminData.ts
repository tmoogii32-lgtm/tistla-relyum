"use client";

import { useEffect, useState } from "react";
import { fetchAll } from "@/components/hotsrogdol/useTracker";
import { getSupabase } from "@/lib/supabase";
import type { RecordLevel } from "@/lib/tracker";

/* Админ: бүх багшийн сурагч, дүн, сорилын хариулт (RLS-ийн "админ" эрхээр).
   Засвар шууд дэлгэцэнд гарч, Supabase-д хадгалагдана; алдаа гарвал буцаан ачаална. */

export type AdminTeacher = { id: string; email: string; code: string | null; isAdmin: boolean };
export type AdminStudent = { id: string; teacherId: string; name: string; cls: string; created: number };
export type AdminRecord = {
  id: string;
  teacherId: string;
  studentId: string;
  task: string;
  level: RecordLevel;
  score: number;
  date: string;
  created: number;
};
export type AdminSub = { id: string; teacherId: string; studentId: string; answers: number[]; self: number[]; date: string; created: number };

export type AdminStatus = "loading" | "forbidden" | "error" | "ready";
type Data = { teachers: AdminTeacher[]; students: AdminStudent[]; records: AdminRecord[]; subs: AdminSub[] };
const EMPTY: Data = { teachers: [], students: [], records: [], subs: [] };

type StudentRow = { id: string; teacher_id: string; name: string; cls: string; created_at: string };
type RecordRow = { id: string; teacher_id: string; student_id: string; task: string; level: string; score: number; date: string; created_at: string };
type SubRow = { id: string; teacher_id: string; student_id: string; answers: number[]; self: number[]; date: string; created_at: string };
type TeacherRow = { id: string; email: string; code: string | null; is_admin: boolean };

async function loadAll(): Promise<{ status: AdminStatus; data: Data }> {
  const db = getSupabase();
  const { data: isAdmin, error } = await db.rpc("is_admin");
  // Функц байхгүй (migration ажиллаагүй) эсвэл админ биш
  if (error || isAdmin !== true) return { status: "forbidden", data: EMPTY };
  const [teachers, students, records, subs] = await Promise.all([
    db.rpc("admin_teachers").then(({ data, error: e }) => {
      if (e) throw e;
      return data as TeacherRow[];
    }),
    fetchAll<StudentRow>("students", "id,teacher_id,name,cls,created_at"),
    fetchAll<RecordRow>("records", "id,teacher_id,student_id,task,level,score,date,created_at"),
    fetchAll<SubRow>("diag_submissions", "id,teacher_id,student_id,answers,self,date,created_at"),
  ]);
  return {
    status: "ready",
    data: {
      teachers: teachers.map((t) => ({ id: t.id, email: t.email, code: t.code, isAdmin: t.is_admin })),
      students: students.map((s) => ({ id: s.id, teacherId: s.teacher_id, name: s.name, cls: s.cls, created: Date.parse(s.created_at) })),
      records: records.map((r) => ({
        id: r.id,
        teacherId: r.teacher_id,
        studentId: r.student_id,
        task: r.task,
        level: r.level as RecordLevel,
        score: r.score,
        date: r.date,
        created: Date.parse(r.created_at),
      })),
      subs: subs.map((s) => ({
        id: s.id,
        teacherId: s.teacher_id,
        studentId: s.student_id,
        answers: s.answers,
        self: s.self,
        date: s.date,
        created: Date.parse(s.created_at),
      })),
    },
  };
}

/** `userKey` — нэвтэрсэн хэрэглэгч солигдоход дахин ачаална (null бол нэвтрээгүй) */
export function useAdminData(userKey: string | null) {
  const [loaded, setLoaded] = useState<{ key: string; status: AdminStatus; data: Data } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userKey) return;
    let alive = true;
    loadAll()
      .then((r) => alive && setLoaded({ key: userKey, ...r }))
      .catch(() => alive && setLoaded({ key: userKey, status: "error", data: EMPTY }));
    return () => {
      alive = false;
    };
  }, [userKey, tick]);

  const current = loaded && loaded.key === userKey ? loaded : null;
  const status: AdminStatus = current?.status ?? "loading";
  const data = current?.data ?? EMPTY;

  const reload = () => setTick((t) => t + 1);
  const patch = (fn: (d: Data) => Data) => setLoaded((l) => (l ? { ...l, data: fn(l.data) } : l));
  const onError = (msg: string) => (r: { error: unknown }) => {
    if (!r.error) return;
    alert(msg);
    reload();
  };
  const db = () => getSupabase();

  return {
    status,
    ...data,
    reload,

    updateStudent(id: string, v: { name: string; cls: string }) {
      patch((d) => ({ ...d, students: d.students.map((s) => (s.id === id ? { ...s, ...v } : s)) }));
      void db().from("students").update(v).eq("id", id).then(onError("Сурагчийн мэдээллийг хадгалж чадсангүй."));
    },
    deleteStudent(id: string) {
      patch((d) => ({
        ...d,
        students: d.students.filter((s) => s.id !== id),
        records: d.records.filter((r) => r.studentId !== id),
        subs: d.subs.filter((s) => s.studentId !== id),
      }));
      void db().from("students").delete().eq("id", id).then(onError("Сурагчийг устгаж чадсангүй."));
    },
    updateRecord(id: string, v: { task: string; level: RecordLevel; score: number; date: string }) {
      patch((d) => ({ ...d, records: d.records.map((r) => (r.id === id ? { ...r, ...v } : r)) }));
      void db().from("records").update(v).eq("id", id).then(onError("Дүнг хадгалж чадсангүй."));
    },
    deleteRecord(id: string) {
      patch((d) => ({ ...d, records: d.records.filter((r) => r.id !== id) }));
      void db().from("records").delete().eq("id", id).then(onError("Дүнг устгаж чадсангүй."));
    },
    updateSub(id: string, v: { answers: number[]; date: string }) {
      patch((d) => ({ ...d, subs: d.subs.map((s) => (s.id === id ? { ...s, ...v } : s)) }));
      void db().from("diag_submissions").update(v).eq("id", id).then(onError("Сорилын хариултыг хадгалж чадсангүй."));
    },
    deleteSub(id: string) {
      patch((d) => ({ ...d, subs: d.subs.filter((s) => s.id !== id) }));
      void db().from("diag_submissions").delete().eq("id", id).then(onError("Сорилын хариултыг устгаж чадсангүй."));
    },
  };
}

export type AdminApi = ReturnType<typeof useAdminData>;
