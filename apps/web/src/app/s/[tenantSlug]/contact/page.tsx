import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  GradientText,
} from "@humanberto/ui";
import { requireTenantSite } from "@/lib/tenant/require-tenant-site";
import { tenantPagePath } from "@/lib/tenant/public-site";

export const dynamic = "force-dynamic";

export default async function TenantContactPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await requireTenantSite(tenantSlug, { page: "page.contact" });
  const { site } = ctx;

  return (
    <div className="pt-32 pb-24">
      <Container className="max-w-4xl">
        <Badge>Contact</Badge>
        <h1 className="mt-6 font-display text-4xl font-light leading-tight sm:text-5xl">
          Let&apos;s <GradientText>connect</GradientText>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Hiring, scoping a project, or just curious? Reach out directly
          {ctx.advocate ? ", or talk to my AI advocate first" : ""}.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {site.email ? (
            <ContactCard label="Email" value={site.email} href={`mailto:${site.email}`} />
          ) : (
            <ContactCard
              label="Email"
              value="Add in My Office"
              href="/myoffice/content"
            />
          )}
          {site.linkedin ? (
            <ContactCard label="LinkedIn" value="Connect" href={site.linkedin} />
          ) : null}
          {site.phone ? (
            <ContactCard
              label="Phone"
              value={site.phone}
              href={`tel:${site.phone.replace(/[^\d]/g, "")}`}
            />
          ) : null}
        </div>

        {ctx.advocate ? (
          <Card className="mt-16 p-8">
            <h2 className="font-display text-2xl font-light">Prefer to chat first?</h2>
            <p className="mt-3 text-sm text-muted">
              My AI advocate knows my work and can help you decide if we&apos;re a fit.
            </p>
            <Link href={tenantPagePath(tenantSlug, "/chat")} className="mt-5 inline-block">
              <Button>Talk to my advocate</Button>
            </Link>
          </Card>
        ) : null}
      </Container>
    </div>
  );
}

function ContactCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-2xl border border-line p-6 transition-colors hover:border-gold/40"
    >
      <p className="text-xs uppercase tracking-widest text-faint">{label}</p>
      <p className="mt-2 font-display text-lg text-fg">{value}</p>
    </a>
  );
}
