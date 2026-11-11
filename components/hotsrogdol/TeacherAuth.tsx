"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type SubmitEvent } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Field, FormError, inputClass } from "@/components/ui/Form";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EMPTY_DIAG, isDiagStore } from "@/lib/diagnosis";
import { examUrl } from "@/lib/exam";
import { GUEST } from "@/lib/taskProgress";
import { EMPTY_STATE, isTrackerState } from "@/lib/tracker";
import { cardTitle } from "./parts";
import { checkIsAdmin, importLegacy, refresh, requestPasswordReset, signIn, signOut, teacherSignIn, updatePassword } from "./useTracker";

/** Supabase-ийн англи алдаа, teacher_prepare_login-ийн кодыг монголоор */
function authMessage(msg: string) {
  if (msg === "wrong_shared_password") return "Багшийн нийтлэг нууц үг буруу байна. Сургуулийн админаас нууц үгээ лавлана уу.";
  if (msg === "admin_account") return "Энэ и-мэйл админ бүртгэл байна. «Админ» табаар өөрийн нууц үгээр нэвтэрнэ үү.";
  if (msg === "bad_email") return "И-мэйлийн хаяг буруу байна.";
  if (msg === "not_configured")
    return "Багшийн нийтлэг нууц үг Supabase-д тохируулагдаагүй байна (20261111120000_teacher_shared_password.sql). Админд хандана уу.";
  if (/invalid login credentials/i.test(msg)) return "И-мэйл эсвэл нууц үг буруу байна. Нууц үгээ санахгүй бол «Нууц үгээ мартсан уу?» дарна уу.";
  if (/email not confirmed/i.test(msg)) return "И-мэйлээ баталгаажуулаагүй байна. Ирсэн захидлын холбоосыг дарна уу.";
  if (/already registered/i.test(msg)) return "Энэ и-мэйлээр бүртгэл үүссэн байна. Нэвтэрнэ үү.";
  if (/different from the old/i.test(msg)) return "Шинэ нууц үг хуучнаасаа өөр байх ёстой.";
  if (/password/i.test(msg) && /(6|short|weak)/i.test(msg)) return "Нууц үг хамгийн багадаа 6 тэмдэгт байна.";
  if (/rate limit/i.test(msg)) return "Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу.";
  if (/sending|smtp|dial tcp/i.test(msg))
    return "И-мэйл илгээж чадсангүй. Supabase → Authentication → Emails → SMTP тохиргоог шалгана уу (Host: smtp.gmail.com, Port: 465).";
  return msg;
}

type Mode = "in" | "forgot";

/**
 * Нэвтрэх.
 * Багш — өөрийн и-мэйл + бүх багшид нийтлэг нууц үг; бүртгэлгүй бол анх нэвтрэхэд автоматаар үүснэ
 *   (и-мэйл баталгаажуулалт, нууц үг сэргээх шаардлагагүй). `initialMode="up"` — зөвхөн гарчиг өөр.
 * `admin` — админ өөрийн нууц үгээр нэвтэрч, эрхийг шалгаад /admin руу шилжинэ; нууц үг сэргээх боломжтой.
 */
export function LoginCard({ initialMode = "in", admin = false }: { initialMode?: "in" | "up"; admin?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const em = email.trim();
    if (mode === "forgot") {
      if (!em) return setError("И-мэйлээ бөглөнө үү.");
    } else if (!em || !password) {
      return setError(admin ? "И-мэйл болон нууц үгээ бөглөнө үү." : "И-мэйл болон багшийн нийтлэг нууц үгийг бөглөнө үү.");
    }
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "forgot") {
        const err = await requestPasswordReset(em);
        if (err) setError(authMessage(err.message));
        else setInfo(`${em} хаяг руу нууц үг сэргээх холбоос илгээлээ. Захидлын холбоосыг дарахад шинэ нууц үг тохируулах хэсэг нээгдэнэ.`);
      } else if (admin) {
        const err = await signIn(em, password);
        if (err) setError(authMessage(err.message));
        else if (await checkIsAdmin()) router.push("/admin");
        else setError("Нэвтэрлээ, гэхдээ энэ бүртгэл админы эрхгүй байна. Багшийн хэсгээр орно уу.");
      } else {
        const err = await teacherSignIn(em, password);
        if (err) setError(authMessage(err));
      }
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("NEXT_PUBLIC_SUPABASE")
          ? "Сайтын Supabase тохиргоо дутуу байна (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY). Админд хандана уу."
          : "Supabase-тэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.",
      );
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "forgot" ? "Нууц үг сэргээх" : admin ? "Админ нэвтрэх" : initialMode === "up" ? "Багшийн бүртгэл үүсгэх" : "Багш нэвтрэх";
  const lead =
    mode === "forgot"
      ? "Бүртгэлтэй и-мэйлээ оруулбал нууц үгээ шинээр тохируулах холбоос и-мэйлээр ирнэ."
      : admin
        ? "Админ эрхтэй бүртгэлээр нэвтэрмэгц бүх багшийн сурагч, дүн, судалгааны хэсэг рүү шилжинэ."
        : "Өөрийн и-мэйл хаяг болон сургуулиас өгсөн багшийн нийтлэг нууц үгээр нэвтэрнэ. Бүртгэлгүй бол анх нэвтрэхэд бүртгэл автоматаар үүснэ. Нэвтэрмэгц бүх сурагчийн дүнг харж, ангиараа шүүнэ.";

  return (
    <BracketCard className="flex max-w-xl flex-col gap-6 bg-s-raised">
      <div className="flex flex-col gap-2">
        <h2 className={cardTitle}>{title}</h2>
        <p className="text-body leading-display text-s-sub">{lead}</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="И-мэйл">
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        {mode !== "forgot" && (
          <Field label={admin ? "Нууц үг" : "Багшийн нийтлэг нууц үг"}>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
        )}
        {info && (
          <p role="status" className="text-body leading-display text-ok">
            {info}
          </p>
        )}
        <FormError>{error}</FormError>
        <Actions>
          <Button type="submit" disabled={busy}>
            {busy ? "Түр хүлээнэ үү…" : mode === "forgot" ? "Холбоос илгээх" : "Нэвтрэх"}
          </Button>
          {admin && mode === "in" && (
            <Button variant="link" onClick={() => switchMode("forgot")}>
              Нууц үгээ мартсан уу?
            </Button>
          )}
          {mode === "forgot" && (
            <Button variant="link" onClick={() => switchMode("in")}>
              Нэвтрэх рүү буцах
            </Button>
          )}
        </Actions>
      </form>
    </BracketCard>
  );
}

/** И-мэйлийн «нууц үг сэргээх» холбоосоор орсон үед шинэ нууц үг тохируулах */
export function NewPasswordCard({ email }: { email: string | null }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 6) return setError("Нууц үг хамгийн багадаа 6 тэмдэгт байна.");
    if (password !== confirm) return setError("Хоёр нууц үг таарахгүй байна.");
    setBusy(true);
    setError("");
    try {
      const err = await updatePassword(password);
      if (err) setError(authMessage(err.message));
      else setDone(true);
    } catch {
      setError("Supabase-тэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <BracketCard accent className="flex max-w-xl flex-col gap-4 bg-ok/10">
        <h2 className={cardTitle}>Нууц үг шинэчлэгдлээ ✓</h2>
        <p className="text-body leading-display">Цаашид шинэ нууц үгээрээ нэвтэрнэ.</p>
      </BracketCard>
    );
  }

  return (
    <BracketCard accent className="flex max-w-xl flex-col gap-6 bg-s-raised">
      <div className="flex flex-col gap-2">
        <h2 className={cardTitle}>Шинэ нууц үг тохируулах</h2>
        <p className="text-body leading-display text-s-sub">
          {email ? (
            <>
              <strong className="text-s-fg">{email}</strong> бүртгэлийн шинэ нууц үгийг оруулна уу.
            </>
          ) : (
            "Шинэ нууц үгээ оруулна уу."
          )}
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Шинэ нууц үг">
          <input type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Шинэ нууц үгээ давтах">
          <input type="password" autoComplete="new-password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit" disabled={busy}>
          {busy ? "Түр хүлээнэ үү…" : "Хадгалах"}
        </Button>
      </form>
    </BracketCard>
  );
}

/** Нэвтэрсэн багш + шинэчлэх + гарах */
export function AccountBar({ email }: { email: string | null }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-s-border px-4 py-3">
      <p className="text-body text-s-sub">
        Нэвтэрсэн багш: <strong className="text-s-fg">{email ?? "—"}</strong>
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <Button variant="link" onClick={refresh}>
          Шинэчлэх
        </Button>
        <Button variant="link" onClick={() => void signOut()}>
          Гарах
        </Button>
      </div>
    </div>
  );
}

const noSubscribe = () => () => {};

/** Сурагчдад өгөх сорилын холбоос (код шаардлагагүй) */
export function ExamShareCard() {
  const [copied, setCopied] = useState(false);
  const url = useSyncExternalStore(noSubscribe, examUrl, () => "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Холбоосыг хуулна уу:", url);
    }
  };

  return (
    <BracketCard accent className="flex flex-col gap-5 bg-s-raised p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">Сурагчдад өгөх</p>
        <h2 className={cardTitle}>Оношлох сорилын холбоос</h2>
        <p className="max-w-3xl text-body leading-display text-s-sub">
          Энэ холбоосоор сурагч нэвтрэлгүй, кодгүйгээр овог нэр, ангиа бичээд шууд сорил өгнө. Дүн нь бүх багшид харагдах тул доорх
          жагсаалтыг ангиар шүүж үзнэ үү. Шинэ дүн харах бол &quot;Шинэчлэх&quot; дарна уу.
        </p>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="min-w-0 text-body break-all">
          <a href={url} target="_blank" rel="noopener" className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
            {url}
          </a>
        </p>
        <Actions className="shrink-0">
          <Button onClick={() => void copy()}>{copied ? "Хуулсан ✓" : "Холбоос хуулах"}</Button>
        </Actions>
      </div>
    </BracketCard>
  );
}

const LEGACY_KEY = "hotsrogdol-v1";
const LEGACY_DIAG_KEY = "onosh-v1";

/** Энэ браузерт үлдсэн хуучин (localStorage) бүртгэлийг Supabase руу зөөх */
export function LegacyImport() {
  const [legacy, setLegacy] = useLocalStorage(LEGACY_KEY, EMPTY_STATE, isTrackerState);
  const [legacyDiag, setLegacyDiag] = useLocalStorage(LEGACY_DIAG_KEY, EMPTY_DIAG, isDiagStore);
  const [busy, setBusy] = useState(false);
  if (!legacy.students.length) return null;

  const run = async () => {
    setBusy(true);
    try {
      await importLegacy(legacy, legacyDiag);
      // Нөөц хуулбар үлдээгээд энэ картыг нууна
      try {
        localStorage.setItem(`${LEGACY_KEY}-backup`, JSON.stringify(legacy));
        localStorage.setItem(`${LEGACY_DIAG_KEY}-backup`, JSON.stringify(legacyDiag));
      } catch {
        /* нөөц хадгалж чадаагүй ч өгөгдөл Supabase-д орсон */
      }
      setLegacy(EMPTY_STATE);
      // Зочны оролдлого энэ браузерт үлдэнэ
      setLegacyDiag(legacyDiag[GUEST] ? { [GUEST]: legacyDiag[GUEST] } : EMPTY_DIAG);
    } catch {
      alert("Шилжүүлж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу. (Энэ браузер дахь бүртгэл хэвээр үлдлээ.)");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BracketCard accent className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
      <p className="max-w-xl text-body leading-display text-s-sub">
        Энэ браузерт өмнө хадгалсан <strong className="text-s-fg">{legacy.students.length} сурагч</strong>,{" "}
        <strong className="text-s-fg">{legacy.records.length} дүнгийн бүртгэл</strong> байна. Тэдгээрийг өөрийн Supabase бүртгэл
        рүү шилжүүлэх үү?
      </p>
      <Button onClick={() => void run()} disabled={busy}>
        {busy ? "Шилжүүлж байна…" : "Supabase руу шилжүүлэх"}
      </Button>
    </BracketCard>
  );
}
