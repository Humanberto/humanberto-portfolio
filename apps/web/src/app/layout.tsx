import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { LivingBackground } from "@/components/living-background";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body-face",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://humanberto.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Roberto Pocas Leitao - Product Designer & Python Developer",
    template: "%s - Humanberto",
  },
  description:
    "Product designer and Python developer turning messy processes into clean, AI-powered experiences. Data, design, and shipped products.",
  keywords: [
    "product designer",
    "python developer",
    "UX UI design",
    "data engineering",
    "AI ML",
    "AI agents",
    "San Diego",
  ],
  authors: [{ name: "Roberto Pocas Leitao" }],
  openGraph: {
    type: "website",
    title: "Roberto Pocas Leitao - Product Designer & Python Developer",
    description:
      "Turning messy processes into clean, AI-powered experiences. Data, design, and shipped products.",
    url: siteUrl,
    siteName: "Humanberto",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roberto Pocas Leitao - Product Designer & Python Developer",
    description:
      "Turning messy processes into clean, AI-powered experiences.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0610",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <LivingBackground />
        <Nav />
        <div className="relative z-10">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
