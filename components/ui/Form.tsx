import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** input / select / textarea-д нийтлэг хэв маяг */
export const inputClass =
  "w-full min-h-11 border border-s-border bg-s-bg px-3 py-2 text-label text-s-fg placeholder:text-s-faint transition-colors focus:border-accent focus:outline-none";

type FieldProps = {
  label: ReactNode;
  children: ReactNode;
  /** Шошгыг зөвхөн дэлгэц уншигчид харуулах */
  hideLabel?: boolean;
  className?: string;
};

/** Шошго + оролтын талбар */
export function Field({ label, children, hideLabel, className }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className={hideLabel ? "sr-only" : "text-eyebrow font-medium tracking-eyebrow uppercase text-s-sub"}>{label}</span>
      {children}
    </label>
  );
}

/** Маягтын алдааны мөр */
export function FormError({ id, children }: { id?: string; children?: ReactNode }) {
  return (
    <p id={id} role="alert" className="min-h-5 text-body text-danger">
      {children}
    </p>
  );
}
