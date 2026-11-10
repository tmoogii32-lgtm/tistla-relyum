import { Reveal } from "@/components/effects/Reveal";
import { BracketCard } from "@/components/ui/BracketCard";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/LinkedText";
import { TableWrap, td, th } from "@/components/ui/Lists";
import { StatCard } from "@/components/ui/StatCard";
import { BLOOM_LEVELS, BLOOM_MATRIX, DIAGNOSIS_LEVELS, EXAM_FACTS } from "@/data/exam";
import { cn } from "@/lib/cn";
import { FORM_URL, PRACTICE_APP_URL } from "@/lib/site";

/** 4 / 30 / 1 / 45 — сорилын товч үзүүлэлт */
export function FactList() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {EXAM_FACTS.map((f, i) => (
        <Reveal as="li" key={f.label} delay={i * 80}>
          <StatCard value={f.value} label={f.label} />
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * Google Form-ыг хуудсанд шигтгэнэ (хуучин shalgalt.js).
 * forms.gle богино холбоосыг шигтгэх боломжгүй тул зөвхөн товчоор нээнэ.
 */
export function ExamEmbed() {
  const url = FORM_URL.trim();
  const valid = /^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/.test(url);
  const embeddable = valid && url.includes("docs.google.com/forms/");
  const src = embeddable ? `${url}${url.includes("?") ? "&" : "?"}embedded=true` : undefined;

  return (
    <BracketCard className="flex flex-col gap-6 bg-s-raised p-6 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-heading leading-headline font-bold uppercase">Сорил эхлэх</h2>
          <p className="max-w-2xl text-body leading-display text-s-sub">
            Овог нэр, ангиа бичээд эхлээд өөрийгөө үнэлнэ. Илгээсний дараа оноо, зөв хариулт, тайлбараа шууд харна.
          </p>
        </div>
        {valid && <Button href={url}>Шинэ цонхонд нээх</Button>}
      </div>

      {!valid && (
        <p className="border border-warn/50 bg-warn/10 p-4 text-body">
          Google Form хараахан холбогдоогүй байна. Багш маягтыг үүсгээд холбоосыг <code>lib/site.ts</code> файлын{" "}
          <code>FORM_URL</code>-д оруулна.
        </p>
      )}

      {src && (
        <div className="h-[80svh] min-h-[32rem] w-full overflow-hidden border border-s-border bg-white">
          <iframe src={src} title="Сурлагын хоцрогдлыг оношлох сорил" loading="lazy" className="size-full border-0" />
        </div>
      )}
    </BracketCard>
  );
}

/** Мэдлэгийн төрөл × Блумын 6 түвшин */
export function BloomMatrix() {
  return (
    <TableWrap>
      <table className="w-full min-w-[52rem] border-collapse">
        <caption className="sr-only">Даалгаврууд мэдлэгийн төрөл ба Блумын түвшнээр</caption>
        <thead>
          <tr>
            <th scope="col" className={th}>
              Мэдлэгийн төрөл
            </th>
            {BLOOM_LEVELS.map((l) => (
              <th key={l} scope="col" className={th}>
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BLOOM_MATRIX.map((row) => (
            <tr key={row.type}>
              <th scope="row" className={cn(td, "text-left")}>
                <span className="block font-display text-label font-bold uppercase">{row.type}</span>
                <small className="block text-eyebrow text-s-sub">{row.note}</small>
              </th>
              {row.cells.map((cell, i) => (
                <td key={i} className={cn(td, cell ? "bg-accent-muted font-medium" : "text-center text-s-faint")}>
                  {cell ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

const TONE = {
  ok: { border: "border-ok", text: "text-ok" },
  mid: { border: "border-warn", text: "text-warn" },
  low: { border: "border-danger", text: "text-danger" },
} as const;

/** Эзэмшсэн / Хэсэгчлэн / Хоцрогдолтой */
export function DiagnosisLevels() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {DIAGNOSIS_LEVELS.map((l, i) => (
        <Reveal key={l.title} delay={i * 80}>
          <div className={cn("flex h-full flex-col gap-2 border-t-4 bg-s-raised p-6", TONE[l.tone].border)}>
            <strong className={cn("font-display text-heading leading-cap font-medium tracking-stat", TONE[l.tone].text)}>
              {l.range}
            </strong>
            <h3 className="mt-2 font-display text-title leading-headline font-bold uppercase">{l.title}</h3>
            <p className="text-body leading-display text-s-sub">{l.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Хариулт илгээсний дараах алхмууд */
export function DiagnosisSteps() {
  const steps = [
    <>
      Хариулт илгээх бүрд Google Sheets-ийн <strong>&quot;Онош&quot;</strong> хуудаст сурагч тус бүрийн мэдлэгийн төрөл, Блумын
      түвшин бүрийн хувь, хоцрогдолтой нүд, давтах сэдэв гарна.
    </>,
    <>
      <strong>&quot;Матриц&quot;</strong> хуудаст ангийн дундаж гүйцэтгэл 4 × 6 матрицаар өнгөөр ялгагдан харагдана.
    </>,
    <>Өөрийн үнэлгээг гүйцэтгэлтэй харьцуулж, сурагч өөрийгөө хэт өндөр эсвэл бага үнэлж буйг (мета-танин мэдэхүй) илрүүлнэ.</>,
    <>
      Хоцрогдолтой сэдвийг <TextLink href="/hotsrogdol">Хоцрогдлыг тооцох</TextLink> хуудаст бүртгэж,{" "}
      <TextLink href={PRACTICE_APP_URL}>интерактив бодлогоор</TextLink> нөхөн сургана.
    </>,
  ];
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((s, i) => (
        <Reveal as="li" key={i} delay={i * 60} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 text-lead leading-display">
          <span className="grid size-8 place-items-center border border-accent font-display text-label font-bold text-accent">{i + 1}</span>
          <p className="pt-1">{s}</p>
        </Reveal>
      ))}
    </ol>
  );
}
