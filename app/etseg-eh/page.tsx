import type { Metadata } from "next";
import { Suspense } from "react";
import { ParentReport } from "@/components/etseg-eh/ParentReport";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";

// Хувийн тайлан — хайлтын системд орохгүй
export const metadata: Metadata = { title: "Эцэг эхийн тайлан", robots: { index: false, follow: false } };

export default function ParentPage() {
  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          as="h1"
          tagline="Эцэг эхэд · Хоцрогдол · Нэмэлт даалгавар"
          title="Хүүхдийн сурлагын тайлан"
          lead="Багшаас ирсэн энэ холбоосоор хүүхдийнхээ оношлох сорилын дүн, хоцрогдлоо нөхөх төлөвлөгөө, нэмэлт даалгавартай ажиллаж буй байдлыг харна. Дүн шинэчлэгдэх бүрд энэ хуудас автоматаар шинэчлэгдэнэ."
        />
        {/* useSearchParams (?t=) — static prerender-д Suspense шаардлагатай */}
        <Suspense fallback={<p className="text-body text-s-sub">Ачаалж байна…</p>}>
          <ParentReport />
        </Suspense>
      </Container>
    </Section>
  );
}
