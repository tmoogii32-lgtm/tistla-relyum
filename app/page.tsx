import Image from "next/image";
import { AnimatedCounter } from "@/components/home/AnimatedCounter";
import { Courses } from "@/components/home/Courses";
import { Hero } from "@/components/home/Hero";
import { MathIntro } from "@/components/home/MathIntro";
import { StatsSection } from "@/components/home/StatsSection";
import { VideoLightbox } from "@/components/home/VideoLightbox";
import { Plate } from "@/components/ui/Plate";

export default function HomePage() {
  return (
    <div className="uppercase">
      <Hero />

      <StatsSection
        surface="light"
        tagline="Numbers"
        title="Холбогдсон хүмүүс"
        lead="Нэвтэрсэн багш сурагчид"
        stats={[
          { value: <AnimatedCounter source="views" value={1} />, label: "Үзэгчдийн тоо" },
          { value: <AnimatedCounter source="static" value={1000000} />, label: "Үзэх хүмүүс" },
        ]}
        media={
          <VideoLightbox
            src="/assets/holbogdson.mp4"
            poster="/assets/holbogdson-poster.jpg"
            label="Багш нарын сургалтын видео тоглуулах"
          />
        }
      />

      <StatsSection
        surface="dark"
        tagline="Numbers"
        title="Сурагчдын ирц"
        lead="Сурагч бүр түвшинчилсэн байдлаар оролцох"
        stats={[
          { value: <AnimatedCounter source="students" value={1} />, label: "Сурагчдын бүртгэл" },
          { value: <AnimatedCounter source="static" value={1000} />, label: "Хамрагдах сурагчдын тоо" },
        ]}
        media={
          <Plate src="/assets/lightbox.png" sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[600/640] w-full">
            <span aria-hidden="true" className="absolute inset-0 bg-surface-black/40" />
            <Image
              src="/assets/play-button.svg"
              width={64}
              height={64}
              alt=""
              className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2"
            />
          </Plate>
        }
      />

      <MathIntro />
      <Courses />
    </div>
  );
}
