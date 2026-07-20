import { useEffect, useState } from "react";
import { apiBaseUrl } from "../../content";

const initialForm = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  icon: "",
  display_order: 0,
  status: "Active",
  image: null,
  existingImage: "",
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ServiceForm({ open, initialValue, loading, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (initialValue) {
      setForm({
        title: initialValue.title || "",
        slug: initialValue.slug || "",
        short_description: initialValue.short_description || "",
        description: initialValue.description || "",
        icon: initialValue.icon || "",
        display_order: initialValue.display_order || 0,
        status: initialValue.status || "Active",
        image: null,
        existingImage: initialValue.image || "",
      });
      return;
    }

    setForm(initialForm);
    setErrors({});
  }, [initialValue, open]);

  if (!open) return null;

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.short_description.trim()) nextErrors.short_description = "Short description is required.";
    if (!form.description.trim()) nextErrors.description = "Full description is required.";
    if (!Number.isFinite(Number(form.display_order)) || Number(form.display_order) < 0) {
      nextErrors.display_order = "Display order must be zero or greater.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      ...form,
      slug: form.slug.trim() || slugify(form.title),
      display_order: Number(form.display_order),
    });
  }

  const preview = form.image
    ? window.URL.createObjectURL(form.image)
    : form.existingImage
      ? `${apiBaseUrl}${form.existingImage}`
      : "";

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold text-slate-900">{initialValue ? "Edit Service" : "Add Service"}</h2>
          <button type="button" className="admin-button-secondary" onClick={onClose}>Close</button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
              <input className="admin-input" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              {errors.title ? <p className="mt-2 text-sm text-red-600">{errors.title}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Slug</label>
              <input className="admin-input" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Auto-generated if empty" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Icon</label>
              <input className="admin-input" value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} placeholder="Example: Om, Katha, Deep" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Display Order</label>
              <input className="admin-input" type="number" value={form.display_order} onChange={(event) => setForm((current) => ({ ...current, display_order: event.target.value }))} />
              {errors.display_order ? <p className="mt-2 text-sm text-red-600">{errors.display_order}</p> : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Short Description</label>
            <textarea className="admin-input min-h-28" value={form.short_description} onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))} />
            {errors.short_description ? <p className="mt-2 text-sm text-red-600">{errors.short_description}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Full Description</label>
            <textarea className="admin-input min-h-40" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            {errors.description ? <p className="mt-2 text-sm text-red-600">{errors.description}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
              <select className="admin-input" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Image</label>
              <input className="admin-input" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(event) => setForm((current) => ({ ...current, image: event.target.files?.[0] || null }))} />
            </div>
          </div>

          {preview ? <img src={preview} alt="Service preview" className="h-56 w-full rounded-2xl object-cover" /> : null}

          <div className="flex justify-end gap-3">
            <button type="button" className="admin-button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-button-primary" disabled={loading}>{loading ? "Saving..." : "Save Service"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
