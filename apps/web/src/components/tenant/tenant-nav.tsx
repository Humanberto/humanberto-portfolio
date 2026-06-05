"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, cn, Container } from "@humanberto/ui";
import { useFeatureVisible, useSiteVisibility } from "@/components/site-visibility/provider";
import { isFeatureVisible, tenantNavFeature } from "@/lib/site-visibility";
import type { SiteConfig } from "@/lib/site";
import {
  tenantFitCheckHref,
  tenantNavLinks,
  tenantPagePath,
} from "@/lib/tenant/public-site";

type Props = {
  tenantSlug: string;
  site: SiteConfig;
  advocate?: boolean;
};

export function TenantNav({ tenantSlug, site, advocate = true }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibility = useSiteVisibility();
  const base = tenantPagePath(tenantSlug, "/");
  const allLinks = tenantNavLinks(tenantSlug, { advocate });
  const links = allLinks.filter((link) => {
    const featureId = tenantNavFeature(link.href);
    return featureId ? isFeatureVisible(visibility, featureId) : true;
  });
  const fitCheck = tenantFitCheckHref(tenantSlug);
  const firstName = site.shortName || site.name.split(" ")[0] || site.name;
  const showHeaderFitCheck = useFeatureVisible("nav.fit-check");
  const showHeaderAdvocate = useFeatureVisible("nav.header.advocate");
  const showOwnerLink = useFeatureVisible("nav.owner-link");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-line/40 bg-ink/60 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href={base}
            className="font-display text-lg tracking-tight text-fg"
            onClick={() => setOpen(false)}
          >
            {firstName}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
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
                      : "text-muted hover:bg-white/5 hover:text-fg",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {advocate && showHeaderFitCheck ? (
              <Link href={fitCheck}>
                <Button size="sm" variant="outline">
                  Score my fit
                </Button>
              </Link>
            ) : null}
            {advocate && showHeaderAdvocate ? (
              <Link href={tenantPagePath(tenantSlug, "/chat")}>
                <Button size="sm">Talk to my advocate</Button>
              </Link>
            ) : null}
            {showOwnerLink ? (
              <Link
                href="/myoffice"
                className="rounded-full px-3 py-2 text-xs text-faint transition-colors hover:text-muted"
                title="Site owner login"
              >
                Owner
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg md:hidden"
          >
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
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base text-muted hover:bg-white/5 hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
            {advocate && showHeaderFitCheck ? (
              <Link href={fitCheck} onClick={() => setOpen(false)}>
                <Button variant="outline" className="mt-2 w-full">
                  Score my fit
                </Button>
              </Link>
            ) : null}
            {advocate && showHeaderAdvocate ? (
              <Link
                href={tenantPagePath(tenantSlug, "/chat")}
                onClick={() => setOpen(false)}
                className="mt-2"
              >
                <Button className="w-full">Talk to my advocate</Button>
              </Link>
            ) : null}
            {showOwnerLink ? (
              <Link
                href="/myoffice"
                onClick={() => setOpen(false)}
                className="mt-3 px-4 text-xs text-faint hover:text-muted"
              >
                Site owner login
              </Link>
            ) : null}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
