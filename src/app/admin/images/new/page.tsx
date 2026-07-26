import { ImageForm } from "@/components/admin/ImageForm";

export default function AdminNewImagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          New image
        </h2>
        <p className="mt-1 text-sm text-muted">
          Upload an image to the homepage gallery.
        </p>
      </div>
      <ImageForm />
    </div>
  );
}
