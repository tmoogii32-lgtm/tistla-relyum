import { ParallaxImage } from "@/components/effects/ParallaxImage";
import { Reveal } from "@/components/effects/Reveal";
import { Actions, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Heading, Lead, Tagline } from "@/components/ui/Typography";
import { PRACTICE_APP_URL } from "@/lib/site";

export function MathHero() {
  return (
    <section data-surface="dark" className="relative overflow-hidden px-(--gutter) pt-40 pb-32">
      <ParallaxImage src="/assets/course-3.png" priority />
      <div aria-hidden="true" className="absolute inset-0 bg-surface-black/70" />
      <Container className="z-[2] flex flex-col items-start gap-6">
        <Reveal>
          <Tagline>Суурь боловсрол · 7-р анги</Tagline>
        </Reveal>
        <Heading as="h1" size="h1">
          Математик 7
        </Heading>
        <Reveal>
          <Lead className="max-w-xl">
            7-р ангийн математикийн хичээлийн суралцахуйн зорилт, сурах бичиг, үнэлгээний шалгуурыг нэг дороос. Тоо
            тоолол, алгебр, геометр, статистик ба магадлал гэсэн 4 хүрээтэй.
          </Lead>
        </Reveal>
        <Reveal>
          <Actions className="mt-2 gap-4">
            <Button href={PRACTICE_APP_URL}>Бодлого бодох</Button>
            <Button href="#surah-bichig">Сурах бичиг</Button>
          </Actions>
        </Reveal>
      </Container>
    </section>
  );
}

const SECTIONS = [
  { href: "#zorilt", label: "Суралцахуйн зорилт" },
  { href: "#surah-bichig", label: "Сурах бичиг" },
  { href: "#tolovlolt", label: "Хичээлийн төлөвлөлт" },
  { href: "#shalguur", label: "Үнэлгээний шалгуур" },
];

/** Хуудасны хэсгүүдийн наалттай цэс (навбарын доор) */
export function SubNav() {
  return (
    <nav
      aria-label="Хуудасны хэсгүүд"
      data-surface="dark"
      className="sticky top-(--nav-h) z-30 border-b border-s-border bg-surface-black/90 px-(--gutter) backdrop-blur"
    >
      <div className="mx-auto flex max-w-site gap-8 overflow-x-auto">
        {SECTIONS.map((s) => (
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
