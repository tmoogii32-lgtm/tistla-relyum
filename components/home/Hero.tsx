import { ParallaxImage } from "@/components/effects/ParallaxImage";
import { Reveal } from "@/components/effects/Reveal";
import { Actions, Button } from "@/components/ui/Button";
import { Heading, Lead } from "@/components/ui/Typography";

/** Нүүрний том зурагтай толгой хэсэг (хуучин Header 30) */
export function Hero() {
  return (
    <section
      data-surface="dark"
      className="relative flex min-h-160 items-center justify-center overflow-hidden px-(--gutter) py-30 text-center lg:h-225 lg:items-start lg:pt-[22.875rem] lg:pb-0"
    >
      <ParallaxImage src="/assets/hero-bg.png" priority />
      <div aria-hidden="true" className="absolute inset-0 bg-surface-black/55" />
      <div className="relative z-[2] flex w-full max-w-3xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-6">
          <Heading as="h1" size="h1" center>
            Математик чадвараа сайжруулцгаая
          </Heading>
          <Reveal>
            <Lead>хоцрогдол арилгах</Lead>
          </Reveal>
        </div>
        <Reveal>
          <Actions className="justify-center gap-4">
            <Button href="/soril">Сорил өгөх</Button>
            <Button href="/onol">Онолын мэдлэг</Button>
          </Actions>
        </Reveal>
      </div>
    </section>
  );
}
