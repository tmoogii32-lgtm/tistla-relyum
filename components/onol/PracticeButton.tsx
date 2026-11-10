"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TOPICS } from "@/lib/problems";

const isString = (v: unknown): v is string => typeof v === "string";

/** "Даалгавартай ажиллах" хуудсыг тухайн сэдвээр нээнэ */
export function PracticeButton({ topicId, label }: { topicId: string; label: string }) {
  const router = useRouter();
  const [, setTopic] = useLocalStorage<string>("daalgavar-topic", TOPICS[0].id, isString);
  return (
    <Button
      onClick={() => {
        setTopic(topicId);
        router.push("/daalgavar#ajillah");
      }}
    >
      {label}
    </Button>
  );
}
