"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoginCard, NewPasswordCard } from "@/components/hotsrogdol/TeacherAuth";
import { signOut, useTracker } from "@/components/hotsrogdol/useTracker";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const tab = (on: boolean) =>
  cn(
    "cursor-pointer border px-5 py-2.5 text-eyebrow font-semibold uppercase transition-colors",
    on ? "border-accent bg-accent text-foreground" : "border-s-border hover:border-accent",
  );

/**
 * /nevtrekh — Багш / Админ нэвтрэх, бүртгүүлэх, нууц үг сэргээх.
 * Багш — өөрийн и-мэйл + нийтлэг нууц үг (бүртгэлгүй бол автоматаар үүснэ).
 * ?role=admin — админ таб, ?mode=up — «бүртгэл үүсгэх» гарчигтай (нэвтрэхтэй адил). Админ нууц үг сэргээх холбоосоор орвол шинэ нууц үг тохируулна.
 */
export function SignInPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { status, email, isAdmin, recovery } = useTracker();
  const role = params.get("role") === "admin" ? "admin" : "teacher";

  if (recovery) return <NewPasswordCard email={email} />;

  if (status === "loading") {
    return (
      <p role="status" className="text-body text-s-sub">
        Ачаалж байна…
      </p>
    );
  }

  if (status === "signedOut") {
    const mode = params.get("mode") === "up" ? "up" : "in";
    const setRole = (r: "teacher" | "admin") => router.replace(r === "admin" ? `${pathname}?role=admin` : pathname, { scroll: false });
    return (
      <div className="flex flex-col gap-6">
        <div role="tablist" aria-label="Нэвтрэх төрөл" className="flex flex-wrap gap-2">
          <button type="button" role="tab" aria-selected={role === "teacher"} onClick={() => setRole("teacher")} className={tab(role === "teacher")}>
            Багш
          </button>
          <button type="button" role="tab" aria-selected={role === "admin"} onClick={() => setRole("admin")} className={tab(role === "admin")}>
            Админ
          </button>
        </div>
        {/* key — таб, горим солигдоход маягтыг шинэчилнэ */}
        <LoginCard key={`${role}-${mode}`} admin={role === "admin"} initialMode={mode} />
      </div>
    );
  }

  return (
    <BracketCard accent className="flex max-w-2xl flex-col gap-6 bg-s-raised p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">{isAdmin ? "Админ" : "Багш"}</p>
        <h2 className="font-display text-title leading-headline font-bold uppercase">Та нэвтэрсэн байна</h2>
        <p className="text-body text-s-sub">
          <strong className="text-s-fg">{email}</strong>
        </p>
        {role === "admin" && !isAdmin && (
          <p role="alert" className="text-body text-danger">
            Энэ бүртгэл админы эрхгүй. Админаар орох бол «Гарах» дараад админ бүртгэлээр нэвтэрнэ үү.
          </p>
        )}
      </div>
      <Actions>
        {isAdmin && <Button href="/admin">Админ хуудас</Button>}
        <Button href="/hotsrogdol#students">Багшийн хуудас</Button>
        <Button variant="link" onClick={() => void signOut()}>
          Гарах
        </Button>
      </Actions>
    </BracketCard>
  );
}
