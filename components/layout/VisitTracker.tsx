"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/liveStats";

/** Аль ч хуудсаар орсон бай, сайт ачаалагдах бүрд нэг үзэлт бүртгэнэ */
export function VisitTracker() {
  useEffect(() => recordVisit(), []);
  return null;
}
