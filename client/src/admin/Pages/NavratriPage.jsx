import { useEffect, useMemo, useState } from "react";
import AdminCard from "../Components/AdminCard";
import ConfirmDialog from "../Components/ConfirmDialog";
import DataTable from "../Components/DataTable";
import EmptyState from "../Components/EmptyState";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import ModuleHero from "../Components/ModuleHero";
import Pagination from "../Components/Pagination";
import SearchBar from "../Components/SearchBar";
import { useAdminTable } from "../Hooks/useAdminTable";
import { adminApi, downloadAdminFile } from "../Services/api";
import { useToast } from "../Components/ToastProvider";

const tabs = [
  { key: "tel", label: "Tel" },
  { key: "ghrit", label: "Ghrit" },
  { key: "jawara", label: "Jawara" },
];

export default function NavratriPage() {
  const [type, setType] = useState("tel");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function loadRows() {
    setLoading(true);

    try {
      const { data } = await adminApi.get(`/api/navratri?type=${type}`);
      setRows(data.items || []);
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load Navratri records",
        description: error.response?.data?.error || error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, [showToast, type]);

  const table = useAdminTable({
    rows,
    searchKeys: ["kalashNo", "receiptNo", "name", "address"],
    pageSize: 8,
  });

  const exportName = useMemo(() => `${type}.csv`, [type]);

  async function handleExport() {
    setExporting(true);

    try {
      await downloadAdminFile(`/api/admin/export/navratri?type=${type}`, exportName);
    } catch (error) {
      showToast({
        tone: "error",
        title: "Export failed",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAll() {
    setDeleting(true);

    try {
      const { data } = await adminApi.delete(`/api/admin/navratri?type=${type}`);
      showToast({
        title: "Registrations deleted",
        description: data.message,
      });
      setDeleteOpen(false);
      await loadRows();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Delete failed",
        description: error.response?.data?.error || error.response?.data?.message || error.message,
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteOne() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      const { data } = await adminApi.delete(`/api/admin/navratri/item?type=${type}`, {
        data: {
          kalashNo: deleteTarget.kalashNo,
          receiptNo: deleteTarget.receiptNo,
        },
      });

      showToast({
        title: "Registration deleted",
        description: data.message,
      });
      setDeleteTarget(null);
      await loadRows();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Delete failed",
        description: error.response?.data?.error || error.response?.data?.message || error.message,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHero
        eyebrow="Live Data"
        title="Navratri registrations"
        description="Search and export Tel, Ghrit, and Jawara registrations for Navratri."
        action={(
          <div className="flex flex-wrap gap-3">
            <button type="button" className="admin-button-secondary" onClick={() => setDeleteOpen(true)} disabled={loading || deleting || rows.length === 0}>
              {deleting ? "Deleting..." : "Delete All"}
            </button>
            <button type="button" className="admin-button-primary" onClick={handleExport} disabled={exporting}>
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        )}
      />

      <AdminCard
        title="Registration lists"
        action={<SearchBar value={table.search} onChange={table.setSearch} placeholder="Search registrations..." />}
      >
        <div className="mb-5 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`admin-tab ${type === tab.key ? "admin-tab-active" : ""}`}
              onClick={() => setType(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : (
          <>
            <DataTable
              columns={[
                { key: "kalashNo", label: "Kalash No" },
                { key: "receiptNo", label: "Receipt No" },
                { key: "name", label: "Name" },
                { key: "address", label: "Address" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <button
                      type="button"
                      className="admin-button-danger"
                      onClick={() => setDeleteTarget(row)}
                    >
                      Delete
                    </button>
                  ),
                },
              ]}
              rows={table.pagedRows}
              emptyState={<EmptyState title="No registrations found" description="There are no matching registrations for this list yet." />}
            />
            <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          </>
        )}
      </AdminCard>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete All Registrations"
        description={`Delete all ${tabs.find((tab) => tab.key === type)?.label || type} registrations? This cannot be undone.`}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAll}
        confirmLabel={deleting ? "Deleting..." : "Delete All"}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Registration"
        description={deleteTarget ? `Delete Kalash No ${deleteTarget.kalashNo || "-"} / Receipt No ${deleteTarget.receiptNo || "-"}?` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOne}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
