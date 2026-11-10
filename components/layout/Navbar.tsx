"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { signOut, useTracker } from "@/components/hotsrogdol/useTracker";
import { NAV_LINKS } from "@/data/nav";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

const XL = 1280;

/**
 * Дээд цэс. ≥1280px-д нэг мөр, түүнээс бага үед burger → бүтэн дэлгэцийн sheet.
 * (хуучин navbar.js + design.js §5)
 */
export function Navbar() {
  const pathname = usePathname();
  const { status, email, isAdmin } = useTracker();
  const [open, setOpen] = useState(false);
  const sheetId = useId();

  // Хуудас солигдоход (буцах товч г.м.) хаах
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        document.getElementById(`${sheetId}-burger`)?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= XL) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, sheetId]);

  const isCurrent = (href: string) => !href.includes("#") && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header data-surface="light" className="sticky top-0 z-40 font-sans text-body uppercase">
      <div className="relative flex h-(--nav-h) items-center justify-between gap-8 border-b border-s-border bg-s-bg px-(--gutter)">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <Logo />
          <nav
            id={sheetId}
            aria-label="Үндсэн цэс"
            className={cn(
              "flex-1 items-center justify-center gap-5 leading-flat font-medium tracking-label 2xl:gap-8",
              open
                ? "fixed inset-x-0 top-(--nav-h) bottom-0 z-60 flex flex-col items-start justify-start gap-2 overflow-y-auto bg-background px-(--gutter) pt-8 pb-32 font-display text-[clamp(2.375rem,7vw,3.25rem)] leading-headline font-bold tracking-normal text-foreground"
                : "hidden xl:flex",
            )}
          >
            {NAV_LINKS.map((link, i) => {
              const current = isCurrent(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "relative transition-colors duration-150 ease-entrance hover:text-accent",
                    open ? "sheet-item whitespace-normal" : "whitespace-nowrap",
                    current &&
                      cn("after:absolute after:inset-x-0 after:h-0.5 after:bg-accent", open ? "after:-bottom-1" : "after:-bottom-2.5"),
                  )}
                  style={open ? { animationDelay: `${i * 55}ms` } : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          className={cn(
            "shrink-0 items-center gap-6 text-label leading-flat font-medium tracking-label",
            open ? "fixed inset-x-(--gutter) bottom-6 z-61 flex justify-between" : "hidden xl:flex",
          )}
        >
          {email ? (
            <>
              <Link href="/hotsrogdol#students" onClick={() => setOpen(false)} className="transition-colors hover:text-accent">
                Багш
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                  className="transition-colors hover:text-accent"
                >
                  Админ
                </Link>
              )}
              <button
                type="button"
                title={email}
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 font-bold uppercase transition-colors hover:text-accent"
              >
                <span aria-hidden="true" className="font-medium">
                  [
                </span>
                Гарах
                <span aria-hidden="true" className="font-medium">
                  ]
                </span>
              </button>
            </>
          ) : status === "signedOut" ? (
            <>
              <Link href="/nevtrekh" onClick={() => setOpen(false)} className="transition-colors hover:text-accent">
                Нэвтрэх
              </Link>
              <Link
                href="/nevtrekh?mode=up"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 font-bold transition-colors hover:text-accent"
              >
                <span aria-hidden="true" className="font-medium">
                  [
                </span>
                Бүртгүүлэх
                <span aria-hidden="true" className="font-medium">
                  →
                </span>
                <span aria-hidden="true" className="font-medium">
                  ]
                </span>
              </Link>
            </>
          ) : null}
        </div>

        <button
          id={`${sheetId}-burger`}
          type="button"
          aria-expanded={open}
          aria-controls={sheetId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-11 cursor-pointer flex-col justify-center gap-[0.4375rem] px-2 xl:hidden"
        >
          <span className="sr-only">Цэс</span>
          <span
            aria-hidden="true"
            className={cn("block h-px bg-s-fg transition-transform duration-250 ease-plate", open && "translate-y-1 rotate-45")}
          />
          <span
            aria-hidden="true"
            className={cn("block h-px bg-s-fg transition-transform duration-250 ease-plate", open && "-translate-y-1 -rotate-45")}
          />
        </button>
      </div>
    </header>
  );
}
