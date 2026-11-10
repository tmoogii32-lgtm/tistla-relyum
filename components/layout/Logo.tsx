import Image from "next/image";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Нүүр хуудас" className={`relative block h-8 w-21 shrink-0 ${className ?? ""}`}>
      <Image src="/assets/logo.png" alt="Сургуулийн лого" fill sizes="84px" className="object-contain" />
    </Link>
  );
}
