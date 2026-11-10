"use client";

import { useSyncExternalStore } from "react";
import { STATS_URL } from "./site";

/* Нүүр хуудасны шууд тоолуурын өгөгдөл (google-form/counter-webapp.gs).
   Хуудас нээгдэхэд нэг удаа "hit", дараа нь 30 сек тутам "stats". */

export type LiveStats = { views?: number; students?: number };

const POLL_MS = 30_000;
const VALID = /^https:\/\/script\.google(usercontent)?\.com\//;

let data: LiveStats | null = null;
let started = false;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function request(action: "hit" | "stats") {
  const url = STATS_URL.trim();
  const sep = url.includes("?") ? "&" : "?";
  return fetch(`${url}${sep}action=${action}`, { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<LiveStats>;
  });
}

function apply(next: LiveStats) {
  data = { ...data, ...next };
  listeners.forEach((l) => l());
}

function start() {
  if (started || !VALID.test(STATS_URL.trim())) return;
  started = true;
  request("hit").then(apply).catch(() => {
    /* сүлжээгүй үед анхны тоо үлдэнэ */
  });
  timer = setInterval(() => {
    if (!document.hidden) request("stats").then(apply).catch(() => {});
  }, POLL_MS);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  start();
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
      started = false;
    }
  };
}

/** Шууд өгөгдөл. STATS_URL тохируулаагүй эсвэл хариу ирээгүй бол null. */
export function useLiveStats() {
  return useSyncExternalStore(
    subscribe,
    () => data,
    () => null,
  );
}
