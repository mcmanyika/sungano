"use client";

import { Loader2 } from "lucide-react";
import { PartnerAuth } from "@/components/partner/PartnerAuth";
import { PartnerDashboard } from "@/components/partner/PartnerDashboard";
import { useAuth } from "@/hooks/useAuth";

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
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <PartnerAuth />;
  }

  return <PartnerDashboard user={user} />;
}
