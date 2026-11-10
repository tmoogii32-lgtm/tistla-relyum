"use client";

import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";

/* Нүүр хуудасны шууд тоолуур (Supabase: site_stats).
   Хуудас нээгдэх бүрд "hit_view" (+1 үзэлт) — хэн, хэдэн удаа орсныг ялгахгүй;
   refresh, дахин орох, сайт доторх шилжилт бүгд тоологдоно.
   Тоолуур дэлгэцэнд байх үед 30 сек тутам "site_stats"-аар шинэчилнэ. */

export type LiveStats = { views?: number; students?: number };

const POLL_MS = 30_000;
/** React-ийн dev горимд effect хоёр дахин ажилладаг — ижил хуудсыг 1 сек дотор давхар тоолохгүй */
const DEDUPE_MS = 1_000;

let data: LiveStats | null = null;
let last: { path: string; at: number } | null = null;
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

/** Нэг хуудасны үзэлт бүртгэнэ (`path` — нээгдсэн хуудас) */
export function recordVisit(path: string) {
  const now = Date.now();
  if (last && last.path === path && now - last.at < DEDUPE_MS) return;
  last = { path, at: now };
  void rpc("hit_view");
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!data) void rpc("site_stats"); // hit-ийн хариу ирээгүй бол одоогийн тоог авна
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
