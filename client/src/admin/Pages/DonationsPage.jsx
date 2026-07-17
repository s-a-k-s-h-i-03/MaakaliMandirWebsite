import { useEffect, useMemo, useState } from "react";
import AdminCard from "../Components/AdminCard";
import ConfirmDialog from "../Components/ConfirmDialog";
import DonationFilters from "../Components/DonationFilters";
import DonationTable from "../Components/DonationTable";
import LoadingSkeleton from "../Components/LoadingSkeleton";
import ModuleHero from "../Components/ModuleHero";
import Pagination from "../Components/Pagination";
import ReceiptModal from "../Components/ReceiptModal";
import { useAdminTable } from "../Hooks/useAdminTable";
import { useToast } from "../Components/ToastProvider";
import { downloadAdminFile } from "../Services/api";
import {
  deleteDonation,
  fetchAdminDonationHeads,
  fetchAdminDonations,
  fetchDonationById,
  fetchDonationStats,
  getDonationReceipt,
  updateDonation,
} from "../../services/donationService";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function DonationsPage() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingDonation, setEditingDonation] = useState(null);
  const [filters, setFilters] = useState({
    head_id: "",
    payment_status: "",
    date_from: "",
    date_to: "",
  });
  const { showToast } = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const [donations, statsResponse, headsResponse] = await Promise.all([
        fetchAdminDonations(filters),
        fetchDonationStats(),
        fetchAdminDonationHeads(),
      ]);

      setRows(donations);
      setStats(statsResponse.data);
      setHeads(headsResponse.data);
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load donations",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filters.head_id, filters.payment_status, filters.date_from, filters.date_to]);

  const table = useAdminTable({
    rows,
    searchKeys: ["receipt_no", "donor_name", "phone", "address", "donation_head"],
    pageSize: 8,
    initialSort: { key: "created_at", direction: "desc" },
  });

  const cards = useMemo(() => ([
    { label: "Today's Donations", value: formatCurrency(stats?.todayAmount || 0) },
    { label: "Monthly Donations", value: formatCurrency(stats?.monthlyAmount || 0) },
    { label: "Total Donations", value: formatCurrency(stats?.totalAmount || 0) },
    { label: "Pending Payments", value: stats?.pendingPayments || 0 },
    { label: "Successful Payments", value: stats?.successfulPayments || 0 },
    { label: "Failed Payments", value: stats?.failedPayments || 0 },
  ]), [stats]);

  async function handleExport() {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    if (table.search) {
      params.set("search", table.search);
    }

    setExporting(true);

    try {
      const query = params.toString();
      await downloadAdminFile(
        `/api/admin/export/donations${query ? `?${query}` : ""}`,
        "donations.csv",
      );
    } catch (error) {
      showToast({
        tone: "error",
        title: "Export failed",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleView(id) {
    try {
      const response = await fetchDonationById(id);
      setSelectedDonation(response.data);
    } catch (error) {
      showToast({
        tone: "error",
        title: "Could not load donation",
        description: error.response?.data?.message || error.message,
      });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await deleteDonation(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
      showToast({ title: "Donation deleted", description: "The record was removed successfully." });
    } catch (error) {
      showToast({
        tone: "error",
        title: "Delete failed",
        description: error.response?.data?.message || error.message,
      });
    }
  }

  async function handleQuickEdit() {
    if (!editingDonation) return;

    try {
      await updateDonation(editingDonation.id, editingDonation);
      setEditingDonation(null);
      await loadData();
      showToast({ title: "Donation updated", description: "The donation status was updated." });
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
        title="Donation and payment management"
        description="Track donations, review payment outcomes, filter records, and open generated receipts from the new donation workflow."
        action={(
          <button
            type="button"
            className="admin-button-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <AdminCard key={card.label} title={card.label}>
            {loading ? <LoadingSkeleton rows={1} /> : <p className="text-3xl font-bold text-slate-900">{card.value}</p>}
          </AdminCard>
        ))}
      </div>

      <AdminCard title="Filters">
        <DonationFilters
          search={table.search}
          onSearchChange={table.setSearch}
          heads={heads}
          filters={filters}
          onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        />
      </AdminCard>

      <AdminCard title="Donation records">
        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <>
            <DonationTable
              rows={table.pagedRows}
              onView={handleView}
              onEdit={setEditingDonation}
              onDelete={setDeleteTarget}
              onReceipt={(id) => window.open(getDonationReceipt(id), "_blank")}
            />
            <Pagination page={table.page} totalPages={table.totalPages} onPageChange={table.setPage} />
          </>
        )}
      </AdminCard>

      <ReceiptModal donation={selectedDonation} onClose={() => setSelectedDonation(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Donation"
        description={deleteTarget ? `Delete donation record ${deleteTarget.receipt_no}?` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
      />

      {editingDonation ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-3xl font-semibold text-slate-900">Edit Donation</h2>
              <button type="button" className="admin-button-secondary" onClick={() => setEditingDonation(null)}>Close</button>
            </div>
            <div className="space-y-4">
              <input className="admin-input" value={editingDonation.donor_name} onChange={(event) => setEditingDonation((current) => ({ ...current, donor_name: event.target.value }))} />
              <input className="admin-input" value={editingDonation.phone} onChange={(event) => setEditingDonation((current) => ({ ...current, phone: event.target.value }))} />
              <select className="admin-input" value={editingDonation.payment_status} onChange={(event) => setEditingDonation((current) => ({ ...current, payment_status: event.target.value }))}>
                <option value="Pending">Pending</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" className="admin-button-secondary" onClick={() => setEditingDonation(null)}>Cancel</button>
                <button type="button" className="admin-button-primary" onClick={handleQuickEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
