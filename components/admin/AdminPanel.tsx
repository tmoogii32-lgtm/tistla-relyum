"use client";

import { useState } from "react";
import { AccountBar, LoginCard } from "@/components/hotsrogdol/TeacherAuth";
import { useTracker } from "@/components/hotsrogdol/useTracker";
import { BracketCard } from "@/components/ui/BracketCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Analytics } from "./Analytics";
import { RecordsTable, StudentsTable, SubmissionsTable, TeachersTable } from "./Tables";
import { useAdminData } from "./useAdminData";

const TABS = [
  { id: "analytics", label: "Судалгаа" },
  { id: "subs", label: "Сорилын хариулт" },
  { id: "students", label: "Сурагчид" },
  { id: "records", label: "Дүнгийн бүртгэл" },
  { id: "teachers", label: "Багш нар" },
] as const;
type Tab = (typeof TABS)[number]["id"];

/** Админ: нэвтрэлт → эрх шалгах → судалгаа, засах хүснэгтүүд */
export function AdminPanel() {
  const { status, email } = useTracker();
  const api = useAdminData(status === "signedOut" ? null : email);
  const [tab, setTab] = useState<Tab>("analytics");

  if (status === "loading") return <Status>Ачаалж байна…</Status>;
  if (status === "signedOut") return <LoginCard />;

  return (
    <div className="flex flex-col gap-8">
      <AccountBar email={email} />

      {api.status === "loading" && <Status>Бүх багшийн өгөгдлийг ачаалж байна…</Status>}

      {api.status === "forbidden" && (
        <BracketCard className="flex max-w-2xl flex-col gap-3 bg-s-raised p-6 sm:p-8">
          <h2 className="font-display text-title font-bold uppercase">Админы эрх алга</h2>
          <p className="text-body leading-display text-s-sub">
            Энэ хуудсыг зөвхөн админ харна. Хэрэв та админ бол <code>supabase/migrations/20261111000000_admin_role.sql</code> файлыг Supabase-ийн SQL
            Editor-т ажиллуулсан эсэхээ шалгаад хуудсаа дахин ачаална уу.
          </p>
        </BracketCard>
      )}

      {api.status === "error" && (
        <BracketCard className="flex flex-col items-start gap-4 bg-danger/10 p-6">
          <p role="alert" className="text-body">
            Өгөгдлийг ачаалж чадсангүй. Интернэт холболтоо шалгана уу.
          </p>
          <Button onClick={api.reload}>Дахин оролдох</Button>
        </BracketCard>
      )}

      {api.status === "ready" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div role="tablist" aria-label="Админы хэсгүүд" className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "cursor-pointer border px-4 py-2 text-eyebrow font-semibold uppercase transition-colors",
                    tab === t.id ? "border-accent bg-accent text-foreground" : "border-s-border hover:border-accent",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Button variant="link" onClick={api.reload}>
              Шинэчлэх
            </Button>
          </div>

          <div role="tabpanel">
            {tab === "analytics" && <Analytics api={api} />}
            {tab === "subs" && <SubmissionsTable api={api} />}
            {tab === "students" && <StudentsTable api={api} />}
            {tab === "records" && <RecordsTable api={api} />}
            {tab === "teachers" && <TeachersTable api={api} />}
          </div>
        </>
      )}
    </div>
  );
}

function Status({ children }: { children: string }) {
  return (
    <p role="status" className="text-body text-s-sub">
      {children}
    </p>
  );
}
