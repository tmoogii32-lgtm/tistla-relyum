import type { Metadata } from "next";
import Link from "next/link";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { THEORY, THEORY_TOPICS, topicSlug } from "@/data/onol";

export const metadata: Metadata = {
  title: "Онолын мэдлэг",
  description: "7-р ангийн математикийн онол — 10 бүлэг, сэдэв бүрт дүрэм, томьёо, бодолттой жишээ.",
};

/** Онолын мэдлэг — бүлэг, сэдвийн жагсаалт */
export default function OnolPage() {
  return (
    <>
      <Section tight className="pt-[calc(var(--section-y)*0.75)]">
        <Container className="flex flex-col gap-8">
          <SectionTitle
            as="h1"
            tagline={`7-р анги · ${THEORY.length} бүлэг · ${THEORY_TOPICS.length} сэдэв`}
            title="Онолын мэдлэг"
            lead="Сэдэв бүрт гол дүрэм, томьёо, алхам алхмаар бодсон жишээ бий. Уншаад тухайн сэдвээр даалгавар бодож, эсвэл оношлох сорил өгч мэдлэгээ шалгаарай."
          />
          <Actions>
            <Button href="/soril">Оношлох сорил өгөх</Button>
            <Button href="/daalgavar#ajillah" variant="link">
              Даалгавар бодох
            </Button>
          </Actions>
          {/* Бүлэг рүү үсрэх */}
          <nav aria-label="Бүлгүүд" className="flex flex-wrap gap-2">
            {THEORY.map((c) => (
              <a
                key={c.n}
                href={`#bulag-${c.n}`}
                className="border border-s-border px-3 py-2 text-eyebrow font-semibold uppercase transition-colors hover:border-accent hover:text-accent"
              >
                {c.roman}. {c.title}
              </a>
            ))}
          </nav>
        </Container>
      </Section>

      <Section tight>
        <Container className="flex flex-col gap-14">
          {THEORY.map((c) => (
            <section key={c.n} id={`bulag-${c.n}`} aria-labelledby={`bulag-${c.n}-h`} className="flex scroll-mt-24 flex-col gap-5">
              <h2
                id={`bulag-${c.n}-h`}
                className="flex flex-wrap items-baseline gap-x-3 font-display text-heading leading-headline font-bold uppercase"
              >
                <span className="text-accent">{c.roman} бүлэг</span>
                <span>{c.title}</span>
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {c.topics.map((t) => (
                  <li key={t.id}>
                    <Link href={`/onol/${topicSlug(t.id)}`} className="group block h-full">
                      <BracketCard className="flex h-full flex-col gap-2 bg-s-raised p-5 transition-colors group-hover:bg-accent-muted">
                        <span className="font-display text-title font-bold text-accent">{t.id}</span>
                        <span className="text-label leading-display font-medium">{t.title}</span>
                        <span className="mt-auto pt-2 text-eyebrow font-semibold uppercase text-s-sub group-hover:text-s-fg">Унших →</span>
                      </BracketCard>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Container>
      </Section>
    </>
  );
}
