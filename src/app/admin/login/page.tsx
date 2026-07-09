import { Suspense } from "react";
import { AdminLoginPageContent } from "./AdminLoginPageContent";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginPageContent />
    </Suspense>
  );
}
