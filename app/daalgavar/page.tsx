import type { Metadata } from "next";
import { Hub } from "@/components/daalgavar/Hub";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";

export const metadata: Metadata = { title: "Даалгавартай ажиллах" };

export default function DaalgavarPage() {
  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          as="h1"
          tagline="7-р анги · Математик · Онош → Т1–Т4 → Бүртгэл"
          title="Даалгавартай ажиллах"
          lead="Оношлох сорилоор хоцрогдлоо тодорхойлж, зөвлөсөн сэдвээр түвшинчилсэн даалгавар бод. Бүх дүн автоматаар бүртгэгдэнэ."
        />
        <Hub />
      </Container>
    </Section>
  );
}
