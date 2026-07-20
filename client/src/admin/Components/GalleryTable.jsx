import { apiBaseUrl } from "../../content";
import DataTable from "./DataTable";
import EmptyState from "./EmptyState";

function getImageUrl(image) {
  if (!image) return "";
  return image.startsWith("/uploads/") || image.startsWith("/assets/")
    ? `${apiBaseUrl}${image}`
    : image;
}

export default function GalleryTable({
  rows,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleStatus,
}) {
  return (
    <DataTable
      columns={[
        {
          key: "image",
          label: "Image",
          render: (row) => row.image ? (
            <img src={getImageUrl(row.image)} alt={row.title} className="h-14 w-20 rounded-xl object-cover" />
          ) : (
            <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">No Image</div>
          ),
        },
        { key: "title", label: "Title", sortable: true },
        { key: "category", label: "Category", sortable: true },
        { key: "display_order", label: "Order", sortable: true },
        {
          key: "featured",
          label: "Featured",
          sortable: true,
          render: (row) => (
            <button
              type="button"
              className={`admin-status-pill ${row.featured ? "admin-status-pill-active" : "admin-status-pill-inactive"}`}
              onClick={() => onToggleFeatured(row)}
            >
              {row.featured ? "Featured" : "Standard"}
            </button>
          ),
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (row) => (
            <button
              type="button"
              className={`admin-status-pill ${row.status === "Active" ? "admin-status-pill-active" : "admin-status-pill-inactive"}`}
              onClick={() => onToggleStatus(row)}
            >
              {row.status}
            </button>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          render: (row) => (
            <div className="flex gap-2">
              <button type="button" className="admin-button-secondary" onClick={() => onEdit(row.id)}>Edit</button>
              <button type="button" className="admin-button-danger" onClick={() => onDelete(row)}>Delete</button>
            </div>
          ),
        },
      ]}
      rows={rows}
      sort={sort}
      onSortChange={onSortChange}
      emptyState={<EmptyState title="No gallery images found" description="Upload your first gallery images to populate the public gallery page." />}
    />
  );
}
