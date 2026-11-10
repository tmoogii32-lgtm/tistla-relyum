import type { Metadata } from "next";
import { Workspace } from "@/components/daalgavar/Workspace";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";

export const metadata: Metadata = { title: "Даалгавартай ажиллах" };

export default function DaalgavarPage() {
  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          as="h1"
          tagline="7-р анги · Математик · R1–R4"
          title="Даалгавартай ажиллах"
          lead="Сэдвээ сонгоод R1 түвшнээс эхэлнэ. Түвшин бүр 3 даалгавартай, даалгавар бүр 5 бодлоготой. 4 ба түүнээс дээш зөв бодвол даалгавар тэнцэж, 3 даалгавраа давбал дараагийн түвшин нээгдэнэ."
        />
        <Workspace />
      </Container>
    </Section>
  );
}
