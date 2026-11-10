import type { Metadata } from "next";
import { Suspense } from "react";
import { StudentExam } from "@/components/soril/StudentExam";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";

export const metadata: Metadata = { title: "Оношлох сорил өгөх" };

export default function SorilPage() {
  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          as="h1"
          tagline="Сурагчдад · Онош · Мэдлэг × Блум"
          title="Оношлох сорил"
          lead="Нэр, ангиа бичээд багшийнхаа өгсөн кодоор сорил өг. Нэвтрэх шаардлагагүй. Дуусмагц онош, хоцрогдлоо нөхөх төлөвлөгөө гарч, дүн чинь багшид очно."
        />
        {/* useSearchParams (?code=) — static prerender-д Suspense шаардлагатай */}
        <Suspense fallback={<p className="text-body text-s-sub">Ачаалж байна…</p>}>
          <StudentExam />
        </Suspense>
      </Container>
    </Section>
  );
}
