import { ParallaxImage } from "@/components/effects/ParallaxImage";
import { Reveal } from "@/components/effects/Reveal";
import { Actions, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { LinkList } from "@/components/ui/Lists";
import { Heading, Lead, Tagline } from "@/components/ui/Typography";
import { PRACTICE_APP_URL } from "@/lib/site";

const LINKS = [
  { href: "/matematik#zorilt", label: "Суралцахуйн хөтөлбөр" },
  { href: "/matematik#tolovlolt", label: "Хичээлийн төлөвлөлт" },
  { href: "/matematik#shalguur", label: "Шалгуур үзүүлэлт" },
];

/** Математикийн хуудас руу хөтлөх фон зурагтай хэсэг (хуучин Layout 67) */
export function MathIntro() {
  return (
    <section data-surface="dark" className="relative overflow-hidden px-(--gutter) py-(--section-y)">
      {/* «Математик VII» сурах бичгийн хавтас (БСШУСЯ, 2019 — econtent.edu.mn) */}
      <ParallaxImage src="/assets/math/textbook-cover.jpg" />
      <div aria-hidden="true" className="absolute inset-0 bg-surface-black/55" />
      <Container className="z-[2] flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
          <Reveal>
            <Tagline>Tagline</Tagline>
          </Reveal>
          <Heading>МАТЕМАТИК</Heading>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-8">
          <Reveal>
            <Lead>Суралцахуйн зорилт</Lead>
          </Reveal>
          <Reveal>
            <LinkList items={LINKS} />
          </Reveal>
          <Reveal>
            <Actions>
              <Button href={PRACTICE_APP_URL}>Button</Button>
              <Button href="/matematik" variant="link">
                Button
              </Button>
            </Actions>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
