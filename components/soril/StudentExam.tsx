"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";
import { DiagnosticTest } from "@/components/daalgavar/Diagnostic";
import { DiagnosisReport } from "@/components/daalgavar/DiagnosisReport";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Field, FormError, inputClass } from "@/components/ui/Form";
import { DIAG_QUESTIONS } from "@/data/diagnostic";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { DiagAttempt } from "@/lib/diagnosis";
import { normalizeCode, submitDiagnostic } from "@/lib/exam";
import { TOPICS } from "@/lib/problems";
import { GUEST } from "@/lib/taskProgress";

type Phase = "info" | "test" | "sending" | "error" | "done";
const isString = (v: unknown): v is string => typeof v === "string";

const scrollTop = () => requestAnimationFrame(() => document.getElementById("soril")?.scrollIntoView({ behavior: "smooth", block: "start" }));

function submitMessage(err: unknown) {
  const msg = err instanceof Error ? err.message : typeof err === "object" && err && "message" in err ? String(err.message) : "";
  if (msg.includes("invalid_student")) return "Овог нэр (1–60) болон анги (1–10 тэмдэгт)-г зөв бөглөнө үү.";
  return "Дүнг илгээж чадсангүй. Интернэт холболтоо шалгаад \"Дахин илгээх\" дарна уу.";
}

/**
 * Сурагч нэвтрэлгүй, кодгүйгээр оношлох сорил өгнө: нэр, анги → сорил → онош.
 * Дүн нь Supabase-д орж, бүх багшид харагдана. Хуучин ?code= холбоосоор орвол тэр багшид оноогдоно.
 */
export function StudentExam() {
  const router = useRouter();
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>("info");
  const code = normalizeCode(params.get("code") ?? "");
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<DiagAttempt | null>(null);
  const [previous, setPrevious] = useState<DiagAttempt | undefined>();
  const [, setTopic] = useLocalStorage<string>("daalgavar-topic", TOPICS[0].id, isString);
  const [, setActive] = useLocalStorage<string>("daalgavar-student", GUEST, isString);

  // Сорил бөглөж байх үед санамсаргүй хаахаас сэрэмжлүүлнэ
  useEffect(() => {
    if (phase !== "test" && phase !== "sending" && phase !== "error") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  const start = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = name.trim().replace(/\s+/g, " ");
    const c = cls.trim();
    if (!n || !c) return setError("Овог нэр, ангиа бөглөнө үү.");
    setError("");
    setName(n);
    setCls(c);
    setPhase("test");
    scrollTop();
  };

  const send = async (a: DiagAttempt) => {
    // Дахин өгсөн бол өмнөх оролдлоготой харьцуулна ("Дахин илгээх" үед a нь ижил)
    if (attempt && attempt !== a) setPrevious(attempt);
    setAttempt(a);
    setPhase("sending");
    setError("");
    try {
      await submitDiagnostic(code, name, cls, a);
      setPhase("done");
    } catch (err) {
      setError(submitMessage(err));
      setPhase("error");
    }
    scrollTop();
  };

  const retake = () => {
    setPhase("test");
    scrollTop();
  };

  const nextStudent = () => {
    setName("");
    setCls("");
    setAttempt(null);
    setPrevious(undefined);
    setError("");
    setPhase("info");
    scrollTop();
  };

  const openTopic = (topicId: string) => {
    setActive(GUEST);
    setTopic(topicId);
    router.push("/daalgavar#ajillah");
  };

  return (
    <div id="soril" className="flex scroll-mt-4 flex-col gap-8">
      {phase === "info" && (
        <BracketCard className="flex max-w-2xl flex-col gap-6 bg-s-raised p-6 sm:p-8">
          <ul className="flex list-disc flex-col gap-1 pl-5 text-body leading-display text-s-sub">
            <li>Эхлээд хүрээ бүрт өөрийгөө 1–4 оноогоор үнэлнэ.</li>
            <li>Дараа нь {DIAG_QUESTIONS.length} даалгаварт хариулна — дурын дарааллаар шилжиж болно (~30 минут).</li>
            <li>Илгээсний дараа онош, хоцрогдлоо нөхөх төлөвлөгөө шууд гарч, дүн чинь багшид очно.</li>
          </ul>
          <form onSubmit={start} autoComplete="off" className="flex flex-col gap-4" noValidate>
            <Field label="Овог нэр">
              <input
                type="text"
                required
                maxLength={60}
                placeholder="Жишээ: Б. Тэмүүлэн"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Анги">
              <input
                type="text"
                required
                maxLength={10}
                placeholder="Жишээ: 7а"
                value={cls}
                onChange={(e) => setCls(e.target.value)}
                className={inputClass}
              />
            </Field>
            <FormError>{error}</FormError>
            <Button type="submit">Сорил эхлэх</Button>
          </form>
        </BracketCard>
      )}

      {phase === "test" && (
        <div className="flex flex-col gap-4">
          <p className="text-body text-s-sub">
            Сорил өгч буй: <strong className="text-s-fg">{name}</strong> ({cls})
          </p>
          <DiagnosticTest onSubmit={(a) => void send(a)} onCancel={() => setPhase(attempt ? "done" : "info")} />
        </div>
      )}

      {phase === "sending" && (
        <BracketCard className="bg-s-raised p-6 sm:p-8">
          <p role="status" className="text-lead">
            Дүнг багшид илгээж байна…
          </p>
        </BracketCard>
      )}

      {phase === "error" && attempt && (
        <BracketCard className="flex flex-col items-start gap-4 bg-danger/10 p-6 sm:p-8">
          <FormError>{error}</FormError>
          <Actions>
            <Button onClick={() => void send(attempt)}>Дахин илгээх</Button>
            <Button variant="link" onClick={nextStudent}>
              Эхнээс нь
            </Button>
          </Actions>
        </BracketCard>
      )}

      {phase === "done" && attempt && (
        <>
          <BracketCard accent className="flex flex-col items-start justify-between gap-4 bg-ok/10 p-6 sm:p-8 md:flex-row md:items-center">
            <p role="status" className="text-lead leading-display">
              <strong>{name}</strong>, сорил чинь багшид амжилттай илгээгдлээ ✓
            </p>
            <Button variant="link" onClick={nextStudent}>
              Өөр сурагч сорил өгөх
            </Button>
          </BracketCard>
          <DiagnosisReport attempt={attempt} previous={previous} studentName={name} onRetake={retake} onOpenTopic={openTopic} />
        </>
      )}
    </div>
  );
}
