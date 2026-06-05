import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  GradientText,
  SectionHeading,
} from "@humanberto/ui";
import { requireTenantSite } from "@/lib/tenant/require-tenant-site";
import { tenantFitCheckHref, tenantPagePath } from "@/lib/tenant/public-site";

export const dynamic = "force-dynamic";

export default async function TenantAboutPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await requireTenantSite(tenantSlug, { page: "page.about" });
  const { site, about } = ctx;
  const firstName = site.name.split(" ")[0] ?? site.name;

  return (
    <div className="pt-32 pb-24">
      <Container className="max-w-3xl">
        <Badge>About</Badge>
        <h1 className="mt-6 font-display text-4xl font-light leading-tight sm:text-5xl">
          Hi, I&apos;m <GradientText>{firstName}</GradientText>.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">{about.intro}</p>
        <p className="mt-4 text-muted">{site.role}</p>

        <SectionHeading
          eyebrow="Focus"
          title={about.focus || site.tagline}
          lead={
            about.audience
              ? `Built for ${about.audience}.`
              : "Replace this section with your story in My Office."
          }
        />

        <Card className="mt-10 p-8">
          <h2 className="font-display text-xl font-light">Experience & story</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Add your timeline, education, and background in My Office → Content, or ask
            the Studio agent to draft copy from your resume.
          </p>
          <Link href="/myoffice/content" className="mt-4 inline-block">
            <Button size="sm" variant="outline">
              Edit in My Office
            </Button>
          </Link>
        </Card>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href={tenantPagePath(tenantSlug, "/work")}>
            <Button variant="outline">View my work</Button>
          </Link>
          {ctx.advocate ? (
            <Link href={tenantFitCheckHref(tenantSlug)}>
              <Button>Score my fit</Button>
            </Link>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
