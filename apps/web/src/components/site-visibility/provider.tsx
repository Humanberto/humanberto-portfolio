"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  isFeatureVisible,
  type ResolvedSiteVisibility,
  type SiteFeatureId,
} from "@/lib/site-visibility";

const SiteVisibilityContext = createContext<ResolvedSiteVisibility | null>(null);

export function SiteVisibilityProvider({
  value,
  children,
}: {
  value: ResolvedSiteVisibility;
  children: ReactNode;
}) {
  return (
    <SiteVisibilityContext.Provider value={value}>{children}</SiteVisibilityContext.Provider>
  );
}

export function useSiteVisibility(): ResolvedSiteVisibility {
  const ctx = useContext(SiteVisibilityContext);
  if (!ctx) {
    throw new Error("useSiteVisibility must be used within SiteVisibilityProvider");
  }
  return ctx;
}

export function useFeatureVisible(featureId: SiteFeatureId | string): boolean {
  const visibility = useSiteVisibility();
  return isFeatureVisible(visibility, featureId);
}

export function VisibilityGate({
  featureId,
  children,
  fallback = null,
}: {
  featureId: SiteFeatureId | string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const visible = useFeatureVisible(featureId);
  if (!visible) return fallback;
  return children;
}
