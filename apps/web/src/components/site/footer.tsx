import Link from "next/link";
import { Container } from "@humanberto/ui";
import { navLinks, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-line/50 py-14">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <p className="font-display text-2xl">
              <span className="text-fg">human</span>
              <span className="bg-gradient-to-br from-gold-dust to-gold bg-clip-text text-transparent">
                berto
              </span>
            </p>
            <p className="mt-3 text-sm text-muted">{site.tagline}</p>
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-faint">
                Explore
              </span>
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted hover:text-fg"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-faint">
                Connect
              </span>
              <a
                href={`mailto:${site.email}`}
                className="text-sm text-muted hover:text-fg"
              >
                Email
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted hover:text-fg"
              >
                LinkedIn
              </a>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted hover:text-fg"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-line/40 pt-6 text-xs text-faint sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} {site.name}. {site.location}.
          </span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-muted">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-muted">
              Privacy
            </Link>
            <span>Built with Next.js, deployed on Vercel.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
