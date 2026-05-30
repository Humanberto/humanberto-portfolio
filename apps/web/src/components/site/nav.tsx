"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, cn, Container } from "@humanberto/ui";
import { navLinks } from "@/lib/site";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-line/40 bg-ink/60 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg tracking-tight"
            onClick={() => setOpen(false)}
          >
            <span className="text-fg">human</span>
            <span className="bg-gradient-to-br from-gold-dust to-gold bg-clip-text text-transparent">
              berto
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    active
                      ? "text-gold-bright"
                      : "text-muted hover:text-fg hover:bg-white/5",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <Link href="/chat">
              <Button size="sm">Talk to my advocate</Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg md:hidden"
          >
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "h-0.5 w-5 bg-current transition-transform",
                  open && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-5 bg-current transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-5 bg-current transition-transform",
                  open && "-translate-y-2 -rotate-45",
                )}
              />
            </div>
          </button>
        </Container>
      </div>

      {open ? (
        <div className="border-b border-line/40 bg-ink/95 backdrop-blur-xl md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base text-muted hover:bg-white/5 hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/chat" onClick={() => setOpen(false)} className="mt-2">
              <Button className="w-full">Talk to my advocate</Button>
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
