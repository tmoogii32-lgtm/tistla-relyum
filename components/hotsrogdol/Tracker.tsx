"use client";

import { useState } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/Typography";
import { downloadCsv } from "@/lib/csv";
import { compareStudents, recordsOf, toCsvRows, today, unique, type Student } from "@/lib/tracker";
import { BehindTable, ExamLinkCard, RecordTable, StudentForm, StudentTable, TaskForm, TrackerSummary } from "./parts";
import { useTracker } from "./useTracker";

/**
 * Хоцрогдлыг тооцох — бүх хэсэг нэг state хуваалцана
 * (шүүлтүүр, сонгосон сурагч гэх мэт).
 */
export function Tracker() {
  const { state, addStudent, deleteStudent, addRecord, deleteRecord, clearAll } = useTracker();
  const [classFilter, setClassFilter] = useState("");
  const [recordStudent, setRecordStudent] = useState("");
  const [taskStudent, setTaskStudent] = useState("");

  const students = [...state.students].sort(compareStudents);
  const classes = unique(students.map((s) => s.cls));
  const taskNames = unique(state.records.map((r) => r.task)).sort();

  // Устгагдсан утгыг сонгосон хэвээр үлдээхгүй
  const exists = (id: string) => students.some((s) => s.id === id);
  const effClass = classes.includes(classFilter) ? classFilter : "";
  const effRecord = exists(recordStudent) ? recordStudent : "";
  const effTask = exists(taskStudent) ? taskStudent : "";

  const showRecords = (id: string) => {
    setRecordStudent(id);
    setTaskStudent(id);
    document.getElementById("tasks")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const confirmDeleteStudent = (s: Student) => {
    const count = recordsOf(state, s.id).length;
    const msg = `${s.name} сурагчийг устгах уу?` + (count ? `\nТүүний ${count} даалгаврын бүртгэл мөн устна.` : "");
    if (confirm(msg)) deleteStudent(s.id);
  };

  const confirmDeleteRecord = (id: string) => {
    if (confirm("Энэ даалгаврын бүртгэлийг устгах уу?")) deleteRecord(id);
  };

  const exportCsv = () => {
    if (!state.students.length) return alert("Татах бүртгэл алга байна.");
    downloadCsv(toCsvRows(state), `hotsrogdol-${today()}.csv`);
  };

  const confirmClear = () => {
    if (!state.students.length && !state.records.length) return;
    if (confirm("Бүх сурагч болон даалгаврын бүртгэлийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.")) clearAll();
  };

  return (
    <>
      <Section>
        <Container className="flex flex-col gap-12">
          <SectionTitle
            as="h1"
            tagline="Багшийн хэрэгсэл"
            title="Хоцрогдлыг тооцох"
            lead="Шалгалт өгөх сурагчдыг бүртгээд даалгавар бүрийн дүнг тухайн сурагчид оруулна. Даалгавар бүр 5 бодлоготой; 4-өөс доош зөв бодсон бол хоцрогдолтой гэж тооцно."
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
            <StudentForm
              state={state}
              classes={classes}
              onAdd={(name, cls) => setTaskStudent(addStudent(name, cls).id)}
            />
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
        </Container>
      </Section>

      <Section id="tasks" tight>
        <Container className="grid items-start gap-8 lg:grid-cols-[minmax(18rem,1fr)_2fr]">
          <Reveal>
            <TaskForm
              students={students}
              taskNames={taskNames}
              studentId={effTask}
              onStudent={setTaskStudent}
              onAdd={(rec) => {
                addRecord(rec);
                setRecordStudent(rec.studentId);
              }}
            />
          </Reveal>
          <Reveal delay={80} className="min-w-0">
            <RecordTable
              state={state}
              students={students}
              selected={effRecord}
              onSelect={setRecordStudent}
              onDelete={confirmDeleteRecord}
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
