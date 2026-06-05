import "server-only";
import { cookies } from "next/headers";
import { getAdminSessionFromCookies } from "@/lib/admin/auth";
import { getAuthUser } from "@/lib/auth/server";
import { BOOTSTRAP_TENANT_ID } from "@/lib/tenant/constants";
import { defaultTenantId, getTenantsForUser } from "@/lib/tenant/server";

export const TENANT_COOKIE = "hb_tenant_id";

export type OfficeContext = {
  tenantId: string;
  userId: string | null;
  isLegacyAdmin: boolean;
  /** Humanberto.com bootstrap portfolio — not a SaaS customer tenant. */
  isBootstrapOffice: boolean;
};

function platformOperatorEmails(): Set<string> {
  const raw =
    process.env.PLATFORM_OPERATOR_EMAILS ??
    process.env.ADMIN_OPERATOR_EMAIL ??
    "humanberto@gmail.com";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isPlatformOperatorEmail(email: string | undefined): boolean {
  if (!email) return false;
  return platformOperatorEmails().has(email.trim().toLowerCase());
}

export function isBootstrapTenantId(tenantId: string): boolean {
  return tenantId === BOOTSTRAP_TENANT_ID || tenantId === defaultTenantId();
}

export async function resolveOfficeContext(): Promise<OfficeContext | null> {
  try {
    const legacy = await getAdminSessionFromCookies();
    if (legacy) {
      return {
        tenantId: defaultTenantId(),
        userId: null,
        isLegacyAdmin: true,
        isBootstrapOffice: true,
      };
    }

    const user = await getAuthUser();
    if (!user) return null;

    const memberships = await getTenantsForUser(user.id);
    const bootstrapId = defaultTenantId();

    // Platform operator (Roberto) always manages humanberto.com bootstrap in /myoffice.
    if (
      isPlatformOperatorEmail(user.email) ||
      memberships.some((t) => t.id === bootstrapId)
    ) {
      return {
        tenantId: bootstrapId,
        userId: user.id,
        isLegacyAdmin: false,
        isBootstrapOffice: true,
      };
    }

    const jar = await cookies();
    let tenantId = jar.get(TENANT_COOKIE)?.value;
    if (!tenantId) tenantId = memberships[0]?.id;
    if (!tenantId) return null;
    if (!memberships.some((t) => t.id === tenantId)) return null;

    return {
      tenantId,
      userId: user.id,
      isLegacyAdmin: false,
      isBootstrapOffice: false,
    };
  } catch {
    return null;
  }
}
