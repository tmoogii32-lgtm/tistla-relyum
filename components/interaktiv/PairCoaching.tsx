"use client";

import { useState, type SubmitEvent } from "react";
import { BracketCard } from "@/components/ui/BracketCard";
import { Actions, Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Form";
import { PAIR, type PairVariant } from "@/data/interaktiv";
import { answerText, judge } from "@/lib/judge";
import { cn } from "@/lib/cn";
import { AnswerField, Feedback, Tag, Timer, type Tone } from "./shared";

/** Шатуудын явц */
function Rounds({ round }: { round: number }) {
  return (
    <ol aria-label="Шатууд" className="flex flex-wrap gap-2">
      {PAIR.map((p, i) => (
        <li
          key={p.topic}
          aria-current={i === round ? "step" : undefined}
          className={cn(
            "border px-3 py-2 text-eyebrow font-medium tracking-eyebrow uppercase",
            i < round && "border-ok bg-ok/10 text-ok",
            i === round && "border-accent bg-accent text-foreground",
            i > round && "border-s-border text-s-sub",
          )}
        >
          {i + 1}. {p.topic}
        </li>
      ))}
    </ol>
  );
}

function RoleCard({ role, name, text, active }: { role: string; name: string; text: string; active?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1 border p-4", active ? "border-accent bg-accent-muted" : "border-s-border")}>
      <small className="text-eyebrow tracking-eyebrow uppercase text-s-sub">{role}</small>
      <strong className="font-display text-title leading-headline uppercase">{name}</strong>
      <span className="text-body text-s-sub">{text}</span>
    </div>
  );
}

/** Нэг хувилбарын бодлого + дасгалжуулагчийн хянах хуудас */
function PairQuestion({ item, variant, name, check, onAnswered }: {
  item: PairVariant;
  variant: "A" | "B";
  name: string;
  check: string[];
  onAnswered: () => void;
}) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<{ tone: Tone; text: string } | null>(null);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    const res = judge(item, value);
    if (res === "empty") return setFeedback({ tone: "neutral", text: "Хариугаа оруулна уу." });
    if (res === "unreduced") return setFeedback({ tone: "warn", text: "Утга зөв — бутархайгаа хураа." });
    setFeedback(
      res === "ok"
        ? { tone: "ok", text: `Зөв! ${item.sol}` }
        : { tone: "bad", text: `Буруу. Дасгалжуулагч хянах хуудсаар алдааг хамт олоорой. (Зөв хариу: ${answerText(item)})` },
    );
    onAnswered();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <BracketCard className="bg-s-raised p-6 sm:p-8">
        <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-5">
          <div>
            <Tag>Хувилбар {variant}</Tag>
          </div>
          <p className="text-lead leading-display font-medium">{item.q}</p>
          <AnswerField item={item} name={name} value={value} onChange={setValue} />
          <Actions>
            <Button type="submit">Хариу шалгах</Button>
          </Actions>
          <Feedback tone={feedback?.tone}>{feedback?.text}</Feedback>
        </form>
      </BracketCard>
      <fieldset className="flex flex-col gap-3 border border-s-border p-6">
        <legend className="px-2 font-display text-label font-bold uppercase">Дасгалжуулагчийн хянах хуудас</legend>
        {check.map((c) => (
          <label key={c} className="flex cursor-pointer items-start gap-3 text-body leading-display">
            <input type="checkbox" className="mt-1 size-4 accent-accent" />
            <span>{c}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

/** Хосоор: "Нэг нь бодно, нөгөө нь дасгалжуулна", шат бүрт A/B хувилбар */
export function PairCoaching() {
  const [names, setNames] = useState(["", ""]);
  const [round, setRound] = useState(0);
  const [turn, setTurn] = useState<"A" | "B">("A");
  const [answered, setAnswered] = useState(false);

  const n1 = names[0].trim() || "1-р сурагч";
  const n2 = names[1].trim() || "2-р сурагч";
  const solver = turn === "A" ? n1 : n2;
  const coach = turn === "A" ? n2 : n1;
  const finished = round >= PAIR.length;

  const next = () => {
    setAnswered(false);
    if (turn === "A") setTurn("B");
    else {
      setTurn("A");
      setRound((r) => r + 1);
    }
  };

  const restart = () => {
    setRound(0);
    setTurn("A");
    setAnswered(false);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Field key={i} label={`${i + 1}-р сурагч`}>
            <input
              type="text"
              maxLength={30}
              placeholder="Нэр"
              value={names[i]}
              onChange={(e) => setNames((ns) => ns.map((v, j) => (j === i ? e.target.value : v)))}
              className={inputClass}
            />
          </Field>
        ))}
      </div>

      {finished ? (
        <BracketCard accent className="flex flex-col gap-4 bg-ok/10 p-6 sm:p-8">
          <h4 className="font-display text-heading leading-headline font-bold uppercase">Сайн хамтарлаа! 5 шатыг бүгдийг давлаа.</h4>
          <p className="text-body leading-display text-s-sub">
            Хоёулаа ярилц: Аль алхам хамгийн хэцүү байсан бэ? Дасгалжуулагчийн ямар асуулт хамгийн их тус болсон бэ?
          </p>
          <Actions>
            <Button onClick={restart}>Дахин эхлэх</Button>
          </Actions>
        </BracketCard>
      ) : (
        <div className="flex flex-col gap-6">
          <Rounds round={round} />
          <div className="grid gap-4 sm:grid-cols-2">
            <RoleCard role="Бодогч" name={solver} text="Чангаар тайлбарлан бодно" active />
            <RoleCard role="Дасгалжуулагч" name={coach} text="Хянах хуудсаар ажиглаж, асуулт асууна" />
          </div>
          <Timer key={`t-${round}-${turn}`} seconds={180} label="Бодох хугацаа" />
          <PairQuestion
            key={`q-${round}-${turn}`}
            item={PAIR[round][turn]}
            variant={turn}
            name={`pair-${round}-${turn}`}
            check={PAIR[round].check}
            onAnswered={() => setAnswered(true)}
          />
          {answered && (
            <Actions>
              <Button onClick={next}>
                {turn === "A" ? "Үүрэг солих → Хувилбар B" : round + 1 < PAIR.length ? "Дараагийн шат" : "Дуусгах"}
              </Button>
            </Actions>
          )}
        </div>
      )}
    </>
  );
}
