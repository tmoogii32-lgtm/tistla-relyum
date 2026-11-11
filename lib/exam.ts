/* Нэвтрэлтгүй сурагчийн сорил (Supabase RPC). Сурагч хүснэгт рүү шууд хандахгүй — зөвхөн энэ функцээр.
   Сурагч кодгүйгээр нэр, ангиа бичээд сорил өгнө; дүн нь бүх багшид харагдана.
   Хуучин /soril?code=XXXXXX холбоос ажилласаар — тэр тохиолдолд сурагч тухайн багшид оноогдоно. */

import { diagnose, strandScores, type DiagAttempt } from "@/lib/diagnosis";
import { getSupabase } from "@/lib/supabase";

export const normalizeCode = (c: string) => c.trim().toUpperCase();

/** Сурагчийн сорилын холбоос */
export const examUrl = () => `${window.location.origin}/soril`;

/** Хоцрогдлын бүртгэлд орох хүрээ бүрийн дүн (DiagnosisSection-тэй ижил) */
export const diagRecords = (a: DiagAttempt) =>
  strandScores(diagnose(a)).map(({ strand, score }) => ({ task: `Оношлох сорил · ${strand}`, score }));

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
