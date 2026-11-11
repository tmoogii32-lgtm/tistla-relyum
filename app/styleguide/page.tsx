import type { Metadata } from "next";
import Image from "next/image";
import { MathText } from "@/components/daalgavar/MathText";
import { StatusBadge } from "@/components/hotsrogdol/parts";
import { Feedback, Tag } from "@/components/interaktiv/shared";
import { ColorChip, Swatch, TypeSpec, VarValue } from "@/components/styleguide/Measure";
import { MotionRegistry } from "@/components/styleguide/MotionRegistry";
import { SgSection, SgSub, Specimen, TokenRow } from "@/components/styleguide/parts";
import { Toc } from "@/components/styleguide/Toc";
import { BlogItem } from "@/components/ui/BlogItem";
import { BracketCard, Brackets } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Field, FormError, inputClass } from "@/components/ui/Form";
import { CheckList, GoalList, LinkList, TableWrap, td, th } from "@/components/ui/Lists";
import { Plate } from "@/components/ui/Plate";
import { Container, Section } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { Lead, SectionTitle, Tagline } from "@/components/ui/Typography";
import { LEVELS } from "@/data/levels";
import { MINI_TASKS } from "@/data/miniTasks";
import {
  DURATIONS,
  EASINGS,
  FONT_FAMILIES,
  ICONS,
  LAYOUT_VARS,
  LINE_HEIGHTS,
  MATH_ILLUSTRATIONS,
  OVERLAYS,
  PRINCIPLES,
  RAW_COLORS,
  ROLE_COLORS,
  SECTION_REGISTRY,
  SPACING,
  STATUS_COLORS,
  SURFACES,
  SURFACE_TOKENS,
  TRACKING,
  TYPE_SCALE,
} from "@/data/styleguide";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "Математикт дурлагсад сайтын дизайн систем: токен, компонент, хөдөлгөөн.",
};

const SAMPLE = "Математикт дурлагсад · 7-р анги";

export default function StyleguidePage() {
  return (
    <Section tight className="pt-[calc(var(--section-y)*0.75)]">
      <Container className="grid gap-12 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav-h)+2rem)]">
            <Toc />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-col gap-4 pb-16">
            <Tagline>Design system · Styleguide</Tagline>
            <h1 className="font-display text-display-sm leading-headline font-bold uppercase">{SITE.name} — дизайн систем</h1>
            <Lead className="max-w-3xl">
              Сайтын бодит CSS-ээс шууд зурагдсан токен, компонент, хөдөлгөөний сан. Өнгө, хэмжээ, контрастын утгыг браузер{" "}
              <code className="text-body">app/globals.css</code>-ээс уншдаг тул токен өөрчлөгдөхөд энэ хуудас автоматаар шинэчлэгдэнэ.
            </Lead>
          </header>

          {/* 01 Зарчим */}
          <SgSection id="principles">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {PRINCIPLES.map((p) => (
                <BracketCard key={p.title} className="flex flex-col gap-2 bg-s-raised">
                  <h3 className="font-display text-label font-bold uppercase">{p.title}</h3>
                  <p className="text-eyebrow leading-display text-s-sub">{p.text}</p>
                </BracketCard>
              ))}
            </div>
          </SgSection>

          {/* 02 Брэнд */}
          <SgSection id="brand" lead="public/assets/logo.png — Navbar, Footer-т 84 × 32px (w-21 h-8). Гарчгийн wordmark нь Oswald, том үсэг, төгсгөлдөө accent цэгтэй.">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { surface: "light", label: "Цаасан дээр · --background" },
                { surface: "dark", label: "Бараан дээр · --surface-dark" },
                { surface: "accent", label: "Accent дээр · footer хүрээ" },
              ].map((b) => (
                <div
                  key={b.surface}
                  data-surface={b.surface === "accent" ? undefined : b.surface}
                  className={b.surface === "accent" ? "flex flex-col items-center gap-6 bg-accent p-8 text-foreground" : "flex flex-col items-center gap-6 border border-s-border p-8"}
                >
                  <div className="relative h-16 w-40">
                    <Image src="/assets/logo.png" alt="Сургуулийн лого" fill sizes="160px" className="object-contain" />
                  </div>
                  <p className="font-display text-title leading-headline font-bold uppercase">
                    {SITE.name}
                    <span className={b.surface === "accent" ? "text-foreground" : "text-accent"}>.</span>
                  </p>
                  <code className="text-eyebrow opacity-70">{b.label}</code>
                </div>
              ))}
            </div>
          </SgSection>

          {/* 03 Өнгө */}
          <SgSection id="color" lead="Хоёр түвшинтэй: түүхий утга (Түвшин 1) → үүрэг (Түвшин 2). Компонентууд зөвхөн үүргийн токен, гадаргуугийн s-* токеныг Tailwind utility-ээр хэрэглэнэ.">
            <SgSub title="Түвшин 1 · түүхий өнгө" code="--raw-*" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-7">
              {RAW_COLORS.map((c) => (
                <div key={c.cssVar} className="flex flex-col gap-1">
                  <Swatch cssVar={c.cssVar} />
                  <span className="text-eyebrow text-s-sub">{c.usage}</span>
                </div>
              ))}
            </div>

            <SgSub title="Түвшин 2 · үүрэг" code="@theme inline → bg-*, text-*">
              Бичвэрийн өнгөнд контрастын харьцааг (WCAG) харгалзах дэвсгэр дээр нь тооцов.
            </SgSub>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-7">
              {ROLE_COLORS.map((c) => (
                <div key={c.cssVar} className="flex flex-col gap-1">
                  <Swatch cssVar={c.cssVar} against={c.against} />
                  {c.utility && <code className="text-eyebrow">{c.utility}</code>}
                  <span className="text-eyebrow text-s-sub">{c.usage}</span>
                </div>
              ))}
            </div>

            <SgSub title="Төлөвийн өнгө" code="ok · warn · danger">
              Онош, даалгаврын үр дүн: ≥ 80% эзэмшсэн, 50–79% хэсэгчлэн, &lt; 50% хоцрогдолтой.
            </SgSub>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {STATUS_COLORS.map((c) => (
                <div key={c.name} className="flex flex-col gap-1">
                  <Swatch cssVar={c.cssVar} against={c.against} />
                  <code className="text-eyebrow">{c.utility}</code>
                  <span className="text-eyebrow text-s-sub">{c.usage}</span>
                </div>
              ))}
              <div className="flex flex-col justify-center gap-2 sm:col-span-3">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="ok" />
                  <StatusBadge status="behind" />
                  <StatusBadge status="none" />
                  <StatusBadge status="failed" />
                </div>
              </div>
            </div>

            <SgSub title="Гадаргуугийн семантик токен" code="[data-surface='light | muted | dark']">
              Хэсэг бүр <code>data-surface</code>-тэй. Доорх токенууд гадаргуугаас хамааран өнгөө өөрөө солино — компонент гадаргуугаа мэдэх шаардлагагүй.
            </SgSub>
            <TableWrap>
              <table className="w-full min-w-[44rem] border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Токен</th>
                    <th className={th}>Utility</th>
                    {SURFACES.map((s) => (
                      <th key={s} className={th}>
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SURFACE_TOKENS.map((t) => (
                    <tr key={t.token}>
                      <td className={td}>
                        <code className="text-eyebrow font-bold">{t.token}</code>
                        <span className="block text-eyebrow text-s-sub">{t.usage}</span>
                      </td>
                      <td className={td}>
                        <code className="text-eyebrow">{t.utility}</code>
                      </td>
                      {SURFACES.map((s) => (
                        <td key={s} data-surface={s} className="border-b border-s-border px-4 py-3">
                          <ColorChip cssVar={t.token} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </SgSection>

          {/* 04 Үсэг */}
          <SgSection id="type" lead="Гарчиг Oswald (нарийн, өндөр, том үсэг), бичвэр Space Grotesk. Space Grotesk кирилл үсэггүй тул кирилл тэмдэгт Inter-ээр автоматаар нөхөгдөнө. Фонтыг next/font ачаална (app/layout.tsx).">
            <SgSub title="Үсгийн гэр бүл" />
            <div className="grid gap-4 md:grid-cols-3">
              {FONT_FAMILIES.map((f) => (
                <BracketCard key={f.role} className="flex flex-col gap-3">
                  <p className="text-eyebrow uppercase text-s-sub">{f.role}</p>
                  <p className={`${f.cls} text-heading leading-headline`}>{f.sample}</p>
                  <p className="font-display text-title font-bold uppercase">{f.family}</p>
                  <p className="text-eyebrow leading-display text-s-sub">{f.usage}</p>
                  <code className="text-eyebrow">{f.token}</code>
                </BracketCard>
              ))}
            </div>

            <SgSub title="Хэмжээний шатлал" code="--text-*">
              Бодит хэмжээг одоогийн дэлгэцийн өргөнд тооцов — уян хатан токенууд (display-sm, impact) дэлгэцээс хамаарч өөрчлөгдөнө.
            </SgSub>
            <div className="flex flex-col">
              {TYPE_SCALE.map((t) => (
                <TokenRow key={t.token} token={t.token} value={<VarValue cssVar={t.cssVar} />} usage={t.usage}>
                  <p className="truncate leading-headline" style={{ fontSize: `var(${t.cssVar})` }}>
                    {SAMPLE}
                  </p>
                </TokenRow>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <SgSub title="Мөрийн өндөр" code="leading-*" />
                {LINE_HEIGHTS.map((l) => (
                  <div key={l.token} className="flex flex-col gap-2 border-b border-s-border py-4">
                    <p className="flex gap-3 text-eyebrow">
                      <code className="font-bold">{l.token}</code>
                      <span className="text-s-sub">
                        <VarValue cssVar={l.cssVar} prop="lineHeight" /> · {l.usage}
                      </span>
                    </p>
                    <p className="max-w-md bg-accent-muted text-body" style={{ lineHeight: `var(${l.cssVar})` }}>
                      Сэдвээ сонгоод Т1 түвшнээс эхэл. Даалгавар бүр 5 бодлоготой, 4 зөв бол тэнцэнэ.
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <SgSub title="Үсэг хоорондын зай" code="tracking-*" />
                {TRACKING.map((t) => (
                  <div key={t.token} className="flex flex-col gap-2 border-b border-s-border py-4">
                    <p className="flex gap-3 text-eyebrow">
                      <code className="font-bold">{t.token}</code>
                      <span className="text-s-sub">
                        <VarValue cssVar={t.cssVar} prop="raw" /> · {t.usage}
                      </span>
                    </p>
                    <p className="font-display text-heading uppercase" style={{ letterSpacing: `var(${t.cssVar})` }}>
                      Хоцрогдол 1000
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <SgSub title="Бичвэрийн хэв маяг">Доорх утгыг тухайн элементийн computed style-аас уншив.</SgSub>
            <div className="flex flex-col">
              <TypeSpec label="<Tagline> · eyebrow-mark">
                <Tagline>Багшийн хэрэгсэл</Tagline>
              </TypeSpec>
              <TypeSpec label="<h1> hero · text-impact · heading-mark">
                <p className="heading-mark font-display text-impact leading-headline font-bold uppercase">Математик 7</p>
              </TypeSpec>
              <TypeSpec label="<Heading> h2 · text-display-sm">
                <p className="heading-mark font-display text-display-sm leading-headline font-bold uppercase">Хоцрогдлыг тооцох</p>
              </TypeSpec>
              <TypeSpec label="h3 · font-display text-heading">
                <p className="font-display text-heading leading-headline font-bold uppercase">Энгийн бутархай</p>
              </TypeSpec>
              <TypeSpec label="Картын гарчиг · font-display text-title">
                <p className="font-display text-title leading-headline font-bold uppercase">Т1-Даалгавар 1</p>
              </TypeSpec>
              <TypeSpec label="<Lead> · text-lead text-s-sub">
                <Lead>Сэдвээ сонгоод 5 бодлого бодоорой. Бодлого бүрийн дараа хэрхэн бодохыг тайлбарлана.</Lead>
              </TypeSpec>
              <TypeSpec label="p · text-body leading-display">
                <p className="text-body leading-display">Даалгавар бүр мэдлэгийн нэг төрөл ба Блумын нэг түвшинд хамаарна.</p>
              </TypeSpec>
              <TypeSpec label="Тоо · StatCard value">
                <p className="tabular font-display text-heading leading-cap font-medium tracking-stat text-accent">80%</p>
              </TypeSpec>
              <TypeSpec label="Label · text-eyebrow uppercase">
                <p className="text-eyebrow font-medium tracking-eyebrow uppercase">Зөв бодсон (5-аас)</p>
              </TypeSpec>
            </div>
          </SgSection>

          {/* 05 Зай */}
          <SgSection id="space" lead="Tailwind-ийн 4px суурьтай шатлал (p-4 = 16px). Том дэлгэцэнд html font-size томордог тул rem-ийн бүх утга хамт томорно.">
            <div className="flex flex-col gap-2">
              {SPACING.map((s) => (
                <div key={s.cls} className="grid grid-cols-[4rem_4rem_minmax(0,1fr)] items-center gap-4 text-eyebrow">
                  <code className="font-bold">{s.cls}</code>
                  <span className="text-s-sub">{s.px}px</span>
                  <span className="h-3 bg-accent" style={{ width: `${s.px / 4}rem` }} />
                </div>
              ))}
            </div>
            <SgSub title="Байршил" code="CSS хувьсагч" />
            <div className="flex flex-col">
              {LAYOUT_VARS.map((l) => (
                <TokenRow key={l.token} token={l.token} value={l.value} usage={l.usage} />
              ))}
            </div>
          </SgSection>

          {/* 06 Хэлбэр */}
          <SgSection id="shape" lead="Бөөрөнхий булан хэрэглэхгүй (border-radius 0). Онцлох элементүүд тайрсан, шатлалтай булангаар ялгарна. Дугуй хэлбэр зөвхөн цэг, явцын тэмдэгт.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Specimen name="Хурц өнцөг · 0" note="Карт, input, хүснэгт, таб">
                <span className="h-16 w-28 border border-s-fg bg-s-raised" />
              </Specimen>
              <Specimen name="Ташуу булан · Button" note="220 × 50 SVG path, баруун доод булан 8px тайрсан" file="components/ui/Button.tsx">
                <Button as="span">Товч</Button>
              </Specimen>
              <Specimen name="clip-corner" note="Тоон карт — баруун доод булан 9px" file="@utility clip-corner">
                <span className="clip-corner h-16 w-32 bg-surface-black" />
              </Specimen>
              <Specimen name="plate-clip" note="Зургийн хавтан — доод талдаа шатлалтай" file="components/ui/Plate.tsx">
                <Plate src="/assets/course-4.png" sizes="160px" className="aspect-[4/3] w-36" />
              </Specimen>
              <Specimen name="Brackets ⌐ ¬" note="4 буланд 10px шугам; accent хувилбар" file="components/ui/BracketCard.tsx">
                <span className="relative h-16 w-28">
                  <Brackets />
                </span>
                <span className="relative h-16 w-28">
                  <Brackets accent />
                </span>
              </Specimen>
              <Specimen name="rounded-full" note="Зөвхөн явцын цэг, өнгөний chip">
                {["bg-ok", "bg-danger", "bg-s-border"].map((c) => (
                  <span key={c} className={`size-3 rounded-full ${c}`} />
                ))}
              </Specimen>
            </div>
          </SgSection>

          {/* 07 Шугам */}
          <SgSection id="line">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Specimen name="Hairline" note="1px border-s-border · хүснэгт, карт, навбар">
                <span className="h-px w-full bg-s-border" />
              </Specimen>
              <Specimen name="heading-mark" note="Гарчгийн доорх accent зураас 1.5rem × 2px + цэг" file="@utility heading-mark">
                <span className="heading-mark font-display text-heading font-bold uppercase">Гарчиг</span>
              </Specimen>
              <Specimen name="Underline link" note="decoration-accent 2px, offset .2–.3em">
                <a href="#line" className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
                  Хоцрогдлыг тооцох
                </a>
              </Specimen>
              <Specimen name="Focus ring" note=":focus-visible — 2px accent, offset 3px">
                <span className="px-3 py-2 outline-2 outline-offset-3 outline-accent">Tab дарахад</span>
              </Specimen>
              <Specimen name="Accent stroke" note="Тоон картын 1px accent хүрээ (clip-corner-тэй)">
                <StatCard value="24" label="Сурагч" className="w-48" />
              </Specimen>
              <Specimen name="Status edge" note="border-l-4 — хариуны санал, зөвлөгөө">
                <span className="border-l-4 border-ok bg-ok/10 px-3 py-2 text-body">Зөв! +20 оноо</span>
              </Specimen>
            </div>
          </SgSection>

          {/* 08 Сүүдэр, бүрхүүл */}
          <SgSection id="overlay" lead="Drop shadow хэрэглэхгүй — гүнийг гадаргуу ээлжлэх, бүрхүүлээр гаргана. Бүх бүрхүүл surface-black-ээс хувиар.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {OVERLAYS.map((o) => (
                <figure key={o.name} className="flex flex-col border border-s-border">
                  <div className="relative h-32 overflow-hidden">
                    <Image src="/assets/hero-bg.png" alt="" fill sizes="240px" className="object-cover" />
                    <div className={`absolute inset-0 ${o.cls}`} />
                    <span className="absolute inset-0 grid place-items-center font-display text-title font-bold uppercase text-on-dark">Аа</span>
                  </div>
                  <figcaption className="flex flex-col gap-1 bg-s-raised px-3 py-2">
                    <strong className="text-eyebrow">{o.name}</strong>
                    <code className="text-eyebrow">{o.value}</code>
                    <span className="text-eyebrow leading-display text-s-sub">{o.usage}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </SgSection>

          {/* 09 Дүрс */}
          <SgSection id="icons" lead="SVG файлууд public/assets/-д. Цайвар дээр цагаан icon-ыг icon-adapt (filter: invert) хар болгоно. Түвшин, мини даалгаварт emoji / тэмдэгт хэрэглэнэ.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
              {ICONS.map((i) => (
                <figure key={i.name} className="flex flex-col items-center gap-2 border border-s-border p-4 text-center">
                  <span data-surface={i.dark ? "dark" : undefined} className="grid size-14 place-items-center">
                    <Image src={i.src} alt="" width={32} height={32} className={i.dark ? "size-6" : "icon-adapt size-8"} />
                  </span>
                  <code className="text-eyebrow">{i.name}</code>
                  <span className="text-eyebrow leading-display text-s-sub">{i.usage}</span>
                </figure>
              ))}
            </div>
            <SgSub title="Түвшний тэмдэг" code="data/levels.ts" />
            <div className="flex flex-wrap gap-3">
              {LEVELS.map((l, i) => (
                <span key={l.name} className="flex items-center gap-2 border border-s-border px-3 py-2 text-label">
                  <span aria-hidden="true">{l.icon}</span>
                  <b className="font-display">R{i + 1}</b> {l.name}
                </span>
              ))}
            </div>
            <SgSub title="Мини даалгаврын тэмдэг" code="data/miniTasks.ts" />
            <div className="flex flex-wrap gap-3">
              {MINI_TASKS.map((t) => (
                <span key={t.id} className="flex items-center gap-2 border border-s-border px-3 py-2 text-eyebrow">
                  <span aria-hidden="true" className="grid size-8 place-items-center bg-surface-black font-display text-label text-accent">
                    {t.icon}
                  </span>
                  {t.title}
                </span>
              ))}
            </div>
            <SgSub title="Математикийн чимэглэл" code="public/assets/math/*.svg" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {MATH_ILLUSTRATIONS.map((m) => (
                <figure key={m.name} className="flex flex-col gap-2">
                  <Plate src={m.src} fit="contain" fillClassName="bg-surface-dark" sizes="240px" className="aspect-[4/3] w-full" />
                  <code className="text-eyebrow">{m.name}.svg</code>
                </figure>
              ))}
            </div>
          </SgSection>

          {/* 10 Компонент */}
          <SgSection id="components" lead="components/ui/ — бүх хуудас хуваалцдаг primitive-ууд. Бараан гадаргуу дээр харагдах хэлбэрийг хамт үзүүлэв.">
            <div className="grid gap-4 xl:grid-cols-2">
              <Specimen name='<Button variant="solid">' note="Гол үйлдэл. Цайвар дээр бараан их бие, бараан дээр хоосон хүрээ (автоматаар)." file="components/ui/Button.tsx">
                <Button href="#components">Сорил эхлэх</Button>
                <Button variant="link" href="#components">
                  Дэлгэрэнгүй
                </Button>
              </Specimen>
              <Specimen name='<Button> · dark surface' note="--s-btn-body: none → accent хүрээ" dark>
                <Button href="#components">Бодлого бодох</Button>
                <Button variant="link" href="#components">
                  More
                </Button>
              </Specimen>
              <Specimen name="<SectionTitle>" note="Tagline + Heading (үг үгээр гарна) + Lead" file="components/ui/Typography.tsx" className="xl:col-span-2">
                <SectionTitle tagline="01" title="Суралцахуйн зорилт" lead="7-р ангийн төгсгөлд сурагч дараах мэдлэг, чадварыг эзэмшсэн байна." />
              </Specimen>
              <Specimen name="<BracketCard>" note="Булангийн хүрээтэй карт; accent хувилбар" file="components/ui/BracketCard.tsx">
                <BracketCard className="w-48 bg-s-raised">
                  <p className="text-body">Энгийн</p>
                </BracketCard>
                <BracketCard accent className="w-48 bg-s-raised">
                  <p className="text-body">accent</p>
                </BracketCard>
              </Specimen>
              <Specimen name="<StatCard>" note="Тоон үзүүлэлт; AnimatedCounter-тай хамт" file="components/ui/StatCard.tsx">
                <StatCard value="1000" label="Хамрагдах сурагч" className="w-56" />
              </Specimen>
              <Specimen name="<Plate>" note="Зураг (cover) эсвэл чимэглэл (contain); hover үед агшина" file="components/ui/Plate.tsx">
                <Plate src="/assets/course-1.png" sizes="160px" className="aspect-[296/364.8] w-32" />
                <Plate src="/assets/math/algebra.svg" fit="contain" fillClassName="bg-surface-dark" sizes="200px" className="aspect-[4/3] w-44" />
              </Specimen>
              <Specimen name="<BlogItem>" note="Зураг + гарчиг + тайлбар; холбоос эсвэл article" file="components/ui/BlogItem.tsx">
                <BlogItem image="/assets/mega-vark.png" title="VARK судалгаа" text="Сурах хэв шинжийн судалгаа" href="#components" />
              </Specimen>
              <Specimen name="<GoalList> · <CheckList> · <LinkList>" file="components/ui/Lists.tsx">
                <GoalList items={["Бутархайг хураах", "Процент олох"]} />
                <CheckList items={["Зөв хөрвүүлдэг", "Хариугаа шалгадаг"]} />
                <LinkList items={[{ href: "#components", label: "Хичээлийн төлөвлөлт" }]} />
              </Specimen>
              <Specimen name="<Field> · inputClass · <FormError>" file="components/ui/Form.tsx">
                <div className="grid w-full gap-4 sm:grid-cols-2">
                  <Field label="Овог нэр">
                    <input className={inputClass} placeholder="Жишээ: Б. Тэмүүлэн" />
                  </Field>
                  <Field label="Түвшин">
                    <select className={inputClass} defaultValue="Суурь">
                      {LEVELS.map((l) => (
                        <option key={l.name}>
                          {l.icon} {l.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <FormError>Овог нэр болон ангийг бөглөнө үү.</FormError>
                </div>
              </Specimen>
              <Specimen name="<TableWrap> · th · td" note="Нарийн дэлгэцэнд хэвтээ scroll" file="components/ui/Lists.tsx">
                <TableWrap>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className={th}>Сурагч</th>
                        <th className={th}>Дүн</th>
                        <th className={th}>Төлөв</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={td}>Т. Батболд</td>
                        <td className={td}>3/5</td>
                        <td className={td}>
                          <StatusBadge status="failed" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </TableWrap>
              </Specimen>
              <Specimen name="<Tag> · <Feedback> · <MathText>" note="Даалгаврын шошго, хариуны санал, [[a/b]] бутархай" file="components/interaktiv/shared.tsx">
                <div className="flex w-full flex-col gap-3">
                  <div>
                    <Tag>Журам × Хэрэглэх</Tag>
                  </div>
                  <p className="text-lead">
                    <MathText text="[[2/3]] + [[1/4]] = [[11/12]]" />
                  </p>
                  <Feedback tone="ok">Зөв! +10 оноо</Feedback>
                  <Feedback tone="bad">Буруу. Зөв хариу: 7</Feedback>
                </div>
              </Specimen>
            </div>
          </SgSection>

          {/* 11 Хэсгүүд */}
          <SgSection id="sections" lead="Хуудас бүр Section (гадаргуу + зай) → Container (80rem) → SectionTitle → агуулга гэсэн бүтэцтэй. Гадаргууг ээлжлэн хэмнэл үүсгэнэ.">
            <div className="grid gap-px border border-s-border bg-s-border md:grid-cols-3">
              {SURFACES.map((s) => (
                <div key={s} data-surface={s} className="flex flex-col gap-4 p-6">
                  <code className="text-eyebrow">{`<Section surface="${s}">`}</code>
                  <Tagline>Хэсэг</Tagline>
                  <p className="heading-mark font-display text-heading leading-headline font-bold uppercase">Гарчиг</p>
                  <p className="text-body text-s-sub">Туслах бичвэр гадаргуугаас хамааран өнгөө солино.</p>
                  <Actions>
                    <Button as="span">Товч</Button>
                  </Actions>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-6">
              {SECTION_REGISTRY.map((p) => (
                <div key={p.page} className="flex flex-col gap-2">
                  <h3 className="flex items-baseline gap-3 font-display text-title uppercase">
                    {p.page}
                    <a href={p.href} className="text-eyebrow normal-case underline decoration-accent underline-offset-4 hover:text-accent">
                      {p.href} ↗
                    </a>
                  </h3>
                  <TableWrap>
                    <table className="w-full min-w-[40rem] border-collapse">
                      <tbody>
                        {p.items.map((it) => (
                          <tr key={it.name}>
                            <td className={`${td} w-56 font-medium`}>{it.name}</td>
                            <td className={td}>{it.note}</td>
                            <td className={`${td} text-right`}>
                              <code className="text-eyebrow text-s-sub">{it.file}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableWrap>
                </div>
              ))}
            </div>
          </SgSection>

          {/* 12 Хөдөлгөөн */}
          <SgSection
            id="motion"
            lead={
              <>
                Хөдөлгөөн бүр зориулалт, үүсгэгч, хуудсаар бүртгэгдсэн. <code>prefers-reduced-motion</code> асаалттай үед reveal, sheet, live-ring
                зогсож агуулга шууд харагдана. Шинэ хөдөлгөөн нэмбэл <code>data/styleguide.ts</code>-д бүртгэнэ.
              </>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col">
                <SgSub title="Хугацаа" />
                {DURATIONS.map((d) => (
                  <TokenRow key={d.name} token={d.name} value={d.value} usage={d.usage} />
                ))}
              </div>
              <div className="flex flex-col">
                <SgSub title="Easing" code="--ease-*" />
                {EASINGS.map((e) => (
                  <TokenRow key={e.name} token={e.name} value={<code>{e.value}</code>} usage={e.usage} />
                ))}
              </div>
            </div>
            <MotionRegistry />
          </SgSection>
        </div>
      </Container>
    </Section>
  );
}
