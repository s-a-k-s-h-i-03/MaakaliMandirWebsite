import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import { resolveMediaUrl } from "../../utils/media";

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EventTable({ rows, onEdit, onDelete }) {
  return (
    <DataTable
      columns={[
        {
          key: "image",
          label: "Image",
          render: (row) => row.image ? (
            <img src={resolveMediaUrl(row.image)} alt={row.title} className="h-14 w-20 rounded-xl object-cover" />
          ) : (
            <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">No Image</div>
          ),
        },
        { key: "title", label: "Title" },
        { key: "event_date", label: "Date", render: (row) => formatDate(row.event_date || row.date) },
        { key: "location", label: "Location" },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <span className={`admin-status-pill ${row.status === "Active" ? "admin-status-pill-active" : "admin-status-pill-inactive"}`}>
              {row.status}
            </span>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          render: (row) => (
            <div className="flex gap-2">
              <button type="button" className="admin-button-secondary" onClick={() => onEdit(row.id)}>
                Edit
              </button>
              <button type="button" className="admin-button-danger" onClick={() => onDelete(row)}>
                Delete
              </button>
            </div>
          ),
        },
      ]}
      rows={rows}
      emptyState={<EmptyState title="No events found" description="Create your first event to show it on both the admin dashboard and public events page." />}
    />
  );
}
