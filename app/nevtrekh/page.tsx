import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInPanel } from "@/components/auth/SignInPanel";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";

export const metadata: Metadata = { title: "Нэвтрэх" };

export default function NevtrekhPage() {
  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          as="h1"
          tagline="Багш · Админ"
          title="Нэвтрэх"
          lead="Багш нар сурагчдаа бүртгэж, сорилын дүнгээ харна. Сурагчид нэвтрэх шаардлагагүй — багшийнхаа өгсөн холбоосоор сорил өгнө."
        />
        {/* useSearchParams (?mode=up) — static prerender-д Suspense шаардлагатай */}
        <Suspense fallback={<p className="text-body text-s-sub">Ачаалж байна…</p>}>
          <SignInPanel />
        </Suspense>
      </Container>
    </Section>
  );
}
