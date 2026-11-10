/* Нэвтрэлтгүй сурагчийн сорил ↔ багшийн код (Supabase RPC).
   Сурагч хүснэгт рүү шууд хандахгүй — зөвхөн эдгээр функцээр. */

import { diagnose, strandScores, type DiagAttempt } from "@/lib/diagnosis";
import { getSupabase } from "@/lib/supabase";

export const CODE_RE = /^[A-Z2-9]{6}$/;
export const normalizeCode = (c: string) => c.trim().toUpperCase();

/** Сурагчийн сорилын холбоос: /soril?code=XXXXXX */
export const examUrl = (code: string) => `${window.location.origin}/soril?code=${code}`;

/** Хоцрогдлын бүртгэлд орох хүрээ бүрийн дүн (DiagnosisSection-тэй ижил) */
export const diagRecords = (a: DiagAttempt) =>
  strandScores(diagnose(a)).map(({ strand, score }) => ({ task: `Оношлох сорил · ${strand}`, score }));

export async function checkTeacherCode(code: string) {
  const { data, error } = await getSupabase().rpc("check_teacher_code", { p_code: normalizeCode(code) });
  if (error) throw error;
  return data === true;
}

export async function submitDiagnostic(code: string, name: string, cls: string, a: DiagAttempt) {
  const { error } = await getSupabase().rpc("submit_diagnostic", {
    p_code: normalizeCode(code),
    p_name: name,
    p_cls: cls,
    p_answers: a.answers,
    p_self: a.self,
    p_scores: diagRecords(a),
    p_date: a.date,
  });
  if (error) throw error;
}

/** Нэвтэрсэн багшийн код (анх дуудахад үүснэ) */
export async function myTeacherCode() {
  const { data, error } = await getSupabase().rpc("my_teacher_code");
  if (error) throw error;
  return data as string;
}

export async function rotateTeacherCode() {
  const { data, error } = await getSupabase().rpc("rotate_teacher_code");
  if (error) throw error;
  return data as string;
}
