import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/effects/Reveal";
import { SplitHeading } from "@/components/effects/SplitHeading";

/** Жижиг шошго — цайвар дээр accent дөрвөлжинтэй, харанхуй дээр accent өнгөтэй */
export function Tagline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "eyebrow-mark inline-flex items-center gap-2 text-eyebrow leading-flat font-medium tracking-eyebrow uppercase text-s-eyebrow",
        className,
      )}
    >
      {children}
    </p>
  );
}

const HEADING_SIZE = {
  h1: "text-impact",
  h2: "text-display-sm",
} as const;

type HeadingProps = {
  children: string;
  as?: "h1" | "h2";
  /** Хэмжээ: h1 = impact (hero), h2 = display */
  size?: "h1" | "h2";
  className?: string;
  center?: boolean;
};

/** Гол гарчиг: Oswald, том үсэг, төгсгөлд цэг, доор accent зураас, үг үгээр гарна */
export function Heading({ children, as = "h2", size, className, center }: HeadingProps) {
  return (
    <SplitHeading
      as={as}
      text={children}
      className={cn(
        "heading-mark font-display leading-headline font-bold uppercase text-s-heading",
        HEADING_SIZE[size ?? as],
        center && "[--mark-x:50%]",
        className,
      )}
    />
  );
}

/** Гарчгийн доорх тайлбар текст */
export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-lead leading-display text-s-sub", className)}>{children}</p>;
}

type SectionTitleProps = {
  tagline?: ReactNode;
  title: string;
  lead?: ReactNode;
  as?: "h1" | "h2";
  center?: boolean;
  className?: string;
};

/** Tagline + гарчиг + тайлбар — хуучин `.section-title` */
export function SectionTitle({ tagline, title, lead, as = "h2", center, className }: SectionTitleProps) {
  return (
    <div className={cn("flex flex-col gap-4", center ? "items-center text-center" : "items-start", className)}>
      {tagline && (
        <Reveal>
          <Tagline>{tagline}</Tagline>
        </Reveal>
      )}
      <div className={cn("flex flex-col gap-6", center && "items-center")}>
        <Heading as={as} size="h2" center={center}>
          {title}
        </Heading>
        {lead && (
          <Reveal>
            <Lead className={center ? "mx-auto max-w-3xl" : "max-w-3xl"}>{lead}</Lead>
          </Reveal>
        )}
      </div>
    </div>
  );
}
