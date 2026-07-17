import { useEffect, useMemo, useState } from "react";
import AdminCard from "../Components/AdminCard";
import DeleteModal from "../Components/DeleteModal";
import EventForm from "../Components/EventForm";
import EventTable from "../Components/EventTable";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import ModuleHero from "../Components/ModuleHero";
import SearchBar from "../Components/SearchBar";
import { useAdminTable } from "../Hooks/useAdminTable";
import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  getEvent,
  updateEvent,
} from "../Services/eventService";
import { useToast } from "../Components/ToastProvider";

function mapEvent(row) {
  const dateValue = row.event_date || row.date;
  const date = dateValue ? new Date(dateValue) : null;
  const now = new Date();
  const timeline = !date ? "Draft" : date >= now ? "Upcoming" : "Past";

  return {
    id: row.id,
    title: row.title || "Untitled event",
    description: row.description || "No description available",
    image: row.image || "",
    date: dateValue || "-",
    event_date: row.event_date || row.date || "",
    location: row.location || "Temple campus",
    status: row.status || "Inactive",
    timeline,
  };
}

export default function EventsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function loadEvents() {
    try {
      const data = await getAdminEvents();
      setRows(data.map(mapEvent));
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load events",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [showToast]);

  const table = useAdminTable({
    rows,
    searchKeys: ["title", "description", "status", "location", "timeline"],
    pageSize: 6,
    initialSort: { key: "event_date", direction: "desc" },
  });

  const counts = useMemo(() => ({
    total: rows.length,
    active: rows.filter((row) => row.status === "Active").length,
    upcoming: rows.filter((row) => row.timeline === "Upcoming").length,
  }), [rows]);

  async function handleCreate(payload, onUploadProgress) {
    setSubmitting(true);

    try {
      const response = await createEvent(payload, onUploadProgress);
      showToast({
        title: "Event created",
        description: response.message,
      });
      setFormMode("");
      await loadEvents();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not create event",
        description: error.response?.data?.message || error.message,
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id) {
    try {
      const event = await getEvent(id);
      setSelectedEvent(mapEvent(event));
      setFormMode("edit");
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load event",
        description: error.response?.data?.message || error.message,
      });
    }
  }

  async function handleUpdate(payload, onUploadProgress) {
    if (!selectedEvent) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await updateEvent(selectedEvent.id, payload, onUploadProgress);
      showToast({
        title: "Event updated",
        description: response.message,
      });
      setFormMode("");
      setSelectedEvent(null);
      await loadEvents();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not update event",
        description: error.response?.data?.message || error.message,
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedEvent) {
      return;
    }

    setDeleting(true);

    try {
      const response = await deleteEvent(selectedEvent.id);
      showToast({
        title: "Event deleted",
        description: response.message,
      });
      setSelectedEvent(null);
      await loadEvents();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not delete event",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHero
        eyebrow="Live Module"
        title="Event management"
        description="Create, edit, and publish temple events with secure image uploads, active/inactive visibility controls, and automatic syncing to the public events page."
        action={<button type="button" className="admin-button-primary" onClick={() => { setSelectedEvent(null); setFormMode("create"); }}>Add Event</button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard title="Total Events">{loading ? <LoadingSkeleton rows={1} /> : <p className="text-3xl font-bold text-slate-900">{counts.total}</p>}</AdminCard>
        <AdminCard title="Active">{loading ? <LoadingSkeleton rows={1} /> : <p className="text-3xl font-bold text-slate-900">{counts.active}</p>}</AdminCard>
        <AdminCard title="Upcoming">{loading ? <LoadingSkeleton rows={1} /> : <p className="text-3xl font-bold text-slate-900">{counts.upcoming}</p>}</AdminCard>
      </div>

      <AdminCard
        title="Current event records"
        action={<SearchBar value={table.search} onChange={table.setSearch} placeholder="Search events..." />}
      >
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : (
          <EventTable
            rows={table.pagedRows}
            onEdit={handleEdit}
            onDelete={(event) => setSelectedEvent(event)}
          />
        )}
      </AdminCard>

      <EventForm
        open={formMode === "create" || formMode === "edit"}
        mode={formMode}
        initialValue={formMode === "edit" ? selectedEvent : null}
        onClose={() => { setFormMode(""); setSelectedEvent(null); }}
        onSubmit={formMode === "edit" ? handleUpdate : handleCreate}
        loading={submitting}
      />

      <DeleteModal
        event={formMode ? null : selectedEvent}
        onCancel={() => setSelectedEvent(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
