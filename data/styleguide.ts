/* /styleguide — сайтын дизайн системийн баримт бичиг.
   Өнгө, хэмжээний бодит утгыг браузер CSS-ээс (app/globals.css) уншина — энд зөвхөн нэр, хэрэглээ. */

export const SG_SECTIONS = [
  { id: "principles", title: "Зарчим" },
  { id: "brand", title: "Брэнд" },
  { id: "color", title: "Өнгө" },
  { id: "type", title: "Үсэг" },
  { id: "space", title: "Зай" },
  { id: "shape", title: "Хэлбэр" },
  { id: "line", title: "Шугам" },
  { id: "overlay", title: "Сүүдэр, бүрхүүл" },
  { id: "icons", title: "Дүрс" },
  { id: "components", title: "Компонент" },
  { id: "sections", title: "Хэсгүүд" },
  { id: "motion", title: "Хөдөлгөөн" },
] as const;

export const PRINCIPLES = [
  {
    title: "Инженерийн самбар",
    text: "Мөсөн цайвар цаас, гүн бэх, үйлдэл ба онцлолд ганц cyan accent. Өнгийг токеноор л хэрэглэнэ — түүхий hex бичихгүй.",
  },
  {
    title: "Oswald гарчиг, Space Grotesk бичвэр",
    text: "Гарчиг нарийн, өндөр, том үсгээр. Бичвэр Space Grotesk; кирилл үсэг Inter-ээр нөхөгдөнө. Урт текстийг том үсгээр бичихгүй.",
  },
  {
    title: "Гадаргуу ээлжлэх",
    text: "Хэсэг бүр data-surface (light · muted · dark)-тай. s-* токенууд гадаргуугаас хамааран өнгөө өөрөө солино.",
  },
  {
    title: "Хурц өнцөг, тайрсан булан",
    text: "Бөөрөнхий булан хэрэглэхгүй. Ташуу булантай товч, шатлалтай хавтан, ⌐ ¬ хүрээ — сайтын хэлбэрийн хэл.",
  },
  {
    title: "Тайван хөдөлгөөн",
    text: "Доороос зөөлөн гарч ирэх, удаан easing. prefers-reduced-motion үед хөдөлгөөн бүр зогсож, агуулга шууд харагдана.",
  },
];

export type ColorToken = {
  name: string;
  /** CSS хувьсагч (var(--x)) */
  cssVar: string;
  /** Tailwind utility жишээ */
  utility?: string;
  usage: string;
  /** Контрастыг аль дэвсгэртэй тооцох */
  against?: string;
};

/** Түвшин 1 — түүхий өнгө */
export const RAW_COLORS: ColorToken[] = [
  { name: "ice-50", cssVar: "--raw-ice-50", usage: "Хуудасны цаас" },
  { name: "ice-100", cssVar: "--raw-ice-100", usage: "Muted гадаргуу, карт" },
  { name: "ice-200", cssVar: "--raw-ice-200", usage: "Шугам, soft гадаргуу" },
  { name: "steel-400", cssVar: "--raw-steel-400", usage: "Бараан дээрх туслах бичвэр" },
  { name: "ink-950", cssVar: "--raw-ink-950", usage: "Бэх, хар самбар" },
  { name: "ink-900", cssVar: "--raw-ink-900", usage: "Бараан гадаргуу" },
  { name: "ink-800", cssVar: "--raw-ink-800", usage: "Бараан дээрх өргөгдсөн" },
  { name: "ink-700", cssVar: "--raw-ink-700", usage: "Бараан дээрх шугам" },
  { name: "cyan-400", cssVar: "--raw-cyan-400", usage: "Accent — товч, онцлол" },
  { name: "stone-600", cssVar: "--raw-stone-600", usage: "Хавтангийн хүрээ" },
  { name: "ok", cssVar: "--raw-ok", usage: "Тэнцсэн, эзэмшсэн" },
  { name: "warn", cssVar: "--raw-warn", usage: "Хэсэгчлэн, анхааруулга" },
  { name: "danger", cssVar: "--raw-danger", usage: "Хоцрогдолтой, алдаа" },
];

/** Түвшин 2 — үүрэг (компонентууд эдгээрийг л хэрэглэнэ) */
export const ROLE_COLORS: ColorToken[] = [
  { name: "background", cssVar: "--background", utility: "bg-background", usage: "Хуудасны дэвсгэр" },
  { name: "foreground", cssVar: "--foreground", utility: "text-foreground", usage: "Үндсэн бичвэр", against: "--background" },
  { name: "surface-black", cssVar: "--surface-black", utility: "bg-surface-black", usage: "Тоон карт, footer самбар" },
  { name: "surface-dark", cssVar: "--surface-dark", utility: "bg-surface-dark", usage: "Бараан хэсэг" },
  { name: "surface-dark-raised", cssVar: "--surface-dark-raised", utility: "bg-surface-dark-raised", usage: "Бараан дээрх карт" },
  { name: "surface-muted", cssVar: "--surface-muted", utility: "bg-surface-muted", usage: "Muted хэсэг" },
  { name: "surface-soft", cssVar: "--surface-soft", utility: "bg-surface-soft", usage: "Muted дээрх карт" },
  { name: "on-dark", cssVar: "--on-dark", utility: "text-on-dark", usage: "Бараан дээрх бичвэр", against: "--surface-dark" },
  { name: "on-dark-muted", cssVar: "--on-dark-muted", utility: "text-on-dark-muted", usage: "Бараан дээрх туслах", against: "--surface-dark" },
  { name: "accent", cssVar: "--accent", utility: "text-accent · bg-accent", usage: "Гол үйлдэл, онцлол", against: "--surface-dark" },
  { name: "accent-muted", cssVar: "--accent-muted", utility: "bg-accent-muted", usage: "Сонгогдсон мөр, accent хүрээ" },
  { name: "border-muted", cssVar: "--border-muted", utility: "border-border-muted", usage: "Цайвар дээрх hairline" },
  { name: "border-on-dark", cssVar: "--border-on-dark", utility: "border-border-on-dark", usage: "Бараан дээрх hairline" },
  { name: "plate-outline", cssVar: "--plate-outline", utility: "stroke-plate-outline", usage: "Зургийн хавтангийн хүрээ" },
];

export const STATUS_COLORS: ColorToken[] = [
  { name: "ok", cssVar: "--raw-ok", utility: "text-ok · bg-ok/10", usage: "Тэнцсэн, эзэмшсэн (≥ 80%)", against: "--surface-dark" },
  { name: "warn", cssVar: "--raw-warn", utility: "text-warn · bg-warn/10", usage: "Хэсэгчлэн (50–79%)", against: "--surface-dark" },
  { name: "danger", cssVar: "--raw-danger", utility: "text-danger · bg-danger/10", usage: "Хоцрогдолтой (< 50%), алдаа", against: "--surface-dark" },
];

/** Гадаргуугаас хамаарах семантик токен — [data-surface] wrapper солиход өөрөө солигдоно */
export const SURFACE_TOKENS = [
  { token: "--s-bg", utility: "bg-s-bg", usage: "Гадаргуугийн дэвсгэр" },
  { token: "--s-raised", utility: "bg-s-raised", usage: "Өргөгдсөн карт" },
  { token: "--s-fg", utility: "text-s-fg", usage: "Бичвэр" },
  { token: "--s-sub", utility: "text-s-sub", usage: "Туслах бичвэр, lead" },
  { token: "--s-faint", utility: "text-s-faint", usage: "Placeholder, хоосон нүд" },
  { token: "--s-border", utility: "border-s-border", usage: "Hairline" },
  { token: "--s-heading", utility: "text-s-heading", usage: "Гарчиг (бараан дээр accent)" },
  { token: "--s-eyebrow", utility: "text-s-eyebrow", usage: "Tagline" },
  { token: "--s-dot", utility: "—", usage: "Гарчгийн төгсгөлийн цэг" },
];
export const SURFACES = ["light", "muted", "dark"] as const;

export const FONT_FAMILIES = [
  { role: "Display", family: "Oswald", cls: "font-display font-bold uppercase", sample: "Математик 7", usage: "h1–h3, тоо, картын гарчиг. Кирилл бий. 400–700.", token: "--font-display · font-display" },
  { role: "Sans", family: "Space Grotesk", cls: "font-sans", sample: "Аа Өө Үү 0123 Abc", usage: "Бичвэр, товч, label. Кирилл үсгийг Inter нөхнө.", token: "--font-sans · font-sans" },
  { role: "Кирилл нөөц", family: "Inter", cls: "[font-family:var(--font-inter)]", sample: "Өө Үү Ёё Ъъ — 7-р анги", usage: "Space Grotesk-д байхгүй кирилл тэмдэгт автоматаар энэ фонтоор.", token: "--font-inter" },
];

export const TYPE_SCALE = [
  { token: "text-eyebrow", cssVar: "--text-eyebrow", usage: "Tagline, label, хүснэгтийн толгой" },
  { token: "text-body", cssVar: "--text-body", usage: "Үндсэн бичвэр (14px)" },
  { token: "text-label", cssVar: "--text-label", usage: "Товч, цэс, input" },
  { token: "text-lead", cssVar: "--text-lead", usage: "Lead, бодлогын текст" },
  { token: "text-title", cssVar: "--text-title", usage: "Картын гарчиг, товч" },
  { token: "text-heading", cssVar: "--text-heading", usage: "Хэсгийн дэд гарчиг, тоо" },
  { token: "text-display-sm", cssVar: "--type-display-sm", usage: "h2 — уян хатан (38 → 44 → 55px)" },
  { token: "text-display", cssVar: "--text-display", usage: "Том гарчиг (52px)" },
  { token: "text-impact", cssVar: "--type-impact", usage: "Hero h1 — уян хатан (55 → 70 → 96px)" },
];

export const LINE_HEIGHTS = [
  { token: "leading-cap", cssVar: "--leading-cap", usage: "Тоон үзүүлэлт (cap-height-д тааруулсан)" },
  { token: "leading-flat", cssVar: "--leading-flat", usage: "Tagline, товч, нэг мөрт label" },
  { token: "leading-headline", cssVar: "--leading-headline", usage: "Oswald гарчиг" },
  { token: "leading-display", cssVar: "--leading-display", usage: "Бичвэр, lead" },
];

export const TRACKING = [
  { token: "tracking-stat", cssVar: "--tracking-stat", usage: "Том тоо" },
  { token: "tracking-label", cssVar: "--tracking-label", usage: "Цэс, label" },
  { token: "tracking-eyebrow", cssVar: "--tracking-eyebrow", usage: "Tagline" },
];

/** Tailwind-ийн 4px суурьтай шатлал — сайтад түгээмэл хэрэглэгддэг алхмууд */
export const SPACING = [
  { cls: "1", px: 4 },
  { cls: "2", px: 8 },
  { cls: "3", px: 12 },
  { cls: "4", px: 16 },
  { cls: "6", px: 24 },
  { cls: "8", px: 32 },
  { cls: "10", px: 40 },
  { cls: "12", px: 48 },
  { cls: "16", px: 64 },
  { cls: "20", px: 80 },
];

export const LAYOUT_VARS = [
  { token: "--gutter", value: "1.5rem → 2rem (≥640px)", usage: "Хуудасны хажуугийн зай · px-(--gutter)" },
  { token: "--section-y", value: "4rem → 5rem → 7rem", usage: "Хэсгийн дээд/доод зай · py-(--section-y); tight үед хагас" },
  { token: "--nav-h", value: "4.5rem", usage: "Навбарын өндөр; scroll-padding-top, наалттай дэд цэс" },
  { token: "max-w-site", value: "80rem", usage: "Агуулгын дээд өргөн (Container)" },
  { token: "html font-size", value: "16px → 1.111vw (1280–1440) → 0.833vw", usage: "Том дэлгэцэд rem бүхэлдээ томорно" },
];

export const OVERLAYS = [
  { name: "Hero overlay", value: "surface-black / 55%", usage: "Нүүрний hero, Математик хэсгийн фон зураг", cls: "bg-surface-black/55" },
  { name: "Math hero", value: "surface-black / 70%", usage: "Математик 7 hero — урт текст уншигдахуйц", cls: "bg-surface-black/70" },
  { name: "Lightbox", value: "surface-black / 40%", usage: "Видео, зургийн хавтан дээр; тоглоход алга болно", cls: "bg-surface-black/40" },
  { name: "Dialog backdrop", value: "surface-black / 70%", usage: "Мини даалгаврын цонхны ар тал", cls: "bg-surface-black/70" },
  { name: "Sticky subnav", value: "surface-black / 90% + blur", usage: "Хэсгийн наалттай цэс (Математик, Түвшин)", cls: "bg-surface-black/90 backdrop-blur" },
];

export const ICONS = [
  { src: "/assets/chevron-right.svg", name: "chevron-right", usage: "Холбоос товч (variant=link), icon-adapt" },
  { src: "/assets/play-button.svg", name: "play-button", usage: "Видео, lightbox" },
  { src: "/assets/facebook.svg", name: "facebook", usage: "Footer сошиал", dark: true },
  { src: "/assets/instagram.svg", name: "instagram", usage: "Footer сошиал", dark: true },
  { src: "/assets/x.svg", name: "x", usage: "Footer сошиал", dark: true },
  { src: "/assets/linkedin.svg", name: "linkedin", usage: "Footer сошиал", dark: true },
  { src: "/assets/youtube.svg", name: "youtube", usage: "Footer сошиал", dark: true },
];

export const MATH_ILLUSTRATIONS = [
  { src: "/assets/math/number.svg", name: "number" },
  { src: "/assets/math/algebra.svg", name: "algebra" },
  { src: "/assets/math/geometry.svg", name: "geometry" },
  { src: "/assets/math/statistics.svg", name: "statistics" },
];

/** Хуудсан дээрх том хэсгүүд — хаана, ямар файлд */
export const SECTION_REGISTRY: { page: string; href: string; items: { name: string; file: string; note: string }[] }[] = [
  {
    page: "Нүүр",
    href: "/",
    items: [
      { name: "Hero", file: "components/home/Hero.tsx", note: "Parallax фон, h1 impact, 2 товч" },
      { name: "StatsSection", file: "components/home/StatsSection.tsx", note: "Тоон карт + видео/зураг; light, dark" },
      { name: "MathIntro", file: "components/home/MathIntro.tsx", note: "Фон зурагтай, LinkList" },
      { name: "TuvshinReport", file: "components/tuvshin/TuvshinReport.tsx", note: "KPI, RAPID, загвар, график, симулятор, зөвлөмж" },
      { name: "Courses", file: "components/home/Courses.tsx", note: "Хүүхэд судлал + 8 сургалтын карт" },
    ],
  },
  {
    page: "Математик",
    href: "/matematik",
    items: [
      { name: "MathHero · SubNav", file: "components/matematik/MathHero.tsx", note: "Hero ба наалттай хэсгийн цэс" },
      { name: "StrandCard", file: "components/matematik/StrandCard.tsx", note: "4 хүрээний зорилт" },
      { name: "Textbook", file: "components/matematik/Textbook.tsx", note: "Сурах бичиг, бүлгүүд" },
      { name: "Planning", file: "components/matematik/Planning.tsx", note: "Нэгжийн хүснэгт, хичээлийн бүтэц, мөчлөг" },
      { name: "Assessment", file: "components/matematik/Assessment.tsx", note: "4 түвшин, шалгуур, CTA" },
    ],
  },
  {
    page: "Хоцрогдлыг тооцох",
    href: "/hotsrogdol",
    items: [
      { name: "Tracker", file: "components/hotsrogdol/Tracker.tsx", note: "Нийт үзүүлэлт, сурагчид, хоцрогдолтой жагсаалт" },
      { name: "DiagnosisSection", file: "components/hotsrogdol/DiagnosisSection.tsx", note: "Оношлох сорил, онош, нөхөх төлөвлөгөө" },
    ],
  },
  {
    page: "Даалгавартай ажиллах",
    href: "/daalgavar",
    items: [
      { name: "Hub", file: "components/daalgavar/Hub.tsx", note: "Сурагч, даалгавар, бүртгэл" },
      { name: "Workspace", file: "components/daalgavar/Workspace.tsx", note: "Сэдвийн мод, R1–R4, бодлого, даалгаврын карт" },
    ],
  },
  {
    page: "Интерактив даалгавар",
    href: "/interaktiv",
    items: [
      { name: "TaskTabs", file: "components/interaktiv/TaskTabs.tsx", note: "Ганцаарчилсан, хос, баг" },
      { name: "MiniTasks · GameDialog", file: "components/interaktiv/MiniTasks.tsx", note: "9 мини даалгавар, цонхонд тоглоно" },
    ],
  },
];

export const MOTION_PURPOSES = ["Reveal", "Hover", "Дарах хариу", "Төлөв", "Гүн", "Мэдээлэл"] as const;
export const MOTION_TRIGGERS = ["Ачаалах", "Scroll", "Hover", "Дарах"] as const;
export const MOTION_PAGES = ["Бүх хуудас", "Нүүр", "Математик", "Хоцрогдол", "Даалгавар", "Интерактив"] as const;

export type Motion = {
  slug: string;
  name: string;
  purpose: (typeof MOTION_PURPOSES)[number];
  trigger: (typeof MOTION_TRIGGERS)[number];
  pages: (typeof MOTION_PAGES)[number][];
  text: string;
  where: string[];
  config: string;
  reduced: string;
  /** Демо: reveal | flood | plate | dim | sheet | count | ring | bar | arrow */
  demo: string;
};

export const MOTIONS: Motion[] = [
  {
    slug: "reveal-block", name: "Блок гарч ирэх", purpose: "Reveal", trigger: "Scroll", pages: ["Бүх хуудас"],
    text: "Карт, lead, товчнууд дэлгэцэнд орох үед доороос зөөлөн гарч ирнэ; дараалсан картууд шатлан.",
    where: ["components/effects/Reveal.tsx", "app/globals.css · [data-reveal]"],
    config: "opacity 0 → 1, translateY .75rem → 0 · 700ms · ease-entrance · stagger 60–80ms", reduced: "Шууд харагдана", demo: "reveal",
  },
  {
    slug: "split-heading", name: "Гарчиг үг үгээр", purpose: "Reveal", trigger: "Scroll", pages: ["Бүх хуудас"],
    text: "h1, h2-ын үг бүр доороос гарч, доорх accent зураас 0-ээс 1.5rem хүртэл сунана.",
    where: ["components/effects/SplitHeading.tsx", "@utility heading-mark"],
    config: "үг бүр .35em · 70ms stagger · зураас 600ms, 300ms саатал", reduced: "Шууд харагдана", demo: "reveal",
  },
  {
    slug: "parallax", name: "Фон зургийн parallax", purpose: "Гүн", trigger: "Scroll", pages: ["Нүүр", "Математик"],
    text: "Hero, Математик хэсгийн фон зураг хуудаснаас удаан хөдөлж гүнзгий харагдана.",
    where: ["components/effects/ParallaxImage.tsx"],
    config: "translateY ±3.75rem · rAF throttle", reduced: "Зураг хөдлөхгүй", demo: "plate",
  },
  {
    slug: "button-flood", name: "Товчны дүүрэлт", purpose: "Hover", trigger: "Hover", pages: ["Бүх хуудас"],
    text: "Ташуу булантай товчийг заахад accent зүүнээс баруун тийш дүүрч, сум баруун тийш шилжинэ.",
    where: ["components/ui/Button.tsx"],
    config: "flood scaleX 0 → 1 · 250ms · ease-plate; сум translateX .25rem · 150ms", reduced: "Өнгө солигдоно", demo: "flood",
  },
  {
    slug: "plate-inset", name: "Хавтан агших", purpose: "Hover", trigger: "Hover", pages: ["Нүүр", "Математик", "Интерактив"],
    text: "Зургийн хавтан дээр заахад зураг хүрээнээсээ дотогшоо агшина.",
    where: ["components/ui/Plate.tsx"],
    config: "inset 0 → 5% · 700ms · ease-plate", reduced: "Ижил (жижиг хөдөлгөөн)", demo: "plate",
  },
  {
    slug: "grid-dim", name: "Бусад карт бүдгэрэх", purpose: "Hover", trigger: "Hover", pages: ["Нүүр"],
    text: "Нэг сургалтын картыг заахад бусад нь бүдгэрч анхаарал төвлөрнө.",
    where: ["components/home/Courses.tsx"],
    config: "opacity 1 → .3 · 700ms · ease-plate", reduced: "Ижил", demo: "dim",
  },
  {
    slug: "link-arrow", name: "Сумтай холбоос", purpose: "Hover", trigger: "Hover", pages: ["Бүх хуудас"],
    text: "Холбоос, link товч дээр сум баруун тийш шилжиж, доогуур зураас accent болно.",
    where: ["components/ui/Lists.tsx · LinkList", "components/ui/Button.tsx · link"],
    config: "translateX .25rem · 150ms · ease-entrance", reduced: "Ижил", demo: "arrow",
  },
  {
    slug: "burger-sheet", name: "Burger цэс", purpose: "Төлөв", trigger: "Дарах", pages: ["Бүх хуудас"],
    text: "1280px-ээс бага дэлгэцэнд бүтэн дэлгэцийн цэс нээгдэж, холбоос бүр шатлан гарна; burger ✕ болно.",
    where: ["components/layout/Navbar.tsx", "app/globals.css · .sheet-item"],
    config: "холбоос 320ms · 55ms stagger · ease-entrance; зураас rotate 250ms · ease-plate", reduced: "Шууд нээгдэнэ", demo: "sheet",
  },
  {
    slug: "counter", name: "Гүйдэг тоо", purpose: "Мэдээлэл", trigger: "Scroll", pages: ["Нүүр"],
    text: "Тоон карт дэлгэцэнд ороход 0-ээс эцсийн утга хүртэл гүйнэ.",
    where: ["components/home/AnimatedCounter.tsx"],
    config: "ease-out cubic · 700–2200ms (зөрүүгээс хамаарч)", reduced: "Шууд эцсийн тоо", demo: "count",
  },
  {
    slug: "live-ring", name: "Шууд тэмдэг", purpose: "Мэдээлэл", trigger: "Ачаалах", pages: ["Нүүр"],
    text: "Тоолуур шууд шинэчлэгдэж байгааг тархах цагираг харуулна.",
    where: ["components/home/AnimatedCounter.tsx", "app/globals.css · .live-ring"],
    config: "scale 1 → 2.6, opacity .7 → 0 · 3.2s linear infinite", reduced: "Цагираг нуугдана", demo: "ring",
  },
  {
    slug: "video-autoplay", name: "Видео автоматаар", purpose: "Төлөв", trigger: "Scroll", pages: ["Нүүр"],
    text: "Видео 35% харагдахад дуугүй тоглож, бүрхүүл, тоглуулах тэмдэг алга болно.",
    where: ["components/home/VideoLightbox.tsx"],
    config: "IntersectionObserver .35 · overlay opacity 250ms", reduced: "Автоматаар тоглохгүй", demo: "plate",
  },
  {
    slug: "progress", name: "Явцын зураас", purpose: "Төлөв", trigger: "Дарах", pages: ["Даалгавар", "Интерактив", "Хоцрогдол"],
    text: "Даалгавар, тоглоом, онош дээр явц, хувь өсөхөд зураас сунана.",
    where: ["components/daalgavar/TaskCard.tsx", "components/interaktiv/games/QuizGame.tsx", "components/daalgavar/DiagnosisReport.tsx"],
    config: "width · 300–500ms", reduced: "Ижил", demo: "bar",
  },
];

/** Хугацаа ба easing токен */
export const DURATIONS = [
  { name: "fast", value: "150ms", usage: "Өнгө, сум" },
  { name: "normal", value: "250ms", usage: "Товчны дүүрэлт, burger" },
  { name: "sheet", value: "320ms", usage: "Цэсний холбоос" },
  { name: "plate", value: "700ms", usage: "Reveal, хавтан, бүдгэрэлт" },
];
export const EASINGS = [
  { name: "ease-entrance", value: "cubic-bezier(.2, 0, 0, 1)", usage: "Гарч ирэх, өнгө" },
  { name: "ease-plate", value: "cubic-bezier(.33, 0, 0, 1)", usage: "Хавтан, дүүрэлт" },
];
