import Image from "next/image";
import { Reveal } from "@/components/effects/Reveal";
import { BlogItem } from "@/components/ui/BlogItem";
import { BracketCard } from "@/components/ui/BracketCard";
import { Button } from "@/components/ui/Button";
import { Plate } from "@/components/ui/Plate";
import { Container, Section } from "@/components/ui/Section";
import { ARTICLES, RESOURCE_CATEGORIES } from "@/data/interaktiv";
import { PRACTICE_APP_URL } from "@/lib/site";

/** Онцлох: web3 бодлогын апп руу том карт */
export function FeatureCard() {
  return (
    <a href={PRACTICE_APP_URL} target="_blank" rel="noopener" className="group grid items-center gap-8 md:grid-cols-2">
      <Plate fit="contain" className="aspect-[4/3] w-full" fillClassName="bg-surface-dark">
        <Image src="/assets/math/algebra.svg" alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-contain p-6" />
      </Plate>
      <BracketCard className="flex flex-col items-start gap-4 p-8">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">Онцлох</p>
        <h2 className="font-display text-heading leading-headline font-bold uppercase transition-colors group-hover:text-accent">
          Математик 7 — Хоцрогдлоо нөхье!
        </h2>
        <p className="text-body leading-display text-s-sub">
          Сэдвээ сонгоод 5 бодлого бодоорой. Бодлого бүрийн дараа хэрхэн бодохыг алхам алхмаар тайлбарлана. Сэдэв бүр 🌱 Суурь →
          🌿 Дунд → 🌳 Ахисан → 🏆 Гүнзгий гэсэн 4 түвшинтэй.
        </p>
        <Button as="span">Даалгавар эхлэх</Button>
      </BracketCard>
    </a>
  );
}

/** Нийтлэл, материал */
export function ResourcesSection() {
  return (
    <Section id="resources" surface="muted">
      <Container className="grid gap-12 lg:grid-cols-[12.5rem_minmax(0,1fr)]">
        <Reveal as="aside">
          <BracketCard className="flex flex-col gap-4">
            <h2 className="text-eyebrow font-medium tracking-eyebrow uppercase">Blog categories</h2>
            <ul className="flex flex-col gap-3 text-label uppercase">
              {RESOURCE_CATEGORIES.map((c) => (
                <li key={c}>
                  <a href="#" className="transition-colors hover:text-accent">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </BracketCard>
        </Reveal>
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {ARTICLES.map((a, i) => (
            <Reveal key={i} delay={(i % 3) * 60}>
              <BlogItem image="/assets/mega-article.png" title={a.title} text={a.text} cta={{ label: "Read more", href: "#" }} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
