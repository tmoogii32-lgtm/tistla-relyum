import Link from "next/link";

const linkClass = "underline decoration-accent decoration-2 underline-offset-[0.2em] transition-colors hover:text-accent";

/** "... {link} ..." хэлбэрийн текстэд холбоос шигтгэнэ (data/*.ts-ийн өгөгдлөөс) */
export function LinkedText({ text, link }: { text: string; link?: { label: string; href: string } }) {
  if (!link || !text.includes("{link}")) return <>{text}</>;
  const [before, after] = text.split("{link}");
  return (
    <>
      {before}
      <Link href={link.href} className={linkClass}>
        {link.label}
      </Link>
      {after}
    </>
  );
}

/** Энгийн доогуур зураастай дотоод холбоос */
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener" className={linkClass}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}
