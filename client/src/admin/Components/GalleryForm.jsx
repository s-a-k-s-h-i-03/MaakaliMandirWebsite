import { useEffect, useState } from "react";
import ImageUploader from "./ImageUploader";
import { galleryCategories } from "../../services/galleryService";

const initialForm = {
  title: "",
  description: "",
  category: "Temple",
  featured: false,
  status: "Active",
  display_order: 0,
  images: [],
  existingImage: "",
};

export default function GalleryForm({
  open,
  mode,
  initialValue,
  onClose,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});
    setImageError("");
    setUploadProgress(0);

    if (initialValue) {
      setForm({
        title: initialValue.title || "",
        description: initialValue.description || "",
        category: initialValue.category || "Temple",
        featured: Boolean(initialValue.featured),
        status: initialValue.status || "Active",
        display_order: initialValue.display_order || 0,
        images: [],
        existingImage: initialValue.image || "",
      });
      return;
    }

    setForm(initialForm);
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  function validate() {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.category) {
      nextErrors.category = "Category is required.";
    }

    if (!Number.isFinite(Number(form.display_order)) || Number(form.display_order) < 0) {
      nextErrors.display_order = "Display order must be zero or greater.";
    }

    if (mode !== "edit" && !form.images.length) {
      nextErrors.images = "At least one image is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && !imageError;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        featured: form.featured,
        status: form.status,
        display_order: Number(form.display_order),
        images: form.images,
      },
      (progressEvent) => {
        const total = progressEvent.total || 1;
        const progress = Math.min(100, Math.round((progressEvent.loaded * 100) / total));
        setUploadProgress(progress);
      },
    );
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              {mode === "edit" ? "Edit Gallery Item" : "Add Gallery Images"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Upload temple images securely and control how they appear on the public gallery.
            </p>
          </div>
          <button type="button" className="admin-button-secondary" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="gallery-title">Title</label>
              <input
                id="gallery-title"
                className="admin-input"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                disabled={loading}
              />
              {errors.title ? <p className="mt-2 text-sm text-red-600">{errors.title}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="gallery-category">Category</label>
              <select
                id="gallery-category"
                className="admin-input"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                disabled={loading}
              >
                {galleryCategories.filter((category) => category !== "All").map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category ? <p className="mt-2 text-sm text-red-600">{errors.category}</p> : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="gallery-order">Display Order</label>
              <input
                id="gallery-order"
                type="number"
                className="admin-input"
                value={form.display_order}
                onChange={(event) => setForm((current) => ({ ...current, display_order: event.target.value }))}
                disabled={loading}
              />
              {errors.display_order ? <p className="mt-2 text-sm text-red-600">{errors.display_order}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="gallery-featured">Featured</label>
              <select
                id="gallery-featured"
                className="admin-input"
                value={form.featured ? "true" : "false"}
                onChange={(event) => setForm((current) => ({ ...current, featured: event.target.value === "true" }))}
                disabled={loading}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="gallery-status">Status</label>
              <select
                id="gallery-status"
                className="admin-input"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="gallery-description">Description</label>
            <textarea
              id="gallery-description"
              className="admin-input min-h-36"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              disabled={loading}
            />
          </div>

          <ImageUploader
            label={mode === "edit" ? "Gallery Image" : "Gallery Images"}
            inputId="gallery-images"
            value={mode === "edit" ? form.images[0] || form.existingImage : form.images}
            onFileChange={(files, nextError) => {
              setImageError(nextError);
              setForm((current) => ({
                ...current,
                images: Array.isArray(files) ? files : files ? [files] : [],
              }));
            }}
            error={imageError || errors.images}
            disabled={loading}
            uploadProgress={uploadProgress}
            maxFileSizeMb={8}
            multiple={mode !== "edit"}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="admin-button-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="admin-button-primary" disabled={loading}>
              {loading ? "Saving..." : mode === "edit" ? "Update Gallery Item" : "Upload Images"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
