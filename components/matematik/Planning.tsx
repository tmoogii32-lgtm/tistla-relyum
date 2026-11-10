import { Reveal } from "@/components/effects/Reveal";
import { BracketCard } from "@/components/ui/BracketCard";
import { LinkedText, TextLink } from "@/components/ui/LinkedText";
import { TableWrap, td, th } from "@/components/ui/Lists";
import { LESSON_STEPS, REMEDIATION_CYCLE, STRANDS, UNIT_PLAN } from "@/data/math";
import { FORM_URL } from "@/lib/site";

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-6 font-display text-title leading-headline font-bold uppercase">{children}</h3>;
}

/** Нэгж бүрийн сэдэв, гол чадвар, дадлага, үнэлгээ */
export function UnitPlanTable() {
  return (
    <div>
      <SubTitle>Нэгжийн төлөвлөгөө</SubTitle>
      <TableWrap>
        <table className="w-full min-w-[56rem] border-collapse">
          <caption className="sr-only">Нэгж бүрийн сэдэв, гол чадвар, дадлага, үнэлгээ</caption>
          <thead>
            <tr>
              {["Нэгж", "Сэдвүүд", "Гол чадвар", "Дадлага, хоцрогдол арилгах", "Үнэлгээ"].map((h) => (
                <th key={h} scope="col" className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STRANDS.map((s, i) => {
              const plan = UNIT_PLAN[i];
              return (
                <tr key={s.id}>
                  <th scope="row" className={`${td} w-44 text-left font-display text-label font-bold uppercase`}>
                    <span className="mr-2 inline-grid size-6 place-items-center bg-accent font-sans text-eyebrow text-foreground">
                      {i + 1}
                    </span>
                    {s.title}
                  </th>
                  <td className={td}>{s.chapters.join(" · ")}</td>
                  <td className={td}>{plan.skill}</td>
                  <td className={td}>
                    <ul className="flex flex-col gap-1">
                      {plan.practice.map((p) => (
                        <li key={p.label}>
                          <TextLink href={p.href}>{p.label}</TextLink>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className={td}>
                    <TextLink href={FORM_URL}>Оношлох сорил</TextLink> · {plan.tasks}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}

/** 40 минутын ээлжит хичээлийн алхмууд */
export function LessonSteps() {
  return (
    <BracketCard className="h-full p-8">
      <SubTitle>Ээлжит хичээлийн бүтэц · 40 минут</SubTitle>
      <ol className="flex flex-col gap-5">
        {LESSON_STEPS.map((step) => (
          <li key={step.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4">
            <span className="font-display text-heading leading-cap font-medium tracking-stat text-accent">{step.time}</span>
            <div className="flex flex-col gap-1">
              <strong className="text-label uppercase">{step.title}</strong>
              <p className="text-body leading-display text-s-sub">
                <LinkedText text={step.text} link={step.link} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </BracketCard>
  );
}

/** Оношлох → Бүртгэх → Нөхөн сургах → Дахин үнэлэх */
export function RemediationCycle() {
  return (
    <BracketCard className="h-full p-8" accent>
      <SubTitle>Хоцрогдол арилгах мөчлөг</SubTitle>
      <ol className="flex flex-col gap-5">
        {REMEDIATION_CYCLE.map((step, i) => (
          <li key={step.title} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
            <span className="grid size-8 place-items-center border border-accent font-display text-label font-bold text-accent">{i + 1}</span>
            <div className="flex flex-col gap-1">
              <strong className="text-label uppercase">{step.title}</strong>
              <p className="text-body leading-display text-s-sub">
                <LinkedText text={step.text} link={step.link} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </BracketCard>
  );
}

export function Planning() {
  return (
    <div className="flex flex-col gap-16">
      <Reveal>
        <UnitPlanTable />
      </Reveal>
      <div className="grid gap-8 lg:grid-cols-2">
        <Reveal>
          <LessonSteps />
        </Reveal>
        <Reveal delay={80}>
          <RemediationCycle />
        </Reveal>
      </div>
    </div>
  );
}
