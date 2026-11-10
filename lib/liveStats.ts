"use client";

import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";

/* Нүүр хуудасны шууд тоолуур (Supabase: site_stats).
   Сайт ачаалагдах бүрд нэг удаа "hit_view" (+1 үзэлт; хэн, хэдэн удаа орсныг ялгахгүй),
   тоолуур дэлгэцэнд байх үед 30 сек тутам "site_stats"-аар шинэчилнэ. */

export type LiveStats = { views?: number; students?: number };

const POLL_MS = 30_000;

let data: LiveStats | null = null;
let hit = false;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function apply(next: unknown) {
  if (!next || typeof next !== "object") return;
  const n = next as Record<string, unknown>;
  const pick = (k: string) => (typeof n[k] === "number" ? (n[k] as number) : Number.isFinite(Number(n[k])) ? Number(n[k]) : undefined);
  data = { ...data, views: pick("views") ?? data?.views, students: pick("students") ?? data?.students };
  listeners.forEach((l) => l());
}

function rpc(fn: "hit_view" | "site_stats") {
  try {
    return getSupabase()
      .rpc(fn)
      .then(({ data: d, error }) => {
        if (!error) apply(d);
      });
  } catch {
    return Promise.resolve(); // Supabase тохиргоогүй — анхны тоо үлдэнэ
  }
}

/** Сайтын үзэлтийг нэг удаа бүртгэнэ (хуудас ачаалах бүрд; сайт доторх шилжилтэд дахин тоолохгүй) */
export function recordVisit() {
  if (hit) return;
  hit = true;
  void rpc("hit_view");
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  recordVisit();
  if (!timer) {
    timer = setInterval(() => {
      if (!document.hidden) void rpc("site_stats");
    }, POLL_MS);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Шууд өгөгдөл. Хариу ирээгүй бол null. */
export function useLiveStats() {
  return useSyncExternalStore(
    subscribe,
    () => data,
    () => null,
  );
}
