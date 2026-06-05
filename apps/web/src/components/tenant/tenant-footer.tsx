"use client";

import Link from "next/link";
import { Container } from "@humanberto/ui";
import { useSiteVisibility } from "@/components/site-visibility/provider";
import { isFeatureVisible, tenantNavFeature } from "@/lib/site-visibility";
import type { SiteConfig } from "@/lib/site";
import { tenantNavLinks, tenantPagePath } from "@/lib/tenant/public-site";

type Props = {
  tenantSlug: string;
  site: SiteConfig;
  advocate?: boolean;
};

export function TenantFooter({ tenantSlug, site, advocate = true }: Props) {
  const visibility = useSiteVisibility();
  const links = tenantNavLinks(tenantSlug, { advocate }).filter((link) => {
    const featureId = tenantNavFeature(link.href);
    return featureId ? isFeatureVisible(visibility, featureId) : true;
  });
  const base = tenantPagePath(tenantSlug, "/");

  return (
    <footer className="relative z-10 mt-32 border-t border-line/50 py-14">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <p className="font-display text-2xl text-fg">{site.shortName || site.name}</p>
            {isFeatureVisible(visibility, "footer.tagline") ? (
              <p className="mt-3 text-sm text-muted">{site.tagline}</p>
            ) : null}
          </div>

          <div className="flex gap-12">
            {isFeatureVisible(visibility, "footer.explore") ? (
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-[0.2em] text-faint">Explore</span>
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-fg">
                    {l.label}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-faint">Connect</span>
              {isFeatureVisible(visibility, "footer.email") && site.email ? (
                <a href={`mailto:${site.email}`} className="text-sm text-muted hover:text-fg">
                  Email
                </a>
              ) : null}
              {isFeatureVisible(visibility, "footer.linkedin") && site.linkedin ? (
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted hover:text-fg"
                >
                  LinkedIn
                </a>
              ) : null}
              {isFeatureVisible(visibility, "footer.github") && site.github ? (
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted hover:text-fg"
                >
                  GitHub
                </a>
              ) : null}
              {isFeatureVisible(visibility, "footer.owner-link") ? (
                <Link href="/myoffice" className="text-sm text-faint hover:text-muted">
                  Site owner
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-line/40 pt-6 text-xs text-faint sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} {site.name}
            {site.location ? `. ${site.location}.` : "."}
          </span>
          <div className="flex gap-4">
            {isFeatureVisible(visibility, "footer.terms") ? (
              <Link href={tenantPagePath(tenantSlug, "/terms")} className="hover:text-muted">
                Terms
              </Link>
            ) : null}
            {isFeatureVisible(visibility, "footer.privacy") ? (
              <Link href={tenantPagePath(tenantSlug, "/privacy")} className="hover:text-muted">
                Privacy
              </Link>
            ) : null}
            <Link href={base} className="hover:text-muted">
              {site.shortName || "Home"}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
