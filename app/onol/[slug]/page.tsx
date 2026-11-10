import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MathText } from "@/components/daalgavar/MathText";
import { PracticeButton } from "@/components/onol/PracticeButton";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { THEORY_TOPICS, topicBySlug, topicSlug } from "@/data/onol";
import { topicById } from "@/lib/problems";

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
              <BracketCard accent className="flex flex-col gap-3 bg-s-raised p-6">
                {t.formulas.map((f) => (
                  <p key={f} className="text-center text-lead font-medium">
                    <MathText text={f} />
                  </p>
                ))}
              </BracketCard>
            </section>
          )}

          {t.example && (
            <section aria-labelledby="jishee" className="flex flex-col gap-4">
              <h2 id="jishee" className={h3}>
                Бодолттой жишээ
              </h2>
              <BracketCard className="flex flex-col gap-4 bg-s-bg p-6">
                <p className="text-lead leading-display font-medium">
                  <MathText text={t.example.q} />
                </p>
                <ol className="flex flex-col gap-2">
                  {t.example.steps.map((s, si) => (
                    <li key={s} className="flex gap-3 text-body leading-display">
                      <span className="grid size-6 shrink-0 place-items-center bg-accent-muted text-eyebrow font-bold">{si + 1}</span>
                      <MathText text={s} />
                    </li>
                  ))}
                </ol>
                <p className="border-t border-s-border pt-3 text-lead">
                  <span className="text-eyebrow font-bold uppercase text-ok">Хариу: </span>
                  <MathText text={t.example.a} />
                </p>
              </BracketCard>
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
