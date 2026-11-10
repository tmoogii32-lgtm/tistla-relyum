export type NavLink = { href: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Нүүр" },
  { href: "/matematik", label: "Математик" },
  { href: "/hotsrogdol", label: "Хоцрогдлыг тооцох" },
  { href: "/shalgalt", label: "Шалгалт өгөх" },
  { href: "/interaktiv", label: "Интерактив даалгавар" },
  { href: "/#courses", label: "Сургалтууд" },
  { href: "/tuvshin", label: "Түвшин" },
];

export const SOCIAL_LINKS = [
  { label: "Facebook", icon: "/assets/facebook.svg", href: "#" },
  { label: "Instagram", icon: "/assets/instagram.svg", href: "#" },
  { label: "X", icon: "/assets/x.svg", href: "#" },
  { label: "LinkedIn", icon: "/assets/linkedin.svg", href: "#" },
  { label: "YouTube", icon: "/assets/youtube.svg", href: "#" },
];
