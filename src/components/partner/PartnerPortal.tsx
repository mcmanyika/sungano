"use client";

import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { PartnerAuth } from "@/components/partner/PartnerAuth";
import { PartnerDashboard } from "@/components/partner/PartnerDashboard";
import { useAuth } from "@/hooks/useAuth";

function PartnerDashboardFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function PartnerPortal() {
  const { user, loading, configured } = useAuth();

  if (!configured) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-5 text-center">
        <p className="max-w-sm text-sm text-muted">
          The partner portal is not available right now. Please check back
          later.
        </p>
      </div>
    );
  }

  if (loading) {
    return <PartnerDashboardFallback />;
  }

  if (!user) {
    return <PartnerAuth />;
  }

  return (
    <Suspense fallback={<PartnerDashboardFallback />}>
      <PartnerDashboard user={user} />
    </Suspense>
  );
}
