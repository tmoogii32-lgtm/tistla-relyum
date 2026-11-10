"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { EMPTY_STATE, isTrackerState, uid, type Student, type TaskRecord, type TrackerState } from "@/lib/tracker";

/** Хуучин сайтын түлхүүр — өмнө хадгалсан бүртгэл шууд уншигдана */
const STORAGE_KEY = "hotsrogdol-v1";

const onSaveError = () => alert("Бүртгэлийг хадгалж чадсангүй. Браузерын тохиргоог шалгана уу.");

/** Сурагч ба даалгаврын бүртгэл (браузерын localStorage) */
export function useTracker() {
  const [state, setState] = useLocalStorage<TrackerState>(STORAGE_KEY, EMPTY_STATE, isTrackerState, onSaveError);

  const addStudent = useCallback(
    (name: string, cls: string) => {
      const student: Student = { id: uid(), name, cls, created: Date.now() };
      setState((s) => ({ ...s, students: [...s.students, student] }));
      return student;
    },
    [setState],
  );

  const deleteStudent = useCallback(
    (id: string) =>
      setState((s) => ({
        students: s.students.filter((x) => x.id !== id),
        records: s.records.filter((r) => r.studentId !== id),
      })),
    [setState],
  );

  const addRecord = useCallback(
    (rec: Omit<TaskRecord, "id" | "created">) =>
      setState((s) => ({ ...s, records: [...s.records, { ...rec, id: uid(), created: Date.now() }] })),
    [setState],
  );

  const deleteRecord = useCallback(
    (id: string) => setState((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) })),
    [setState],
  );

  const clearAll = useCallback(() => setState(EMPTY_STATE), [setState]);

  return { state, addStudent, deleteStudent, addRecord, deleteRecord, clearAll };
}
