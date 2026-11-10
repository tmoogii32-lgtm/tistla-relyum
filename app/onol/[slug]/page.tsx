import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MathText } from "@/components/daalgavar/MathText";
import { PracticeButton } from "@/components/onol/PracticeButton";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { THEORY_TOPICS, topicBySlug, topicSlug, type TheoryExample } from "@/data/onol";
import { THEORY_DETAIL } from "@/data/onol-detail";
import { formulasForTopic } from "@/data/tomyo";
import { topicById } from "@/lib/problems";

/** Дэд хэсгийн үсэг: А, Б, В, Г, … */
const LETTERS = ["А", "Б", "В", "Г", "Д", "Е"];

/** Бодолттой жишээ: асуулт → алхмууд → хариу */
function ExampleCard({ ex, label }: { ex: TheoryExample; label?: string }) {
  return (
    <BracketCard className="flex flex-col gap-4 bg-s-bg p-5 sm:p-6">
      {label && <p className="text-eyebrow font-bold uppercase text-accent">{label}</p>}
      <p className="text-lead leading-display font-medium">
        <MathText text={ex.q} />
      </p>
      <ol className="flex flex-col gap-2">
        {ex.steps.map((s, si) => (
          <li key={s} className="flex gap-3 text-body leading-display">
            <span className="grid size-6 shrink-0 place-items-center bg-accent-muted text-eyebrow font-bold">{si + 1}</span>
            <MathText text={s} />
          </li>
        ))}
      </ol>
      <p className="border-t border-s-border pt-3 text-lead">
        <span className="text-eyebrow font-bold uppercase text-ok">Хариу: </span>
        <MathText text={ex.a} />
      </p>
    </BracketCard>
  );
}

function FormulaBox({ formulas }: { formulas: string[] }) {
  return (
    <BracketCard accent className="flex flex-col gap-3 bg-s-raised p-6">
      {formulas.map((f) => (
        <p key={f} className="text-center text-lead font-medium">
          <MathText text={f} />
        </p>
      ))}
    </BracketCard>
  );
}

export function generateStaticParams() {
  return THEORY_TOPICS.map((t) => ({ slug: topicSlug(t.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = topicBySlug((await params).slug);
  return t ? { title: `${t.id}. ${t.title} — Онол` } : {};
}

const h3 = "font-display text-title leading-headline font-bold uppercase";

/** Нэг сэдвийн онол: гол ойлголт → томьёо → жишээ → дадлага */
export default async function OnolTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = topicBySlug((await params).slug);
  if (!t) notFound();

  const i = THEORY_TOPICS.findIndex((x) => x.id === t.id);
  const prev = THEORY_TOPICS[i - 1];
  const next = THEORY_TOPICS[i + 1];
  const practice = t.practice ? topicById(t.practice) : null;
  const formulas = formulasForTopic(t.id);
  const detail = THEORY_DETAIL[t.id];
  const sections = detail?.sections ?? [];
  // Хэсэг рүү үсрэх цэс
  const toc = [
    ...sections.map((s, si) => ({ id: `heseg-${si + 1}`, label: `${LETTERS[si]}. ${s.title}` })),
    ...(detail?.mistakes?.length ? [{ id: "aldaa", label: "Түгээмэл алдаа" }] : []),
    ...(detail?.advanced?.length ? [{ id: "ahisan", label: "Ахисан түвшин" }] : []),
  ];

  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container>
        <div className="flex max-w-4xl flex-col gap-10">
          <nav aria-label="Замнал" className="text-eyebrow uppercase text-s-sub">
            <Link href="/onol" className="hover:text-accent">
              Онолын мэдлэг
            </Link>{" "}
            /{" "}
            <Link href={`/onol#bulag-${t.chapter.n}`} className="hover:text-accent">
              {t.chapter.roman} бүлэг · {t.chapter.title}
            </Link>
          </nav>

          <SectionTitle as="h1" tagline={`${t.id} · 7-р анги`} title={t.title} />

          {detail?.intro && (
            <p className="border-l-4 border-accent bg-s-raised px-5 py-4 text-lead leading-display">
              <MathText text={detail.intro} />
            </p>
          )}

          {toc.length > 0 && (
            <nav aria-label="Энэ сэдвийн хэсгүүд" className="flex flex-wrap gap-2">
              {toc.map((x) => (
                <a
                  key={x.id}
                  href={`#${x.id}`}
                  className="border border-s-border px-3 py-2 text-eyebrow font-semibold uppercase transition-colors hover:border-accent hover:text-accent"
                >
                  {x.label}
                </a>
              ))}
            </nav>
          )}

          <section aria-labelledby="gol" className="flex flex-col gap-4">
            <h2 id="gol" className={h3}>
              Гол ойлголт
            </h2>
            <ul className="flex flex-col gap-3">
              {t.points.map((p) => (
                <li key={p} className="flex gap-3 text-lead leading-display">
                  <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 bg-accent" />
                  <MathText text={p} />
                </li>
              ))}
            </ul>
          </section>

          {t.formulas && t.formulas.length > 0 && (
            <section aria-labelledby="tomyo" className="flex flex-col gap-4">
              <h2 id="tomyo" className={h3}>
                Томьёо
              </h2>
              <FormulaBox formulas={t.formulas} />
            </section>
          )}

          {/* Дэлгэрэнгүй дэд хэсгүүд (А, Б, В…) */}
          {sections.map((s, si) => (
            <section key={s.title} id={`heseg-${si + 1}`} aria-labelledby={`heseg-${si + 1}-h`} className="flex scroll-mt-24 flex-col gap-4 border-t border-s-border pt-8">
              <h2 id={`heseg-${si + 1}-h`} className={`${h3} flex items-baseline gap-3`}>
                <span className="grid size-9 shrink-0 place-items-center bg-accent text-title text-foreground">{LETTERS[si]}</span>
                {s.title}
              </h2>
              {s.text && (
                <ul className="flex flex-col gap-3">
                  {s.text.map((p) => (
                    <li key={p} className="flex gap-3 text-body leading-display sm:text-lead">
                      <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 bg-accent" />
                      <MathText text={p} />
                    </li>
                  ))}
                </ul>
              )}
              {s.formulas && s.formulas.length > 0 && <FormulaBox formulas={s.formulas} />}
              {s.examples && s.examples.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {s.examples.map((ex, ei) => (
                    <ExampleCard key={ex.q} ex={ex} label={`Жишээ ${LETTERS[si]}${ei + 1}`} />
                  ))}
                </div>
              )}
            </section>
          ))}

          {t.example && (
            <section aria-labelledby="jishee" className="flex flex-col gap-4">
              <h2 id="jishee" className={h3}>
                {detail ? "Нэгтгэсэн жишээ" : "Бодолттой жишээ"}
              </h2>
              <ExampleCard ex={t.example} />
            </section>
          )}

          {detail?.mistakes && detail.mistakes.length > 0 && (
            <section id="aldaa" aria-labelledby="aldaa-h" className="flex scroll-mt-24 flex-col gap-4">
              <h2 id="aldaa-h" className={h3}>
                Түгээмэл алдаа
              </h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {detail.mistakes.map((m) => (
                  <li key={m.wrong} className="flex flex-col gap-2 border border-s-border bg-s-bg p-4">
                    <p className="flex gap-2 text-body">
                      <span className="font-bold text-danger" aria-label="Буруу">
                        ✗
                      </span>
                      <span className="text-s-sub line-through decoration-danger">
                        <MathText text={m.wrong} />
                      </span>
                    </p>
                    <p className="flex gap-2 text-body font-medium">
                      <span className="font-bold text-ok" aria-label="Зөв">
                        ✓
                      </span>
                      <MathText text={m.right} />
                    </p>
                    <p className="border-t border-s-border pt-2 text-body leading-display text-s-sub">
                      <MathText text={m.why} />
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {detail?.advanced && detail.advanced.length > 0 && (
            <section id="ahisan" aria-labelledby="ahisan-h" className="flex scroll-mt-24 flex-col gap-4">
              <h2 id="ahisan-h" className={`${h3} flex flex-wrap items-baseline gap-3`}>
                Ахисан түвшин
                <span className="bg-warn/20 px-2 py-0.5 text-eyebrow font-bold normal-case">Сонирхогчдод</span>
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {detail.advanced.map((ex, ai) => (
                  <ExampleCard key={ex.q} ex={ex} label={`Ахисан ${ai + 1}`} />
                ))}
              </div>
            </section>
          )}

          <BracketCard accent className="flex flex-col gap-4 bg-s-raised p-6">
            <p className="text-body leading-display">
              {practice
                ? `Ойлгосноо бататгахын тулд «${practice.index}. ${practice.title}» сэдвээр түвшинчилсэн даалгавар бод, эсвэл оношлох сорил өгч хоцрогдлоо шалга.`
                : "Ойлгосноо шалгахын тулд оношлох сорил өг эсвэл түвшинчилсэн даалгавар бод."}
            </p>
            <Actions>
              {practice ? (
                <PracticeButton topicId={practice.id} label="Энэ сэдвээр даалгавар бодох" />
              ) : (
                <Button href="/daalgavar#ajillah">Даалгавар бодох</Button>
              )}
              <Button href="/soril" variant="link">
                Оношлох сорил өгөх
              </Button>
            </Actions>
          </BracketCard>

          {formulas.length > 0 && (
            <section aria-labelledby="tomyonuud" className="flex flex-col gap-3">
              <h2 id="tomyonuud" className={h3}>
                Томьёоны сангаас
              </h2>
              <ul className="flex flex-wrap gap-2">
                {formulas.map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/tomyo#${f.id}`}
                      className="inline-block border border-s-border px-3 py-2 text-body transition-colors hover:border-accent hover:text-accent"
                    >
                      {f.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav aria-label="Сэдвүүд" className="grid gap-3 border-t border-s-border pt-6 sm:grid-cols-2">
            {prev ? (
              <Link href={`/onol/${topicSlug(prev.id)}`} className="group flex flex-col gap-1">
                <span className="text-eyebrow uppercase text-s-sub">← Өмнөх</span>
                <span className="font-medium group-hover:text-accent">
                  {prev.id}. {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/onol/${topicSlug(next.id)}`} className="group flex flex-col gap-1 sm:items-end sm:text-right">
                <span className="text-eyebrow uppercase text-s-sub">Дараах →</span>
                <span className="font-medium group-hover:text-accent">
                  {next.id}. {next.title}
                </span>
              </Link>
            )}
          </nav>
        </div>
      </Container>
    </Section>
  );
}
