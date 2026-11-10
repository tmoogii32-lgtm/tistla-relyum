"use client";

import { useSearchParams } from "next/navigation";
import { LoginCard } from "@/components/hotsrogdol/TeacherAuth";
import { signOut, useTracker } from "@/components/hotsrogdol/useTracker";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";

/** /nevtrekh — багш, админ нэвтрэх / бүртгүүлэх; нэвтэрсэн бол хаашаа орохыг санал болгоно */
export function SignInPanel() {
  const params = useSearchParams();
  const { status, email, isAdmin } = useTracker();

  if (status === "loading") {
    return (
      <p role="status" className="text-body text-s-sub">
        Ачаалж байна…
      </p>
    );
  }

  if (status === "signedOut") {
    // ?mode=up — "Бүртгүүлэх" холбоосоор орсон; key нь горим солигдоход маягтыг шинэчилнэ
    const mode = params.get("mode") === "up" ? "up" : "in";
    return <LoginCard key={mode} initialMode={mode} />;
  }

  return (
    <BracketCard accent className="flex max-w-2xl flex-col gap-6 bg-s-raised p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow font-medium tracking-eyebrow uppercase text-accent">{isAdmin ? "Админ" : "Багш"}</p>
        <h2 className="font-display text-title leading-headline font-bold uppercase">Та нэвтэрсэн байна</h2>
        <p className="text-body text-s-sub">
          <strong className="text-s-fg">{email}</strong>
        </p>
      </div>
      <Actions>
        <Button href="/hotsrogdol#students">Багшийн хуудас</Button>
        {isAdmin && <Button href="/admin">Админ хуудас</Button>}
        <Button variant="link" onClick={() => void signOut()}>
          Гарах
        </Button>
      </Actions>
    </BracketCard>
  );
}
