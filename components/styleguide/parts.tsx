import type { ReactNode } from "react";
import { SG_SECTIONS } from "@/data/styleguide";
import { cn } from "@/lib/cn";

/** Дугаартай хэсэг: "03  Өнгө" + доогуур шугам */
export function SgSection({ id, lead, children }: { id: (typeof SG_SECTIONS)[number]["id"]; lead?: ReactNode; children: ReactNode }) {
  const i = SG_SECTIONS.findIndex((s) => s.id === id);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col gap-8 pt-20 first:pt-0">
      <div className="flex flex-col gap-3 border-b border-s-border pb-4">
        <h2 id={`${id}-title`} className="flex items-baseline gap-3">
          <span className="tabular text-eyebrow text-s-sub">{String(i + 1).padStart(2, "0")}</span>
          <span className="font-display text-heading leading-headline font-bold uppercase">{SG_SECTIONS[i].title}</span>
        </h2>
        {lead && <p className="max-w-3xl text-body leading-display text-s-sub">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

/** Дэд гарчиг: "Түвшин 2 · role" */
export function SgSub({ title, code, children }: { title: string; code?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-label font-medium">
        {title}
        {code && <code className="ml-2 text-eyebrow text-s-sub">· {code}</code>}
      </h3>
      {children && <p className="max-w-3xl text-body leading-display text-s-sub">{children}</p>}
    </div>
  );
}

/** Жишээ компонентын карт: харагдац + нэр + тайлбар + файл */
export function Specimen({
  name,
  file,
  children,
  note,
  dark,
  className,
}: {
  name: string;
  file?: string;
  note?: ReactNode;
  dark?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("flex flex-col border border-s-border", className)}>
      <div data-surface={dark ? "dark" : "light"} className="flex min-h-32 flex-wrap items-center gap-6 p-6">
        {children}
      </div>
      <figcaption className="flex flex-col gap-1 border-t border-s-border bg-s-raised px-4 py-3">
        <code className="text-eyebrow font-bold">{name}</code>
        {note && <span className="text-eyebrow leading-display text-s-sub">{note}</span>}
        {file && <code className="text-eyebrow text-s-faint">{file}</code>}
      </figcaption>
    </figure>
  );
}

/** Token мөр: нэр · утга · хэрэглээ */
export function TokenRow({ token, value, usage, children }: { token: string; value?: ReactNode; usage: string; children?: ReactNode }) {
  return (
    <div className="grid items-center gap-x-6 gap-y-2 border-b border-s-border py-4 md:grid-cols-[14rem_8rem_minmax(0,1fr)]">
      <code className="text-eyebrow font-bold">{token}</code>
      <span className="text-eyebrow text-s-sub">{value}</span>
      <div className="flex flex-col gap-2">
        {children}
        <span className="text-eyebrow text-s-sub">{usage}</span>
      </div>
    </div>
  );
}
