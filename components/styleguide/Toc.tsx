"use client";

import { useEffect, useState } from "react";
import { SG_SECTIONS } from "@/data/styleguide";
import { cn } from "@/lib/cn";

/** Зүүн талын дугаартай агуулга — гүйлгэх үед идэвхтэй хэсгийг тодруулна */
export function Toc() {
  const [active, setActive] = useState<string>(SG_SECTIONS[0].id);

  useEffect(() => {
    const els = SG_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="Styleguide агуулга" className="flex flex-col gap-0.5">
      {SG_SECTIONS.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? "true" : undefined}
          className={cn(
            "flex items-baseline gap-3 py-1.5 text-body transition-colors hover:text-accent",
            active === s.id ? "font-medium text-s-fg" : "text-s-sub",
          )}
        >
          <span className={cn("tabular w-5 text-eyebrow", active === s.id && "text-accent")}>{String(i + 1).padStart(2, "0")}</span>
          {s.title}
        </a>
      ))}
    </nav>
  );
}
