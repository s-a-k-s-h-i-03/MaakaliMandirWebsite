import DataTable from "./DataTable";
import EmptyState from "./EmptyState";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function DonationTable({ rows, onView, onEdit, onDelete, onReceipt }) {
  return (
    <DataTable
      columns={[
        { key: "receipt_no", label: "Receipt No" },
        { key: "donor_name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "donation_head", label: "Donation Head" },
        { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
        { key: "payment_method", label: "Payment Method" },
        {
          key: "payment_status",
          label: "Status",
          render: (row) => (
            <span className={`admin-status-pill ${
              row.payment_status === "Success"
                ? "admin-status-pill-active"
                : row.payment_status === "Failed"
                  ? "bg-red-100 text-red-700"
                  : "admin-status-pill-inactive"
            }`}
            >
              {row.payment_status}
            </span>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          render: (row) => (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="admin-button-secondary" onClick={() => onView(row.id)}>View</button>
              <button type="button" className="admin-button-secondary" onClick={() => onReceipt(row.id)} disabled={!row.receipt_path}>Receipt</button>
              <button type="button" className="admin-button-secondary" onClick={() => onEdit(row)}>Edit</button>
              <button type="button" className="admin-button-danger" onClick={() => onDelete(row)}>Delete</button>
            </div>
          ),
        },
      ]}
      rows={rows}
      emptyState={<EmptyState title="No donations found" description="Try changing your filters or wait for new donations to be recorded." />}
    />
  );
}
