import type { Metadata } from "next";
import { Reveal } from "@/components/effects/Reveal";
import { ImpactChart } from "@/components/tuvshin/ImpactChart";
import { RapidExplorer } from "@/components/tuvshin/RapidExplorer";
import { ImpactInsights, KpiGrid, ModelCards, PolicyRecommendations, ReportNav } from "@/components/tuvshin/Report";
import { Simulator } from "@/components/tuvshin/Simulator";
import { Container, Section } from "@/components/ui/Section";
import { Lead, SectionTitle } from "@/components/ui/Typography";

export const metadata: Metadata = {
  title: "Түвшин — Харьцуулсан судалгаа",
  description: "Сургалтын хоцрогдол ба ялгаатай даалгавар боловсруулах олон улсын харьцуулсан судалгаа (2020–2025).",
};

export default function TuvshinPage() {
  return (
    <>
      <Section id="kpi" surface="dark">
        <Container className="flex flex-col gap-12">
          <SectionTitle
            as="h1"
            tagline="Олон Улсын Мета-Шинжилгээ ба Бодлогын Харьцуулалт · 2020–2025"
            title="Сургалтын Хоцрогдлыг Арилгах ба Ялгаатай Даалгавар Боловсруулах Стратегиуд"
            lead="Сүүлийн 5 жилийн (2020–2025) дэлхийн боловсролын салбарын судалгаануудын нэгдсэн дүн: Цар тахлын дараах хичээлийн хоцрогдлыг нөхөх хамгийн үр дүнтэй арга зам нь суралцагчийн түвшинд тохируулсан ялгаатай сургалт болон уян хатан заах арга зүй болох нь нотлогдлоо."
          />
          <Reveal>
            <p className="max-w-3xl border border-s-border bg-s-raised p-4 text-body leading-display text-s-sub">
              <strong className="text-s-fg">Интерактив тайлангийн тухай:</strong> Энэхүү аппликейшн нь ЮНЕСКО, Дэлхийн Банк, J-PAL болон
              EEF-ийн судалгааны өгөгдлийг нэгтгэн, хичээлийн хоцрогдол арилгах арга зүй, ялгаатай даалгаврын үр ашгийг интерактив хэлбэрээр
              шинжлэх боломжийг олгоно.
            </p>
          </Reveal>
          <KpiGrid />
        </Container>
      </Section>

      <ReportNav />

      <Section id="rapid">
        <Container className="flex flex-col gap-12">
          <SectionTitle
            tagline="Бодлогын Хүрээ"
            title="Олон Улсын RAPID Бодлогын Загвар"
            lead="Дэлхийн Банк, ЮНЕСКО, ЮНИСЕФ зэрэг байгууллагуудаас хамтран боловсруулсан RAPID хүрээ нь хичээлийн хоцрогдлыг арилгах, сургалтыг хурдасгах таван үндсэн бодлогын чиглэлийг тодорхойлдог. Доорх бүрэлдэхүүн хэсгүүд дээр дарж бодлогын тодорхойлолт болон хэрэгжүүлэх алхмуудтай танилцана уу."
          />
          <Reveal>
            <RapidExplorer />
          </Reveal>
        </Container>
      </Section>

      <Section id="models" surface="muted">
        <Container className="flex flex-col gap-12">
          <SectionTitle
            tagline="Заах Арга Зүйн Загварууд"
            title="Ялгаатай Даалгавар ба Сургалтын Тэргүүлэх Загварууд"
            lead='Уламжлалт "нэг стандартын" (one-size-fits-all) сургалт нь хоцрогдолтой сурагчдад үр дүнгүй болох нь нотлогдсон. Сүүлийн 5 жилд амжилттай хэрэгжиж буй дараах 3 үндсэн загварыг харьцуулан харна уу.'
          />
          <ModelCards />
        </Container>
      </Section>

      <Section id="impact">
        <Container className="flex flex-col gap-12">
          <SectionTitle
            tagline="Дата Анализ & Эмпирик Баримт"
            title="Интервенцүүдийн Үр Нөлөөний Харьцуулсан Шинжилгээ"
            lead={
              <>
                Боловсролын судалгаанд хэрэглэгдэж буй &quot;Effect Size (Стандарт хазайлт d)&quot; нь тухайн арга зүй сурагчийн сурлагад ямар
                хэмжээний ахиц авчирсныг илтгэдэг. Үр нөлөө <strong>d &gt; 0.40</strong> байвал өндөр үр ашигтайд тооцогдоно (EEF & Hattie
                мета-шинжилгээ).
              </>
            }
          />
          <Reveal>
            <ImpactChart />
          </Reveal>
          <ImpactInsights />
        </Container>
      </Section>

      <Section id="simulator" surface="dark">
        <Container className="flex flex-col gap-12">
          <SectionTitle
            tagline="Практик Интерактив Хэрэгсэл"
            title="Анги Танхимд Ялгаатай Стратеги Сонгох Интерактив Зөвлөх"
            lead="Та өөрийн анги, сургуулийн нөхцөл байдалд тохирох асуултуудад хариулж, хоцрогдлыг арилгах ба ялгаатай даалгавар боловсруулах оновчтой стратегийг олоорой."
          />
          <Reveal>
            <Simulator />
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-12">
          <SectionTitle
            tagline="Бодлогын Дүгнэлт"
            title="Бодлого Тодорхойлогч ба Багш Нарт Зориулсан Зөвлөмж"
            lead="Судалгааны үр дүнд үндэслэн хичээлийн хоцрогдлыг богино болон дунд хугацаанд арилгах дараах 4 чухал зарчмыг хэрэгжүүлэхийг олон улсын байгууллагууд зөвлөж байна."
          />
          <PolicyRecommendations />
          <Lead className="text-eyebrow">
            © 2026 Олон Улсын Боловсролын Харьцуулсан Судалгааны Тайлан. Эх сурвалж: World Bank, UNESCO, J-PAL, EEF.
          </Lead>
        </Container>
      </Section>
    </>
  );
}
