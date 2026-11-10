import type { Metadata } from "next";
import { Tracker } from "@/components/hotsrogdol/Tracker";

export const metadata: Metadata = { title: "Хоцрогдлыг тооцох" };

export default function HotsrogdolPage() {
  return <Tracker />;
}
