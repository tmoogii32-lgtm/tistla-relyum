import { Reveal } from "@/components/effects/Reveal";
import { BracketCard } from "@/components/ui/BracketCard";
import { StatCard } from "@/components/ui/StatCard";
import { KPIS, MODELS, POLICY_RECOMMENDATIONS, REPORT_SECTIONS } from "@/data/tuvshin";

/** Тайлангийн хэсгүүдийн наалттай цэс */
export function ReportNav() {
  return (
    <nav
      aria-label="Тайлангийн хэсгүүд"
      data-surface="dark"
      className="sticky top-(--nav-h) z-30 border-b border-s-border bg-surface-black/90 px-(--gutter) backdrop-blur"
    >
      <div className="mx-auto flex max-w-site gap-8 overflow-x-auto">
        {REPORT_SECTIONS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="shrink-0 border-b-2 border-transparent py-4 text-eyebrow font-medium tracking-eyebrow whitespace-nowrap uppercase text-s-sub transition-colors hover:border-accent hover:text-s-fg"
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function KpiGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {KPIS.map((k, i) => (
        <Reveal key={k.label} delay={i * 80} className="flex flex-col gap-3">
          <StatCard value={k.value} label={k.label} />
          <p className="text-body leading-display text-s-sub">{k.text}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function ModelCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {MODELS.map((m, i) => (
        <Reveal key={m.title} delay={i * 80}>
          <BracketCard className="flex h-full flex-col justify-between gap-4 bg-s-raised">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-accent px-2 py-1 text-eyebrow font-bold uppercase text-foreground">{m.badge}</span>
                <span className="text-eyebrow text-s-sub">{m.note}</span>
              </div>
              <h3 className="font-display text-heading leading-headline font-bold uppercase">{m.title}</h3>
              <p className="text-eyebrow font-semibold uppercase text-accent">{m.subtitle}</p>
              <p className="text-body leading-display text-s-sub">{m.desc}</p>
            </div>
            <dl className="flex flex-col gap-2 border-t border-s-border pt-4 text-body">
              {m.rows.map((r) => (
                <div key={r.k} className="flex justify-between gap-4">
                  <dt className="text-s-sub">{r.k}:</dt>
                  <dd className={r.strong ? "text-right font-bold" : "text-right"}>{r.v}</dd>
                </div>
              ))}
            </dl>
          </BracketCard>
        </Reveal>
      ))}
    </div>
  );
}

/** Графикийн дүгнэлт */
export function ImpactInsights() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2 border-l-4 border-ok bg-s-raised p-5">
        <h4 className="font-display text-label font-bold uppercase">Хамгийн Үр Дүнтэй Аргууд</h4>
        <p className="text-body leading-display text-s-sub">
          <strong className="text-s-fg">Шууд эргэх холбоо (Feedback d=0.73)</strong> ба{" "}
          <strong className="text-s-fg">Ганцаарчилсан / Бага бүлгийн сургалт (Tutoring d=0.70)</strong> нь хоцрогдлыг нөхөх хамгийн
          өндөр хурдтай байна. Багш явцын оношилгоо хийж, сурагчийн тодорхой алдаанд тохирсон зааварчилгаа өгөх нь хамгийн чухал.
        </p>
      </div>
      <div className="flex flex-col gap-2 border-l-4 border-danger bg-s-raised p-5">
        <h4 className="font-display text-label font-bold uppercase">Үр Дүнгүй / Сөрөг Арга Нөлөө</h4>
        <p className="text-body leading-display text-s-sub">
          <strong className="text-s-fg">Анги улируулан суралцуулах (Grade Retention d=0.00)</strong> нь хоцрогдлыг нөхдөггүй бөгөөд
          сурагчийн сэтгэл зүйд сөрөг нөлөө үзүүлж, сургууль завсардахад хүргэдэг. Түүнчлэн зорилтот чиглүүлэггүйгээр хичээлийн цагийг
          зүгээр уртасгах нь зардал өндөртэй ч үр дүн муутай байна.
        </p>
      </div>
    </div>
  );
}

export function PolicyRecommendations() {
  return (
    <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {POLICY_RECOMMENDATIONS.map((p, i) => (
        <Reveal as="li" key={p.title} delay={i * 80}>
          <BracketCard className="flex h-full flex-col gap-3">
            <span className="grid size-10 place-items-center bg-accent font-display text-title font-bold text-foreground">{i + 1}</span>
            <h4 className="font-display text-title leading-headline font-bold uppercase">{p.title}</h4>
            <p className="text-body leading-display text-s-sub">{p.text}</p>
          </BracketCard>
        </Reveal>
      ))}
    </ol>
  );
}
