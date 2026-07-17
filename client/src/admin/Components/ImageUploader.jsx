import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../../utils/media";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploader({
  value,
  onFileChange,
  error,
  disabled,
  uploadProgress = 0,
  label = "Image",
  inputId = "image-upload",
  maxFileSizeMb = 5,
  multiple = false,
}) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (!value) {
      setPreviews([]);
      return undefined;
    }

    const values = Array.isArray(value) ? value : [value];
    const objectUrls = [];
    const nextPreviews = values
      .filter(Boolean)
      .map((item) => {
        if (typeof item === "string") {
          return resolveMediaUrl(item);
        }

        const objectUrl = window.URL.createObjectURL(item);
        objectUrls.push(objectUrl);
        return objectUrl;
      });

    setPreviews(nextPreviews);

    return () => {
      objectUrls.forEach((url) => window.URL.revokeObjectURL(url));
    };
  }, [value]);

  function handleChange(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      onFileChange(multiple ? [] : null, "");
      return undefined;
    }

    if (files.some((file) => !allowedTypes.includes(file.type))) {
      onFileChange(multiple ? [] : null, "Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    if (files.some((file) => file.size > maxFileSizeMb * 1024 * 1024)) {
      onFileChange(multiple ? [] : null, `Image must be ${maxFileSizeMb}MB or smaller.`);
      return;
    }

    onFileChange(multiple ? files : files[0], "");
  }

  return (
    <div className="space-y-3">
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="admin-input"
        onChange={handleChange}
        disabled={disabled}
        multiple={multiple}
      />
      <p className="text-xs text-slate-500">
        Accepted formats: JPG, JPEG, PNG, WEBP. Maximum size: {maxFileSizeMb}MB.
      </p>
      {uploadProgress > 0 && uploadProgress < 100 ? (
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Uploading image</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#8b0000] to-[#d97706]" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      ) : null}
      {previews.length ? (
        <div className={`grid gap-3 ${previews.length > 1 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
          {previews.map((preview, index) => (
            <div key={`${preview}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img src={preview} alt={`${label} preview ${index + 1}`} className="h-52 w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
