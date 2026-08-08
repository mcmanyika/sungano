import { redirect } from "next/navigation";

/** Hero video is now chosen from the Videos listing. */
export default function AdminVideoPage() {
  redirect("/admin/videos");
}
