"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Field, FormError, inputClass } from "@/components/ui/Form";
import { cn } from "@/lib/cn";
import { NOT_CONFIGURED, getParentToken, parentUrl, resetParentToken } from "@/lib/parent";
import type { Student } from "@/lib/tracker";
import { cardTitle } from "./parts";

type Props = {
  students: Student[];
  selected: string;
  onSelect: (id: string) => void;
};

const errorText = (msg: string) =>
  msg === NOT_CONFIGURED
    ? "Эцэг эхийн тайлан Supabase-д тохируулагдаагүй байна. supabase/migrations/20261123000000_parent_report.sql-г SQL Editor-т ажиллуулна уу."
    : "Холбоосыг Supabase-аас авч чадсангүй. Интернэт холболтоо шалгана уу.";

const noSubscribe = () => () => {};

const chip =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 border border-s-border px-4 py-2 text-label font-medium transition-colors hover:border-accent hover:text-accent";

/** Сурагч бүрийн эцэг эхэд илгээх тайлангийн холбоос: хуулах, утсаар хуваалцах, и-мэйл, SMS, шинэчлэх */
export function ParentShare({ students, selected, onSelect }: Props) {
  const student = students.find((s) => s.id === selected);
  const [link, setLink] = useState<{ id: string; url: string; error: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selected) return;
    let alive = true;
    getParentToken(selected)
      .then((t) => alive && setLink({ id: selected, url: parentUrl(t), error: "" }))
      .catch((e: Error) => alive && setLink({ id: selected, url: "", error: e.message }));
    return () => {
      alive = false;
    };
  }, [selected]);

  const current = link && link.id === selected ? link : null;
  const url = current?.url ?? "";
  const message = student
    ? `Сайн байна уу? ${student.name} (${student.cls} анги)-ийн хоцрогдлыг тооцсон төлөвлөгөө, нэмэлт даалгавартай ажиллаж буй байдлын тайлантай энэ холбоосоор танилцана уу:\n${url}`
    : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Холбоосыг хуулна уу:", url);
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "Хүүхдийн сурлагын тайлан", text: message });
    } catch {
      /* хэрэглэгч цуцалсан */
    }
  };

  const reset = async () => {
    if (!student || !confirm(`${student.name}-ийн эцэг эхэд өмнө илгээсэн холбоос ажиллахаа болино. Шинэ холбоос үүсгэх үү?`)) return;
    setBusy(true);
    try {
      const t = await resetParentToken(student.id);
      setLink({ id: student.id, url: parentUrl(t), error: "" });
    } catch (e) {
      setLink({ id: student.id, url: "", error: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  // Сервер дээр false — hydration зөрөхгүй
  const canShare = useSyncExternalStore(noSubscribe, () => "share" in navigator, () => false);
  const subject = encodeURIComponent("Хүүхдийн сурлагын тайлан");
  const body = encodeURIComponent(message);

  return (
    <BracketCard accent id="etseg-eh" className="flex min-w-0 scroll-mt-[calc(var(--nav-h)+1rem)] flex-col gap-6 bg-s-raised p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">Эцэг эхэд илгээх</p>
        <h2 className={cardTitle}>Эцэг эхийн тайлангийн холбоос</h2>
        <p className="max-w-3xl text-body leading-display text-s-sub">
          Сурагчаа сонгоод холбоосыг эцэг эхэд нь илгээнэ үү. Эцэг эх нэвтрэлгүйгээр зөвхөн өөрийн хүүхдийн онош, хоцрогдлоо нөхөх
          төлөвлөгөө, нэмэлт даалгаврын явцыг харна. Шинэ дүн бүртгэгдэхэд тайлан автоматаар шинэчлэгдэнэ.
        </p>
      </div>

      <Field label="Сурагч" className="max-w-md">
        <select value={selected} onChange={(e) => onSelect(e.target.value)} className={inputClass}>
          <option value="">— Сурагч сонгох —</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.cls})
            </option>
          ))}
        </select>
      </Field>

      {student && !current && (
        <p role="status" className="text-body text-s-sub">
          Холбоос бэлдэж байна…
        </p>
      )}
      {current?.error && <FormError>{errorText(current.error)}</FormError>}

      {student && url && (
        <div className="flex flex-col gap-5">
          <p className="min-w-0 border border-s-border bg-s-bg p-3 text-body break-all">
            <a href={url} target="_blank" rel="noopener" className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
              {url}
            </a>
          </p>
          <Actions>
            <Button onClick={() => void copy()}>{copied ? "Хуулсан ✓" : "Холбоос хуулах"}</Button>
            <Button href={url} external variant="link">
              Тайланг урьдчилж харах
            </Button>
          </Actions>
          <div className="flex flex-wrap gap-2">
            {canShare && (
              <button type="button" onClick={() => void share()} className={chip}>
                📲 Утсаар хуваалцах
              </button>
            )}
            <a href={`mailto:?subject=${subject}&body=${body}`} className={chip}>
              ✉️ И-мэйлээр
            </a>
            <a href={`sms:?&body=${body}`} className={chip}>
              💬 SMS-ээр
            </a>
            <button type="button" disabled={busy} onClick={() => void reset()} className={cn(chip, "text-s-sub hover:border-danger hover:text-danger disabled:opacity-50")}>
              ↻ Холбоосыг шинэчлэх
            </button>
          </div>
        </div>
      )}
    </BracketCard>
  );
}
