import Link from "next/link";
import { AdvocateChat, FitAnalyzer } from "@humanberto/advocate-agent";
import { Badge, Button, Container, GradientText } from "@humanberto/ui";
import { advocateClient } from "@/content/advocate.client";
import { requireTenantSite } from "@/lib/tenant/require-tenant-site";
import { tenantFitCheckHref } from "@/lib/tenant/public-site";

export const dynamic = "force-dynamic";

export default async function TenantChatPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await requireTenantSite(tenantSlug);
  if (!ctx.advocate) {
    return (
      <div className="pt-32 pb-24">
        <Container className="max-w-xl text-center">
          <p className="text-muted">AI Advocate is not enabled for this portfolio.</p>
          <Link href={ctx.base} className="mt-4 inline-block text-gold-bright hover:underline">
            Back home
          </Link>
        </Container>
      </div>
    );
  }

  const fitCheck = tenantFitCheckHref(tenantSlug);
  const config = {
    ...advocateClient,
    ownerName: ctx.site.name,
    persona: `${ctx.site.name}'s AI advocate`,
    fitCheckHref: fitCheck,
    suggestedPrompts: [
      "Tell me about your experience",
      "What kind of roles are you looking for?",
      "Walk me through a featured project",
    ],
  };

  return (
    <div className="pt-28 pb-12">
      <Container className="max-w-3xl">
        <div className="text-center">
          <Badge>AI Advocate</Badge>
          <h1 className="mt-5 font-display text-4xl font-light sm:text-5xl">
            Your <GradientText>most honest advocate</GradientText>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Ask anything about {ctx.site.name}&apos;s experience, work, or fit for your
            role or project.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={fitCheck}>
              <Button size="sm" variant="outline">
                Score my fit (0–10)
              </Button>
            </Link>
          </div>
        </div>

        <div
          id="advocate-chat"
          className="mt-10 h-[68vh] min-h-[520px] scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-ink/50 backdrop-blur-xl"
        >
          <AdvocateChat config={config} />
        </div>

        <div id="fit-check" className="mt-16 scroll-mt-28">
          <FitAnalyzer config={config} />
        </div>
      </Container>
    </div>
  );
}
