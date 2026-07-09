"use client";

import { useSearchParams } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export function AdminLoginPageContent() {
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";

  return (
    <>
      {unauthorized && (
        <div className="bg-red-50 px-5 py-3 text-center text-sm font-medium text-red-700">
          This account does not have admin access.
        </div>
      )}
      <AdminLoginForm />
    </>
  );
}
