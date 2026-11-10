import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";

export const metadata: Metadata = { title: "Админ", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          as="h1"
          tagline="Админ · Бүх багш, сурагч"
          title="Үр дүнгийн судалгаа"
          lead="Сурагчдын оношлох сорилын нэгдсэн үр дүнг графикаар судалж, сурагч, дүн, сорилын хариултыг засаж хадгална."
        />
        <AdminPanel />
      </Container>
    </Section>
  );
}
