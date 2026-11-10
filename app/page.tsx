import { AnimatedCounter } from "@/components/home/AnimatedCounter";
import { Courses } from "@/components/home/Courses";
import { Hero } from "@/components/home/Hero";
import { MathIntro } from "@/components/home/MathIntro";
import { StatsSection } from "@/components/home/StatsSection";
import { VideoLightbox } from "@/components/home/VideoLightbox";
import { TuvshinReport } from "@/components/tuvshin/TuvshinReport";

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

      <MathIntro />

      {/* Түвшин — урт текст тул том үсгээр хувиргахгүй */}
      <div className="normal-case">
        <TuvshinReport />
      </div>

      <Courses />
    </div>
  );
}
