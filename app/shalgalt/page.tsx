import type { Metadata } from "next";
import { BloomMatrix, DiagnosisLevels, DiagnosisSteps, ExamEmbed, FactList } from "@/components/shalgalt/Exam";
import { Reveal } from "@/components/effects/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";

export const metadata: Metadata = { title: "Шалгалт өгөх" };

export default function ShalgaltPage() {
  return (
    <>
      <Section surface="dark">
        <Container className="flex flex-col gap-12">
          <SectionTitle
            as="h1"
            tagline="Оношлох сорил · 7-р анги · Математик"
            title="Шалгалт өгөх"
            lead="Сурлагын хоцрогдлыг мэдлэгийн 4 төрөл ба Блумын матрицын аргачлалаар оношлох сорил. Сорил бүр мэдлэгийн аль төрөл, сэтгэхүйн аль түвшинд хоцрогдол байгааг тодорхойлно."
          />
          <FactList />
        </Container>
      </Section>

      <Section id="soril" tight>
        <Container>
          <Reveal>
            <ExamEmbed />
          </Reveal>
        </Container>
      </Section>

      <Section id="matrix" tight>
        <Container className="flex flex-col gap-10">
          <SectionTitle
            tagline="Аргачлал"
            title="Мэдлэг × Блумын матриц"
            lead="Даалгавар бүр мэдлэгийн нэг төрөл ба Блумын нэг түвшинд хамаарна. Нүдэнд тухайн даалгаврын дугаар бичигдсэн."
          />
          <Reveal>
            <BloomMatrix />
          </Reveal>
        </Container>
      </Section>

      <Section id="onosh" surface="muted">
        <Container className="flex flex-col gap-10">
          <SectionTitle tagline="Дүгнэлт" title="Оношийг хэрхэн гаргах вэ?" />
          <DiagnosisLevels />
          <DiagnosisSteps />
        </Container>
      </Section>
    </>
  );
}
