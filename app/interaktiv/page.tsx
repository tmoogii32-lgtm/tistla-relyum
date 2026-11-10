import type { Metadata } from "next";
import { Reveal } from "@/components/effects/Reveal";
import { PairCoaching } from "@/components/interaktiv/PairCoaching";
import { FeatureCard, ResourcesSection } from "@/components/interaktiv/Resources";
import { TaskHead } from "@/components/interaktiv/shared";
import { SoloPractice } from "@/components/interaktiv/SoloPractice";
import { TaskTabs } from "@/components/interaktiv/TaskTabs";
import { TeamChallenge, TeamProject } from "@/components/interaktiv/TeamChallenge";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";

export const metadata: Metadata = { title: "Интерактив даалгавар" };

export default function InteraktivPage() {
  return (
    <>
      <Section>
        <Container className="flex flex-col gap-12">
          <SectionTitle
            as="h1"
            tagline="Багш, сурагчдад"
            title="Интерактив даалгавар"
            lead="Математикийн интерактив бодлого, хиймэл оюун ухааны хэрэгслүүдийг хичээлдээ ашиглах зөвлөмж, материал."
          />
          <Reveal>
            <FeatureCard />
          </Reveal>
        </Container>
      </Section>

      <Section id="daalgavar" surface="muted">
        <Container className="flex flex-col gap-12">
          <SectionTitle
            tagline="7-р анги · Хоцрогдол арилгах"
            title="Ганцаарчилсан, хосоор, багаар"
            lead="Сурагч эхлээд ганцаараа дадлага хийж, дараа нь хосоороо бие биеэ дасгалжуулж, эцэст нь багаараа сорилго давна. Даалгавар бүрт мэдлэгийн төрөл ба Блумын түвшнийг тэмдэглэсэн."
          />
          <noscript>
            <p className="text-body">Интерактив даалгаврыг ашиглахын тулд браузерын JavaScript-ийг идэвхжүүлнэ үү.</p>
          </noscript>
          <TaskTabs
            label="Даалгаврын хэлбэр"
            tabs={[
              {
                id: "solo",
                icon: "👤",
                title: "Ганцаарчилсан",
                meta: "1 сурагч · 15–20 мин",
                panel: (
                  <>
                    <TaskHead
                      title="Алхам алхмаар дадлага"
                      text="Сэдвээ сонгоод 5 даалгавар бод. Хариугаа шууд шалгаж, хэцүү бол зөвлөгөө ав. 5-аас 4 ба түүнээс дээш зөв бол сэдвээ эзэмшсэн гэж үзнэ."
                      knowledge="Журам · Ойлголт"
                      bloom="Хэрэглэх · Үнэлэх"
                    />
                    <SoloPractice />
                  </>
                ),
              },
              {
                id: "pair",
                icon: "👥",
                title: "Хосоор",
                meta: "2 сурагч · 20 мин",
                panel: (
                  <>
                    <TaskHead
                      title="Нэг нь бодно, нөгөө нь дасгалжуулна"
                      text="Шат бүрт хоёр төстэй бодлого бий. Эхлээд нэг нь чангаар тайлбарлан бодож, нөгөө нь хянах хуудсаар дасгалжуулна. Дараа нь үүргээ сольж төстэй бодлогыг бодно."
                      knowledge="Журам · Мета-танин"
                      bloom="Хэрэглэх · Үнэлэх"
                    />
                    <PairCoaching />
                  </>
                ),
              },
              {
                id: "team",
                icon: "👨‍👩‍👧‍👦",
                title: "Багаар",
                meta: "3–4 сурагч · 25–40 мин",
                panel: (
                  <>
                    <TaskHead
                      title="Код тайлах сорилго"
                      text="Баг 4 станцын бодлогыг бодно. Зөв хариу бүр түгжээний нэг цифр болно. 4 цифрийг цуглуулж түгжээг нээгээрэй. Хугацаа: 15 минут."
                      knowledge="Ойлголт · Журам"
                      bloom="Хэрэглэх · Задлан шинжлэх"
                    />
                    <TeamChallenge />
                    <TeamProject />
                  </>
                ),
              },
            ]}
          />
        </Container>
      </Section>

      <ResourcesSection />
    </>
  );
}
