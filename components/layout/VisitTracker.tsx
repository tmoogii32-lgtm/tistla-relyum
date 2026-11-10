"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordVisit } from "@/lib/liveStats";

/** Хуудас нээгдэх бүрд (refresh, дахин орох, сайт доторх шилжилт) нэг үзэлт бүртгэнэ */
export function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => recordVisit(pathname), [pathname]);
  return null;
}
