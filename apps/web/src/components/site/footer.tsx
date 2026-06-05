"use client";

import Link from "next/link";
import { Container } from "@humanberto/ui";
import { useSiteVisibility } from "@/components/site-visibility/provider";
import { BOOTSTRAP_NAV_FEATURE, isFeatureVisible } from "@/lib/site-visibility";
import { navLinks, site } from "@/lib/site";

export function Footer() {
  const visibility = useSiteVisibility();
  const exploreLinks = navLinks.filter((link) => {
    const featureId = BOOTSTRAP_NAV_FEATURE[link.href];
    return featureId ? isFeatureVisible(visibility, featureId) : true;
  });

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
            {isFeatureVisible(visibility, "footer.tagline") ? (
              <p className="mt-3 text-sm text-muted">{site.tagline}</p>
            ) : null}
          </div>

          <div className="flex gap-12">
            {isFeatureVisible(visibility, "footer.explore") ? (
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-[0.2em] text-faint">Explore</span>
                {exploreLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-fg">
                    {l.label}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-faint">Connect</span>
              {isFeatureVisible(visibility, "footer.email") ? (
                <a href={`mailto:${site.email}`} className="text-sm text-muted hover:text-fg">
                  Email
                </a>
              ) : null}
              {isFeatureVisible(visibility, "footer.linkedin") ? (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted hover:text-fg"
                >
                  LinkedIn
                </a>
              ) : null}
              {isFeatureVisible(visibility, "footer.github") ? (
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted hover:text-fg"
                >
                  GitHub
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-line/40 pt-6 text-xs text-faint sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} {site.name}. {site.location}.
          </span>
          <div className="flex gap-4">
            {isFeatureVisible(visibility, "footer.terms") ? (
              <Link href="/terms" className="hover:text-muted">
                Terms
              </Link>
            ) : null}
            {isFeatureVisible(visibility, "footer.privacy") ? (
              <Link href="/privacy" className="hover:text-muted">
                Privacy
              </Link>
            ) : null}
            {isFeatureVisible(visibility, "footer.built-with") ? (
              <span>Built with Next.js, deployed on Vercel.</span>
            ) : null}
          </div>
        </div>
      </Container>
    </footer>
  );
}
