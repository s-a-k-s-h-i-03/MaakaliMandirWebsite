import { useEffect, useMemo, useState } from "react";
import AdminCard from "../Components/AdminCard";
import ConfirmDialog from "../Components/ConfirmDialog";
import GalleryForm from "../Components/GalleryForm";
import GalleryTable from "../Components/GalleryTable";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import ModuleHero from "../Components/ModuleHero";
import Pagination from "../Components/Pagination";
import SearchBar from "../Components/SearchBar";
import { useAdminTable } from "../Hooks/useAdminTable";
import { useToast } from "../Components/ToastProvider";
import { galleryCategories } from "../../services/galleryService";
import {
  createGallery,
  deleteGallery,
  getAdminGallery,
  getAdminGalleryItem,
  updateGallery,
} from "../../services/galleryService";

function mapGalleryRow(row) {
  return {
    ...row,
    featured: Boolean(row.featured),
  };
}

export default function GalleryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [category, setCategory] = useState("All");
  const { showToast } = useToast();

  async function loadGallery() {
    setLoading(true);
    try {
      const data = await getAdminGallery();
      setRows(data.map(mapGalleryRow));
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load gallery",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, []);

  const filteredRows = useMemo(
    () => (category === "All" ? rows : rows.filter((row) => row.category === category)),
    [category, rows],
  );

  const table = useAdminTable({
    rows: filteredRows,
    searchKeys: ["title", "description", "category", "status"],
    pageSize: 8,
    initialSort: { key: "created_at", direction: "desc" },
  });

  const counts = useMemo(() => ({
    total: rows.length,
    featured: rows.filter((row) => row.featured).length,
    active: rows.filter((row) => row.status === "Active").length,
  }), [rows]);

  async function handleCreate(payload, onUploadProgress) {
    setSubmitting(true);
    try {
      const response = await createGallery(payload, onUploadProgress);
      showToast({
        title: "Gallery uploaded",
        description: response.message,
      });
      setFormMode("");
      await loadGallery();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Upload failed",
        description: error.response?.data?.message || error.message,
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id) {
    try {
      const item = await getAdminGalleryItem(id);
      setSelectedRow(mapGalleryRow(item));
      setFormMode("edit");
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load gallery item",
        description: error.response?.data?.message || error.message,
      });
    }
  }

  async function handleUpdate(payload, onUploadProgress) {
    if (!selectedRow) return;

    setSubmitting(true);
    try {
      const response = await updateGallery(selectedRow.id, payload, onUploadProgress);
      showToast({
        title: "Gallery updated",
        description: response.message,
      });
      setFormMode("");
      setSelectedRow(null);
      await loadGallery();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Update failed",
        description: error.response?.data?.message || error.message,
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedRow) return;

    setDeleting(true);
    try {
      const response = await deleteGallery(selectedRow.id);
      showToast({
        title: "Gallery item deleted",
        description: response.message,
      });
      setSelectedRow(null);
      await loadGallery();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Delete failed",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleQuickToggle(row, changes, successTitle) {
    try {
      const response = await updateGallery(row.id, {
        title: row.title,
        description: row.description || "",
        category: row.category,
        featured: row.featured,
        status: row.status,
        display_order: row.display_order,
        images: [],
        ...changes,
      });

      showToast({
        title: successTitle,
        description: response.message,
      });
      await loadGallery();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Update failed",
        description: error.response?.data?.message || error.message,
      });
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHero
        eyebrow="Live Module"
        title="Gallery management"
        description="Upload, organize, and publish temple photo collections with secure image handling, category filters, and featured highlights."
        action={<button type="button" className="admin-button-primary" onClick={() => { setSelectedRow(null); setFormMode("create"); }}>Upload Images</button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard title="Total Images">{loading ? <LoadingSkeleton rows={1} /> : <p className="text-3xl font-bold text-slate-900">{counts.total}</p>}</AdminCard>
        <AdminCard title="Featured">{loading ? <LoadingSkeleton rows={1} /> : <p className="text-3xl font-bold text-slate-900">{counts.featured}</p>}</AdminCard>
        <AdminCard title="Active">{loading ? <LoadingSkeleton rows={1} /> : <p className="text-3xl font-bold text-slate-900">{counts.active}</p>}</AdminCard>
      </div>

      <AdminCard
        title="Gallery records"
        action={(
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchBar value={table.search} onChange={table.setSearch} placeholder="Search gallery..." />
            <select className="admin-input md:w-52" value={category} onChange={(event) => setCategory(event.target.value)}>
              {galleryCategories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        )}
      >
        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <>
            <GalleryTable
              rows={table.pagedRows}
              sort={table.sort}
              onSortChange={table.setSort}
              onEdit={handleEdit}
              onDelete={setSelectedRow}
              onToggleFeatured={(row) => handleQuickToggle(row, { featured: !row.featured }, "Featured flag updated")}
              onToggleStatus={(row) => handleQuickToggle(row, { status: row.status === "Active" ? "Inactive" : "Active" }, "Status updated")}
            />
            <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          </>
        )}
      </AdminCard>

      <GalleryForm
        open={formMode === "create" || formMode === "edit"}
        mode={formMode}
        initialValue={formMode === "edit" ? selectedRow : null}
        onClose={() => { setFormMode(""); setSelectedRow(null); }}
        onSubmit={formMode === "edit" ? handleUpdate : handleCreate}
        loading={submitting}
      />

      <ConfirmDialog
        open={Boolean(selectedRow) && !formMode}
        title="Delete Gallery Item"
        description={selectedRow ? `Delete "${selectedRow.title}"? This will remove its image from uploads as well.` : ""}
        onCancel={() => setSelectedRow(null)}
        onConfirm={handleDelete}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
