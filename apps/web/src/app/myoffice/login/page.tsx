import { Suspense } from "react";
import { PageBlockRenderer } from "@/components/page-builder/block-renderer";
import { DEFAULT_MYOFFICE_LOGIN } from "@/lib/page-builder/defaults";
import { getBlocksForSystemPage } from "@/lib/page-builder/server";

function LoginBlocks({ blocks }: { blocks: typeof DEFAULT_MYOFFICE_LOGIN.blocks }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <Suspense
        fallback={<div className="text-sm text-white/60">Loading…</div>}
      >
        <PageBlockRenderer blocks={blocks} />
      </Suspense>
    </div>
  );
}

export default async function LoginPage() {
  const blocks =
    (await getBlocksForSystemPage("myoffice-login", true)) ?? DEFAULT_MYOFFICE_LOGIN.blocks;

  return <LoginBlocks blocks={blocks} />;
}
