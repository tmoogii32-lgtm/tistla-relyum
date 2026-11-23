/* Эцэг эхийн тайлан (Supabase: students.parent_token + parent_report RPC).
   Эцэг эх нэвтрэхгүй — зөвхөн токентой холбоосоор тухайн хүүхдийнхээ дүнг харна. */

import type { DiagAttempt } from "@/lib/diagnosis";
import { getSupabase } from "@/lib/supabase";
import type { RecordLevel, TaskRecord } from "@/lib/tracker";

export type ParentReport = {
  name: string;
  cls: string;
  /** Хуучнаас шинэ рүү */
  records: TaskRecord[];
  /** Оношлох сорилын оролдлогууд — сүүлийнх нь хамгийн сүүлд */
  diag: DiagAttempt[];
};

type RawReport = {
  name: string;
  cls: string;
  records: { task: string; level: string; score: number; date: string; created_at: string }[];
  diag: DiagAttempt[];
};

/** Migration (20261123000000_parent_report.sql) ажиллаагүй үед гарах алдаа */
export const NOT_CONFIGURED = "not_configured";
const isMissing = (msg: string) => /parent_token|parent_report|could not find|does not exist|schema cache/i.test(msg);

export const parentUrl = (token: string) => `${window.location.origin}/etseg-eh?t=${token}`;

/** Эцэг эхийн хуудас: токеноор тайлан татна. Олдохгүй бол null */
export async function fetchParentReport(token: string): Promise<ParentReport | null> {
  const { data, error } = await getSupabase().rpc("parent_report", { p_token: token });
  if (error) throw new Error(isMissing(error.message) ? NOT_CONFIGURED : error.message);
  if (!data) return null;
  const raw = data as RawReport;
  return {
    name: raw.name,
    cls: raw.cls,
    records: raw.records.map((r, i) => ({
      id: String(i),
      studentId: "",
      task: r.task,
      level: r.level as RecordLevel,
      score: r.score,
      date: r.date,
      created: Date.parse(r.created_at),
    })),
    diag: raw.diag,
  };
}

/** Багш: сурагчийн эцэг эхийн токен */
export async function getParentToken(studentId: string): Promise<string> {
  const { data, error } = await getSupabase().from("students").select("parent_token").eq("id", studentId).single();
  if (error) throw new Error(isMissing(error.message) ? NOT_CONFIGURED : error.message);
  return (data as { parent_token: string }).parent_token;
}

/** Багш: токеныг шинэчилнэ — өмнө илгээсэн холбоос ажиллахаа болино */
export async function resetParentToken(studentId: string): Promise<string> {
  const token = crypto.randomUUID();
  const { error } = await getSupabase().from("students").update({ parent_token: token }).eq("id", studentId);
  if (error) throw new Error(isMissing(error.message) ? NOT_CONFIGURED : error.message);
  return token;
}
