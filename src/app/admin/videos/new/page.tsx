import { VideoForm } from "@/components/admin/VideoForm";

export default function AdminNewVideoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          New video
        </h2>
        <p className="mt-1 text-sm text-muted">
          Add a YouTube video to the homepage gallery.
        </p>
      </div>
      <VideoForm />
    </div>
  );
}
