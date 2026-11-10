import type { Metadata } from "next";
import { Reveal } from "@/components/effects/Reveal";
import { CriteriaGrid, CtaBanner, LevelList } from "@/components/matematik/Assessment";
import { MathHero, SubNav } from "@/components/matematik/MathHero";
import { Planning } from "@/components/matematik/Planning";
import { StrandCard } from "@/components/matematik/StrandCard";
import { Textbook } from "@/components/matematik/Textbook";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { STRANDS } from "@/data/math";

export const metadata: Metadata = { title: "Математик 7" };

export default function MatematikPage() {
  return (
    <>
      <MathHero />
      <SubNav />

      {/* 1. Суралцахуйн зорилт */}
      <Section id="zorilt">
        <Container className="flex flex-col gap-16">
          <SectionTitle
            center
            tagline="01"
            title="Суралцахуйн зорилт"
            lead="7-р ангийн төгсгөлд сурагч дараах мэдлэг, чадварыг эзэмшсэн байна."
          />
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
            {STRANDS.map((s, i) => (
              <Reveal key={s.id} delay={(i % 2) * 80}>
                <StrandCard strand={s} index={i} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* 2. Сурах бичиг */}
      <Textbook />

      {/* 3. Хичээлийн төлөвлөлт */}
      <Section id="tolovlolt">
        <Container className="flex flex-col gap-16">
          <SectionTitle
            center
            tagline="03"
            title="Хичээлийн төлөвлөлт"
            lead="4 нэгжийн дараалал, ээлжит хичээлийн бүтэц ба хоцрогдол арилгах мөчлөгийг төлөвлөлтдөө ашиглах загвар."
          />
          <Planning />
        </Container>
      </Section>

      {/* 4. Үнэлгээний шалгуур */}
      <Section id="shalguur" surface="muted">
        <Container className="flex flex-col gap-16">
          <SectionTitle
            center
            tagline="04"
            title="Үнэлгээний шалгуур"
            lead="Сэдэв бүрийг 4 түвшнээр үнэлнэ. Түвшин бүрт 5 бодлого бодож, 4 ба түүнээс дээш зөв бодвол дараагийн түвшин рүү шилжинэ."
          />
          <LevelList />
          <CriteriaGrid />
          <CtaBanner />
        </Container>
      </Section>
    </>
  );
}
