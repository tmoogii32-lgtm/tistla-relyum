import { Fragment } from "react";
import { cn } from "@/lib/cn";

/** [[a/b]] тэмдэглэгээг босоо бутархай болгон харуулна; бусад нь энгийн текст. */
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\[\[[^\]]+\/[^\]]+\]\])/g);
  return (
    <span className={cn("leading-loose", className)}>
      {parts.map((p, i) => {
        const m = p.match(/^\[\[([^\]/]+)\/([^\]]+)\]\]$/);
        if (!m) return <Fragment key={i}>{p}</Fragment>;
        return (
          <span key={i} className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.9em] leading-tight" role="math" aria-label={`${m[1]}/${m[2]}`}>
            <span className="px-0.5">{m[1]}</span>
            <span aria-hidden="true" className="h-px w-full bg-current" />
            <span className="px-0.5">{m[2]}</span>
          </span>
        );
      })}
    </span>
  );
}
