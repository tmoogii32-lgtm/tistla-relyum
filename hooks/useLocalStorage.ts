"use client";

import { useCallback, useSyncExternalStore } from "react";

/* localStorage-ийг React-тэй синхрон байлгах жижиг store.
   Server болон анхны hydration дээр `fallback` буцаана. */

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

if (typeof window !== "undefined") {
  // Өөр табд өөрчлөгдөхөд шинэчлэх
  window.addEventListener("storage", (e) => {
    if (e.key) notify(e.key);
  });
}

function read<T>(key: string, fallback: T, validate: (v: unknown) => v is T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    /* хадгалалт хаалттай үед */
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (validate(parsed)) value = parsed;
    } catch {
      /* эвдэрсэн өгөгдөл — хоосноор эхэлнэ */
    }
  }
  cache.set(key, { raw, value });
  return value;
}

/**
 * localStorage-д JSON хадгалах state.
 * Хадгалж чадаагүй бол `onError` дуудагдана.
 */
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  validate: (v: unknown) => v is T,
  onError?: () => void,
) {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(cb);
      return () => listeners.get(key)?.delete(cb);
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback, validate),
    () => fallback,
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback, validate);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        onError?.();
        return;
      }
      notify(key);
    },
    [key, fallback, validate, onError],
  );

  return [value, setValue] as const;
}

/** Client дээр hydration дууссан эсэх (server дээр false) */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
