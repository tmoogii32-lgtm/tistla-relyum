import Image from "next/image";
import { BracketCard } from "@/components/ui/BracketCard";
import { Button } from "@/components/ui/Button";
import { Plate } from "@/components/ui/Plate";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { PRACTICE_APP_URL } from "@/lib/site";
import { MiniTasks } from "./MiniTasks";

/** Онцлох: web3 бодлогын апп руу том карт */
export function FeatureCard() {
  return (
    <a href={PRACTICE_APP_URL} target="_blank" rel="noopener" className="group grid items-center gap-8 md:grid-cols-2">
      <Plate fit="contain" className="aspect-[4/3] w-full" fillClassName="bg-surface-dark">
        <Image src="/assets/math/algebra.svg" alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-contain p-6" />
      </Plate>
      <BracketCard className="flex flex-col items-start gap-4 p-8">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">Онцлох</p>
        <h2 className="font-display text-heading leading-headline font-bold uppercase transition-colors group-hover:text-accent">
          Математик 7 — Хоцрогдлоо нөхье!
        </h2>
        <p className="text-body leading-display text-s-sub">
          Сэдвээ сонгоод 5 бодлого бодоорой. Бодлого бүрийн дараа хэрхэн бодохыг алхам алхмаар тайлбарлана. Сэдэв бүр 🌱 Суурь →
          🌿 Дунд → 🌳 Ахисан → 🏆 Гүнзгий гэсэн 4 түвшинтэй.
        </p>
        <Button as="span">Даалгавар эхлэх</Button>
      </BracketCard>
    </a>
  );
}

/** Нийтлэл, материал */
/** Сурагчдад зориулсан интерактив мини даалгаврууд (хуучин нийтлэлийн хэсгийн оронд) */
export function ResourcesSection() {
  return (
    <Section id="mini" surface="muted">
      <Container className="flex flex-col gap-12">
        <SectionTitle
          tagline="Сурагчдад · Тоглоомоор суралцах"
          title="Интерактив мини даалгаврууд"
          lead="Даалгавраа сонгоод шууд тогло. Даалгавар бүрийн оноо, тайлбар, хугацааг карт дээр харуулсан. Шилдэг оноо чинь хадгалагдаж, нийт оноонд нэмэгдэнэ."
        />
        <MiniTasks />
      </Container>
    </Section>
  );
}
