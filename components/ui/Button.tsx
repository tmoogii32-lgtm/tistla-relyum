import Link from "next/link";
import Image from "next/image";
import type { ReactNode, MouseEventHandler } from "react";
import { cn } from "@/lib/cn";
import { isExternal } from "@/lib/site";

/* Ташуу булантай товчны хэлбэр (хуучин design.js §1) */
const BODY = "M220 42L212.932 50H0V0H220V42Z";
const TICKS = "M205 49.5H213L219.5 42V36M212 0.5H219.5V7M8 0.5H0.5V7M7.5 49.5H0.5V42.5";
const ARROW = "M0 5.35H13M8 10.35L13 5.35L8 0.35";

type Common = {
  children: ReactNode;
  /** solid: ташуу булантай (харанхуй гадаргуу дээр автоматаар хоосон хүрээтэй), link: текст + сум */
  variant?: "solid" | "link";
  className?: string;
};

type AsLink = Common & { href: string; external?: boolean; onClick?: never; type?: never; disabled?: never };
type AsButton = Common & {
  href?: undefined;
  external?: never;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  disabled?: boolean;
};
/** Өөр холбоос дотор байрлах үед (жишээ нь FeatureCard) зөвхөн харагдах хэлбэр */
type AsSpan = Common & { as: "span"; href?: never };

export type ButtonProps = AsLink | AsButton | AsSpan;

function solidInner(children: ReactNode) {
  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 -z-10 size-full overflow-visible"
        viewBox="0 0 220 50"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d={BODY} style={{ fill: "var(--s-btn-body)" }} />
        <path
          d={BODY}
          className="origin-left scale-x-0 fill-accent transition-transform duration-250 ease-plate [transform-box:fill-box] group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
        <path d={BODY} className="fill-none stroke-accent/25 [vector-effect:non-scaling-stroke]" />
        <path d={TICKS} className="fill-none stroke-accent [vector-effect:non-scaling-stroke]" />
      </svg>
      <span>{children}</span>
      <svg
        className="h-[0.6875rem] w-[0.8125rem] shrink-0 overflow-visible fill-none stroke-current stroke-[1.5] transition-transform duration-150 ease-entrance group-hover:translate-x-1 group-focus-visible:translate-x-1"
        viewBox="0 0 13.5 10.7"
        aria-hidden="true"
        focusable="false"
      >
        <path d={ARROW} />
      </svg>
    </>
  );
}

function linkInner(children: ReactNode) {
  return (
    <>
      {children}
      <Image
        src="/assets/chevron-right.svg"
        width={24}
        height={24}
        alt=""
        className="icon-adapt size-6 transition-transform duration-150 ease-entrance group-hover:translate-x-1"
      />
    </>
  );
}

const SOLID =
  "group relative isolate inline-flex h-[3.125rem] min-w-40 cursor-pointer items-center justify-between gap-4 whitespace-nowrap pr-6 pl-5 font-sans text-title leading-flat font-medium uppercase text-accent transition-colors duration-150 ease-entrance hover:text-foreground focus-visible:text-foreground group-hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 max-sm:w-full";
const LINK =
  "group inline-flex cursor-pointer items-center gap-1 font-sans text-label leading-flat font-medium uppercase text-s-fg transition-colors duration-150 ease-entrance hover:text-accent";

export function Button(props: ButtonProps) {
  const { children, variant = "solid", className } = props;
  const cls = cn(variant === "solid" ? SOLID : LINK, className);
  const inner = variant === "solid" ? solidInner(children) : linkInner(children);

  if ("as" in props && props.as === "span") {
    return <span className={cls}>{inner}</span>;
  }

  if (props.href !== undefined) {
    const external = props.external ?? isExternal(props.href);
    if (external) {
      return (
        <a href={props.href} target="_blank" rel="noopener" className={cls}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {inner}
      </Link>
    );
  }

  const { onClick, type = "button", disabled } = props as AsButton;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/** Товчнуудын мөр — утсан дээр босоо */
export function Actions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-6 max-sm:w-full max-sm:flex-col max-sm:items-stretch", className)}>
      {children}
    </div>
  );
}
