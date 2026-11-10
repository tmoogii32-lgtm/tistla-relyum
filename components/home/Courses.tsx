import Link from "next/link";
import { Reveal } from "@/components/effects/Reveal";
import { BlogItem } from "@/components/ui/BlogItem";
import { Button } from "@/components/ui/Button";
import { Plate } from "@/components/ui/Plate";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { CHILD_STUDY, COURSES, type Course } from "@/data/courses";

/** Хүүхэд судлалын 2 материал */
export function ChildStudy() {
  return (
    <div className="grid gap-8 border-b border-s-border pb-10 lg:grid-cols-[12.5rem_minmax(0,1fr)]">
      <Reveal as="h3" className="font-display text-heading leading-headline font-bold">
        Хүүхэд судлал
      </Reveal>
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {CHILD_STUDY.map((item, i) => (
          <Reveal key={item.title} delay={i * 80}>
            <BlogItem href="#" image={item.image} alt={item.title} title={item.title} text={item.text} titleAs="p" />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href="#" className="group flex flex-col gap-4">
      <Plate
        src={course.image}
        alt={`${course.name}: ${course.label}`}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[296/364.8] w-full"
      />
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-eyebrow leading-flat font-medium tracking-eyebrow">{course.name}</h3>
          <p className="mt-1.5 text-eyebrow leading-display text-s-sub">{course.topic}</p>
        </div>
        <p className="font-display text-[1.75rem] leading-headline font-bold transition-colors duration-150 group-hover:text-accent">
          {course.label}
        </p>
      </div>
    </Link>
  );
}

/** Сургалтууд (хуучин Product 1). Нэг картыг заахад бусад нь бүдгэрнэ. */
export function Courses() {
  return (
    <Section id="courses">
      <Container className="flex flex-col gap-20">
        <ChildStudy />

        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionTitle
            className="max-w-3xl flex-1"
            tagline="Багш нарын сургалт"
            title="Сургалтын явцууд"
            lead="Багш нарын хиймэл оюун ухааныг сайжруулах сургалтын явцаас"
          />
          <Reveal>
            <Button href="#">View all</Button>
          </Reveal>
        </div>

        <ul className="group/grid grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
          {COURSES.map((course, i) => (
            <Reveal
              as="li"
              key={course.label}
              delay={(i % 4) * 80}
              className="transition-opacity duration-700 ease-plate group-hover/grid:not-hover:opacity-30"
            >
              <CourseCard course={course} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
