import "server-only";
import { cookies } from "next/headers";
import { getAdminSessionFromCookies } from "@/lib/admin/auth";
import { getAuthUser } from "@/lib/auth/server";
import { defaultTenantId } from "@/lib/tenant/server";
import { getTenantsForUser } from "@/lib/tenant/server";

export const TENANT_COOKIE = "hb_tenant_id";

export type OfficeContext = {
  tenantId: string;
  userId: string | null;
  isLegacyAdmin: boolean;
};

export async function resolveOfficeContext(): Promise<OfficeContext | null> {
  try {
    const legacy = await getAdminSessionFromCookies();
    if (legacy) {
      const jar = await cookies();
      const tenantId = jar.get(TENANT_COOKIE)?.value ?? defaultTenantId();
      return { tenantId, userId: null, isLegacyAdmin: true };
    }

    const user = await getAuthUser();
    if (!user) return null;

    const jar = await cookies();
    let tenantId = jar.get(TENANT_COOKIE)?.value;
    const memberships = await getTenantsForUser(user.id);
    if (!tenantId) {
      tenantId = memberships[0]?.id;
    }
    if (!tenantId) return null;
    if (!memberships.some((t) => t.id === tenantId)) return null;

    return { tenantId, userId: user.id, isLegacyAdmin: false };
  } catch {
    return null;
  }
}
