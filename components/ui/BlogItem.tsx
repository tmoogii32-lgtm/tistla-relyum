import Link from "next/link";
import { cn } from "@/lib/cn";
import { Plate } from "./Plate";

type Props = {
  image: string;
  title: string;
  text: string;
  alt?: string;
  /** Карт бүхэлдээ холбоос болно */
  href?: string;
  /** Картын доор "Read more" маягийн холбоос */
  cta?: { label: string; href: string };
  titleAs?: "h3" | "p";
  className?: string;
};

/** Зураг + гарчиг + тайлбартай мөр (Хүүхэд судлал, Нийтлэл) */
export function BlogItem({ image, title, text, alt = "", href, cta, titleAs: Title = "h3", className }: Props) {
  const body = (
    <>
      <Plate src={image} alt={alt} sizes="160px" className="h-[6.6875rem] w-40 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Title className="font-display text-title leading-headline font-bold uppercase transition-colors duration-150 group-hover:text-accent">
            {title}
          </Title>
          <p className="text-body leading-display text-s-sub">{text}</p>
        </div>
        {cta && (
          <a
            href={cta.href}
            className="self-start text-eyebrow font-medium tracking-eyebrow uppercase underline decoration-accent decoration-2 underline-offset-[0.3em] transition-colors hover:text-accent"
          >
            {cta.label}
          </a>
        )}
      </div>
    </>
  );

  const cls = cn("group flex items-start gap-6 py-2", className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  return <article className={cls}>{body}</article>;
}
