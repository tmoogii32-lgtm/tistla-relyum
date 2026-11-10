"use client";

import Link from "next/link";
import { useState } from "react";
import { BehindTable, RecordTable } from "@/components/hotsrogdol/parts";
import { useTracker } from "@/components/hotsrogdol/useTracker";
import { BracketCard } from "@/components/ui/BracketCard";
import { Field, inputClass } from "@/components/ui/Form";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TOPICS } from "@/lib/problems";
import { GUEST } from "@/lib/taskProgress";
import { compareStudents } from "@/lib/tracker";
import { Workspace } from "./Workspace";

const isString = (v: unknown): v is string => typeof v === "string";
const linkCls = "underline decoration-accent decoration-2 underline-offset-4 hover:text-accent";

export function StepTitle({ n, title, text, id }: { n: number; title: string; text: string; id: string }) {
  return (
    <div id={id} className="flex scroll-mt-4 flex-col gap-2 border-t border-s-border pt-10">
      <p className="flex items-center gap-3">
        <span className="grid size-9 place-items-center bg-accent font-display text-title font-bold text-foreground">{n}</span>
        <span className="font-display text-heading leading-headline font-bold uppercase">{title}</span>
      </p>
      <p className="max-w-3xl text-body leading-display text-s-sub">{text}</p>
    </div>
  );
}

/**
 * Даалгавартай ажиллах хуудас: сурагч → ① түвшинчилсэн даалгавар → ② автомат дүнгийн бүртгэл.
 * Оношлох сорил "Хоцрогдлыг тооцох" хуудсанд.
 */
export function Hub() {
  const { state: tracker, status, addRecord, deleteRecord } = useTracker();
  const [studentId, setStudentId] = useLocalStorage<string>("daalgavar-student", GUEST, isString);

  const students = [...tracker.students].sort(compareStudents);
  const student = students.find((s) => s.id === studentId);
  const sid = student ? student.id : GUEST;

  // "Хоцрогдлыг тооцох" хуудасны зөвлөгөөнөөс ч сэдэв сонгогддог тул хадгална
  const [topicId, setTopicId] = useLocalStorage<string>("daalgavar-topic", TOPICS[0].id, isString);
  const [recordSel, setRecordSel] = useState<string | null>(null);

  const confirmDeleteRecord = (id: string) => {
    if (confirm("Энэ дүнгийн бүртгэлийг устгах уу?")) deleteRecord(id);
  };

  const recSelected = recordSel ?? (student ? student.id : "");

  return (
    <div className="flex flex-col gap-10">
      {/* Сурагч сонгох */}
      <BracketCard className="flex flex-col gap-4 bg-s-raised md:flex-row md:items-end md:justify-between">
        <Field label="Сурагч" className="md:w-96">
          <select
            value={sid}
            onChange={(e) => {
              setStudentId(e.target.value);
              setRecordSel(null);
            }}
            disabled={status === "loading"}
            className={inputClass}
          >
            <option value={GUEST}>{status === "loading" ? "Ачаалж байна…" : "Зочин (бүртгэлгүй)"}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.cls})
              </option>
            ))}
          </select>
        </Field>
        <p className="max-w-xl text-body leading-display text-s-sub">
          {student ? (
            <>
              Даалгавар бүрийн дүн <strong className="text-s-fg">{student.name}</strong>-ийн нэр дээр{" "}
              <a href="#burtgel" className={linkCls}>
                дүнгийн бүртгэлд
              </a>{" "}
              автоматаар орно. Хоцрогдлоо мэдэхгүй бол эхлээд{" "}
              <Link href="/hotsrogdol#onosh" className={linkCls}>
                оношлох сорил
              </Link>{" "}
              өг.
            </>
          ) : status === "signedOut" ? (
            <>
              Зочин горимд явц энэ браузерт хадгалагдах ч дүн бүртгэгдэхгүй. Сурагчийн дүнг бүртгэхийн тулд багш{" "}
              <Link href="/hotsrogdol#students" className={linkCls}>
                нэвтэрнэ үү →
              </Link>
            </>
          ) : (
            <>
              Зочин горимд явц энэ браузерт хадгалагдах ч дүн бүртгэгдэхгүй.{" "}
              <Link href="/hotsrogdol#students" className={linkCls}>
                Сурагч бүртгэх →
              </Link>
            </>
          )}
        </p>
      </BracketCard>

      {/* ① Даалгавартай ажиллах */}
      <StepTitle
        n={1}
        id="ajillah"
        title="Даалгавартай ажиллах"
        text="Сэдвээ сонгоод R1-ээс эхэл. Түвшин бүр 3 даалгавартай, даалгавар бүр 5 бодлоготой; 4 ба түүнээс дээш зөв бол тэнцэж, 3 даалгавраа давбал дараагийн түвшин нээгдэнэ."
      />
      <Workspace sid={sid} student={student} topicId={topicId} onTopic={setTopicId} addRecord={addRecord} />

      {/* ② Дүнгийн бүртгэл */}
      <StepTitle
        n={2}
        id="burtgel"
        title="Дүнгийн бүртгэл"
        text="Оношлох сорил болон даалгавар бүрийн дүн энд автоматаар бүртгэгдэнэ. Даалгавар, түвшин бүрийн хамгийн сүүлийн дүн 4-өөс доош бол хоцрогдолтойд тооцогдоно."
      />
      <div className="grid gap-6">
        <RecordTable state={tracker} students={students} selected={recSelected} onSelect={setRecordSel} onDelete={confirmDeleteRecord} />
        <BehindTable
          state={tracker}
          students={recSelected ? students.filter((s) => s.id === recSelected) : students}
          onShowRecords={(id) => setRecordSel(id)}
        />
      </div>
    </div>
  );
}
