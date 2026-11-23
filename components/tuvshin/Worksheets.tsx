"use client";

import { useState } from "react";
import { WORKSHEET_FOLDERS } from "@/data/tuvshin";
import { cn } from "@/lib/cn";

/**
 * Ялгаатай даалгаврын ажлын хуудсууд: хавтсаа сонгоход Google Drive хавтасны
 * агуулга хуудсан дотроо (iframe) гарна. Хавтас "Anyone with the link" эрхтэй байх ёстой.
 */
export function Worksheets() {
  const [active, setActive] = useState(0);
  const folder = WORKSHEET_FOLDERS[active];

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Ажлын хуудасны хавтас" className="flex flex-wrap gap-2">
        {WORKSHEET_FOLDERS.map((f, i) => {
          const on = i === active;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              id={`ws-tab-${i}`}
              aria-selected={on}
              aria-controls="ws-panel"
              onClick={() => setActive(i)}
              className={cn(
                "cursor-pointer border px-4 py-2 font-display text-label font-bold transition-colors",
                on ? "border-accent bg-accent text-foreground" : "border-s-border hover:border-accent",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div id="ws-panel" role="tabpanel" aria-labelledby={`ws-tab-${active}`} className="border border-s-border bg-white">
        <iframe
          key={folder.id}
          src={`https://drive.google.com/embeddedfolderview?id=${folder.id}#grid`}
          title={`${folder.label} — ажлын хуудсууд`}
          loading="lazy"
          className="block h-[36rem] w-full max-sm:h-[28rem]"
        />
      </div>
    </div>
  );
}
