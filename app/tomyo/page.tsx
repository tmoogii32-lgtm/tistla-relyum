import type { Metadata } from "next";
import { FormulaBank } from "@/components/tomyo/FormulaBank";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { FORMULA_CATEGORIES, FORMULAS } from "@/data/tomyo";

export const metadata: Metadata = {
  title: "Томьёоны сан",
  description: "7-р ангийн математикийн томьёо — үгээр тайлбар, бодсон жишээ, түгээмэл алдаатай.",
};

export default function TomyoPage() {
  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container className="flex flex-col gap-10">
        <SectionTitle
          as="h1"
          tagline={`7-р анги · ${FORMULA_CATEGORIES.length} ангилал · ${FORMULAS.length} томьёо`}
          title="Томьёоны сан"
          lead="Томьёо бүр үгээр тайлбартай, бодсон жишээтэй, түгээмэл алдаатай. ☆ дарж хэрэгтэй томьёогоо хадгал. 🧠 Цээжлэх горимд томьёо нуугдана — өөрөө санаж бичээд шалга. 📄 Зөвхөн томьёо — шалгалтын өмнө нэг харах, 🖨 Хэвлэх — цаасан хураангуй."
        />
        <FormulaBank />
      </Container>
    </Section>
  );
}
