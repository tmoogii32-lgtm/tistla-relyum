import type { Metadata } from "next";
import { Inter, Oswald, Space_Grotesk } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlateDefs } from "@/components/ui/Plate";
import "./globals.css";

/* Гарчиг: Oswald (кирилл бий). Үндсэн текст: Space Grotesk — кирилл үсэг
   байхгүй тул кирилл тэмдэгтүүд Inter-ээр харагдана. */
const oswald = Oswald({ subsets: ["latin", "cyrillic"], variable: "--font-oswald" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Математикт дурлагсад",
    template: "%s · Математикт дурлагсад",
  },
  description: "Даланзадгад сумын ЕБ-ын 5-р сургууль — 7-р ангийн математикийн хоцрогдол арилгах сайт.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${oswald.variable} ${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Reveal эффект зөвхөн JS ажиллах үед контентыг нууна */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-svh flex-col">
        <PlateDefs />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
