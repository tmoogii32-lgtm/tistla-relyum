"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCsv } from "@/lib/csv";
import { GUEST } from "@/lib/taskProgress";
import { compareStudents, recordsOf, toCsvRows, today, unique, type Student } from "@/lib/tracker";
import { BehindTable, ExamLinkCard, StudentForm, StudentTable, TrackerSummary } from "./parts";
import { useTracker } from "./useTracker";

const isString = (v: unknown): v is string => typeof v === "string";

/**
 * Хоцрогдлыг тооцох — сурагч бүртгэх, нийт байдал, хоцрогдолтой сурагчид.
 * Дүн нь "Даалгавартай ажиллах" хуудаснаас (оношлох сорил, даалгавар) автоматаар орно.
 */
export function Tracker() {
  const router = useRouter();
  const { state, addStudent, deleteStudent, clearAll } = useTracker();
  const [, setActiveStudent] = useLocalStorage<string>("daalgavar-student", GUEST, isString);
  const [classFilter, setClassFilter] = useState("");

  const students = [...state.students].sort(compareStudents);
  const classes = unique(students.map((s) => s.cls));
  const effClass = classes.includes(classFilter) ? classFilter : "";

  /** Сурагчийг сонгоод "Даалгавартай ажиллах" хуудасны бүртгэл рүү */
  const showRecords = (id: string) => {
    setActiveStudent(id);
    router.push("/daalgavar#burtgel");
  };

  const confirmDeleteStudent = (s: Student) => {
    const count = recordsOf(state, s.id).length;
    const msg = `${s.name} сурагчийг устгах уу?` + (count ? `\nТүүний ${count} дүнгийн бүртгэл мөн устна.` : "");
    if (confirm(msg)) deleteStudent(s.id);
  };

  const exportCsv = () => {
    if (!state.students.length) return alert("Татах бүртгэл алга байна.");
    downloadCsv(toCsvRows(state), `hotsrogdol-${today()}.csv`);
  };

  const confirmClear = () => {
    if (!state.students.length && !state.records.length) return;
    if (confirm("Бүх сурагч болон дүнгийн бүртгэлийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.")) clearAll();
  };

  return (
    <>
      <Section>
        <Container className="flex flex-col gap-12">
          <SectionTitle
            as="h1"
            tagline="Багшийн хэрэгсэл"
            title="Хоцрогдлыг тооцох"
            lead="Сурагчдаа бүртгэнэ. Сурагч оношлох сорил өгч, даалгавар бодоход дүн нь автоматаар бүртгэгдэнэ. Даалгавар бүр 5 бодлоготой; 4-өөс доош зөв бодсон бол хоцрогдолтой гэж тооцно."
          />
          <Reveal>
            <ExamLinkCard />
          </Reveal>
          <TrackerSummary state={state} />
        </Container>
      </Section>

      <Section id="students" tight>
        <Container className="grid items-start gap-8 lg:grid-cols-[minmax(18rem,1fr)_2fr]">
          <Reveal>
            <StudentForm state={state} classes={classes} onAdd={(name, cls) => addStudent(name, cls)} />
          </Reveal>
          <Reveal delay={80} className="min-w-0">
            <StudentTable
              state={state}
              students={students}
              classes={classes}
              classFilter={effClass}
              onClassFilter={setClassFilter}
              onShowRecords={showRecords}
              onDelete={confirmDeleteStudent}
            />
          </Reveal>
          <Reveal className="min-w-0 lg:col-span-2">
            <BehindTable state={state} students={students} onShowRecords={showRecords} />
          </Reveal>
        </Container>
      </Section>

      <Section tight>
        <Container>
          <BracketCard className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <p className="max-w-xl text-body leading-display text-s-sub">
              Бүртгэл энэ компьютерийн браузерт хадгалагдана. Хуулбар авах бол Excel файл (CSV) болгон татаж авна уу.
            </p>
            <Actions>
              <Button onClick={exportCsv}>CSV татах</Button>
              <Button variant="link" onClick={confirmClear} className="text-danger! hover:opacity-70">
                Бүх бүртгэлийг устгах
              </Button>
            </Actions>
          </BracketCard>
        </Container>
      </Section>
    </>
  );
}
