import { useEffect, useState } from "react";
import ImageUploader from "./ImageUploader";

const initialForm = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  status: "Active",
  image: null,
  existingImage: "",
};

export default function EventForm({
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
        event_date: initialValue.event_date || initialValue.date || "",
        location: initialValue.location || "",
        status: initialValue.status || "Active",
        image: null,
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
    } else if (form.title.trim().length < 5) {
      nextErrors.title = "Title must be at least 5 characters.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!form.event_date) {
      nextErrors.event_date = "Date is required.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!form.status) {
      nextErrors.status = "Status is required.";
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
        event_date: form.event_date,
        location: form.location.trim(),
        status: form.status,
        image: form.image,
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
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              {mode === "edit" ? "Edit Event" : "Add Event"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Fill in the event details below. Active events will appear on the public website automatically.
            </p>
          </div>
          <button type="button" className="admin-button-secondary" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="event-title">Title</label>
              <input
                id="event-title"
                className="admin-input"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                disabled={loading}
              />
              {errors.title ? <p className="mt-2 text-sm text-red-600">{errors.title}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="event-date">Date</label>
              <input
                id="event-date"
                type="date"
                className="admin-input"
                value={form.event_date}
                onChange={(event) => setForm((current) => ({ ...current, event_date: event.target.value }))}
                disabled={loading}
              />
              {errors.event_date ? <p className="mt-2 text-sm text-red-600">{errors.event_date}</p> : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="event-location">Location</label>
              <input
                id="event-location"
                className="admin-input"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                disabled={loading}
              />
              {errors.location ? <p className="mt-2 text-sm text-red-600">{errors.location}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="event-status">Status</label>
              <select
                id="event-status"
                className="admin-input"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status ? <p className="mt-2 text-sm text-red-600">{errors.status}</p> : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              className="admin-input min-h-36"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              disabled={loading}
            />
            {errors.description ? <p className="mt-2 text-sm text-red-600">{errors.description}</p> : null}
          </div>

          <ImageUploader
            value={form.image || form.existingImage}
            onFileChange={(file, nextError) => {
              setImageError(nextError);
              setForm((current) => ({ ...current, image: file }));
            }}
            error={imageError}
            disabled={loading}
            uploadProgress={uploadProgress}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="admin-button-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="admin-button-primary" disabled={loading}>
              {loading ? "Saving..." : mode === "edit" ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
