import Image from "next/image";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/data/nav";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";

export function SocialLinks() {
  return (
    <div className="flex items-center justify-end gap-3 [grid-area:social]">
      {SOCIAL_LINKS.map((s) => (
        <a key={s.label} href={s.href} aria-label={s.label} className="grid size-9 place-items-center transition-opacity hover:opacity-60">
          <Image src={s.icon} width={24} height={24} alt="" className="size-6" />
        </a>
      ))}
    </div>
  );
}

/**
 * Хөл хэсэг: accent хүрээ доторх хар самбар.
 * Том дэлгэц: лого | хаяг / зураас / copyright | нөхцөл | сошиал
 */
export function Footer() {
  return (
    <footer className="bg-accent p-4 uppercase print:hidden">
      <div
        data-surface="dark"
        className="relative isolate grid min-h-96 items-center gap-6 overflow-hidden bg-surface-black p-6 text-on-dark [grid-template-areas:'logo_social'_'title_title'_'rule_rule'_'copy_copy'_'terms_terms'] grid-cols-[minmax(0,1fr)_auto] sm:p-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8 lg:[grid-template-areas:'logo_title_title'_'rule_rule_rule'_'copy_terms_social']"
      >
        <div className="self-start [grid-area:logo]">
          <Logo />
        </div>
        <p className="max-w-160 self-start font-display text-heading leading-headline font-bold text-accent [grid-area:title] lg:justify-self-end lg:text-right">
          {SITE.school}
        </p>
        <hr className="h-px w-full self-end border-0 bg-on-dark opacity-30 [grid-area:rule]" />
        <p className="text-eyebrow tracking-eyebrow text-on-dark-faint [grid-area:copy]">
          {SITE.copyright} ·{" "}
          <Link href="/styleguide" className="underline decoration-accent underline-offset-4 transition-colors hover:text-accent">
            Styleguide
          </Link>
        </p>
        <div className="justify-self-start [grid-area:terms]">
          <Button href="#">Terms of Service</Button>
        </div>
        <SocialLinks />
      </div>
    </footer>
  );
}
