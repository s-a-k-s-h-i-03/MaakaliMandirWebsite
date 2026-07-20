import { useEffect, useState } from "react";
import AdminCard from "../Components/AdminCard";
import ConfirmDialog from "../Components/ConfirmDialog";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import ModuleHero from "../Components/ModuleHero";
import Pagination from "../Components/Pagination";
import SearchBar from "../Components/SearchBar";
import ServiceForm from "../Components/ServiceForm";
import ServiceTable from "../Components/ServiceTable";
import { useAdminTable } from "../Hooks/useAdminTable";
import { useToast } from "../Components/ToastProvider";
import {
  createService,
  deleteService,
  getAdminService,
  getAdminServices,
  updateService,
} from "../../services/serviceService";

export default function ServicesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  async function loadServices() {
    setLoading(true);
    try {
      const data = await getAdminServices();
      setRows(data);
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load services",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  const table = useAdminTable({
    rows,
    searchKeys: ["title", "slug", "short_description", "status"],
    pageSize: 8,
    initialSort: { key: "display_order", direction: "asc" },
  });

  async function handleCreate(payload) {
    setSubmitting(true);
    try {
      const response = await createService(payload);
      showToast({ title: "Service created", description: response.message });
      setOpenForm(false);
      await loadServices();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Create failed",
        description: error.response?.data?.message || error.message,
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id) {
    try {
      const service = await getAdminService(id);
      setEditing(service);
      setOpenForm(true);
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load service",
        description: error.response?.data?.message || error.message,
      });
    }
  }

  async function handleUpdate(payload) {
    if (!editing) return;

    setSubmitting(true);
    try {
      const response = await updateService(editing.id, payload);
      showToast({ title: "Service updated", description: response.message });
      setOpenForm(false);
      setEditing(null);
      await loadServices();
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
    if (!deleteTarget) return;

    try {
      const response = await deleteService(deleteTarget.id);
      showToast({ title: "Service deleted", description: response.message });
      setDeleteTarget(null);
      await loadServices();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Delete failed",
        description: error.response?.data?.message || error.message,
      });
    }
  }

  async function handleToggleStatus(row) {
    try {
      const response = await updateService(row.id, {
        title: row.title,
        slug: row.slug,
        short_description: row.short_description,
        description: row.description,
        icon: row.icon || "",
        display_order: row.display_order,
        status: row.status === "Active" ? "Inactive" : "Active",
        image: null,
      });

      showToast({
        title: "Status updated",
        description: response.message,
      });
      await loadServices();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Status update failed",
        description: error.response?.data?.message || error.message,
      });
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHero
        eyebrow="Live Module"
        title="Temple services management"
        description="Manage the seva catalog that powers both the homepage services section and the public service detail pages."
        action={<button type="button" className="admin-button-primary" onClick={() => { setEditing(null); setOpenForm(true); }}>Add Service</button>}
      />

      <AdminCard title="Services" action={<SearchBar value={table.search} onChange={table.setSearch} placeholder="Search services..." />}>
        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <>
            <ServiceTable
              rows={table.pagedRows}
              sort={table.sort}
              onSortChange={table.setSort}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onToggleStatus={handleToggleStatus}
            />
            <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          </>
        )}
      </AdminCard>

      <ServiceForm
        open={openForm}
        initialValue={editing}
        loading={submitting}
        onClose={() => { setOpenForm(false); setEditing(null); }}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Service"
        description={deleteTarget ? `Delete "${deleteTarget.title}"?` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
      />
    </div>
  );
}
