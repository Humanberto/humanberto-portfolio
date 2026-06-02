import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSessionFromCookies } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Back office",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/myoffice", label: "Overview" },
  { href: "/myoffice/projects", label: "Projects" },
  { href: "/myoffice/content", label: "Content" },
  { href: "/myoffice/llm", label: "LLM keys" },
];

export default async function MyOfficeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authed = await getAdminSessionFromCookies();

  if (!authed) {
    return (
      <div className="min-h-dvh bg-[#0b0610] text-[#f5eef8]">{children}</div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0b0610] text-[#f5eef8]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Humanberto</p>
            <h1 className="font-display text-xl">Back office</h1>
          </div>
          <form action="/api/myoffice/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              Sign out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-2 px-6 pb-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
