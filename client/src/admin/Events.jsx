import { useEffect, useState } from "react";
import axios from "axios";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    date: ""
  });

  const token = localStorage.getItem("token");
  const apiBaseUrl = "http://localhost:5000";

  // ✅ Fetch events
  const fetchData = () => {
    axios
      .get(`${apiBaseUrl}/api/admin/events`, {
        headers: { Authorization: token }
      })
      .then((res) => setEvents(res.data))
      .catch(() => alert("Error loading events"));
  };

  useEffect(fetchData, []);

  // ✅ Upload image
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `${apiBaseUrl}/api/admin/upload`,
      formData,
      {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    return res.data.path;
  };

  // ✅ Submit event
  const submit = async () => {
    const payload = {
      title: form.title.trim(),
      description: form.description || "",
      image: form.image || "",
      date: form.date
    };

    if (!payload.title || !payload.date) {
      alert("Title and date required");
      return;
    }

    if (payload.image && !payload.image.startsWith("/uploads/")) {
      alert("Please upload a valid event image");
      return;
    }

    setIsSaving(true);

    try {
      await axios.post(`${apiBaseUrl}/api/admin/events`, payload, {
        headers: { Authorization: token }
      });

      fetchData();
      setForm({ title: "", description: "", image: "", date: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Delete event
  const del = (id) => {
    axios
      .delete(`${apiBaseUrl}/api/admin/events/${id}`, {
        headers: { Authorization: token }
      })
      .then(fetchData);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#7A1C1C]">
        Events
      </h1>

      {/* FORM */}
      <div className="grid gap-3 mb-6 bg-white p-4 rounded-xl shadow-md">
        <input
          className="border p-2 rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        {/* ✅ FILE UPLOAD */}
        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setIsUploading(true);

            try {
              const path = await uploadImage(file);
              setForm((current) => ({ ...current, image: path }));
            } catch (err) {
              console.error(err);
              alert(err.response?.data?.message || "Image upload failed");
            } finally {
              setIsUploading(false);
            }
          }}
        />

        {isUploading && (
          <p className="text-sm text-gray-500">Uploading image...</p>
        )}

        {/* ✅ Preview uploaded image */}
        {form.image && (
          <img
            src={`${apiBaseUrl}${form.image}`}
            alt="Event preview"
            className="w-32 rounded mt-2"
          />
        )}

        <input
          className="border p-2 rounded"
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <textarea
          className="border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button
          onClick={submit}
          disabled={isSaving || isUploading}
          className="bg-red-700 text-white p-2 rounded hover:bg-red-800 transition"
        >
          {isSaving ? "Saving..." : "Add Event"}
        </button>
      </div>

      {/* EVENTS LIST */}
      <div className="space-y-4">
        {events.map((e) => (
          <div
            key={e.id}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition"
          >
            <h2 className="font-bold text-lg">{e.title}</h2>
            <p className="text-gray-600">{e.description}</p>
            <p className="text-sm text-gray-400">{e.date}</p>

            {e.image && (
              <img
                src={`${apiBaseUrl}${e.image}`}
                alt={e.title}
                className="mt-2 rounded-lg w-40"
              />
            )}

            <button
              onClick={() => del(e.id)}
              className="text-red-600 mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
