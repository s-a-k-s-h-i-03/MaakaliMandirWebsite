export default function ReceiptModal({ donation, onClose }) {
  if (!donation) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold text-slate-900">Donation Details</h2>
          <button type="button" className="admin-button-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Receipt No</p><p className="mt-2 font-semibold">{donation.receipt_no}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Order ID</p><p className="mt-2 font-semibold">{donation.order_id}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</p><p className="mt-2 font-semibold">{donation.donor_name}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</p><p className="mt-2 font-semibold">{donation.phone}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Donation Head</p><p className="mt-2 font-semibold">{donation.donation_head}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p><p className="mt-2 font-semibold">{donation.payment_status}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Address</p><p className="mt-2 font-semibold">{donation.address}</p></div>
        </div>
      </div>
    </div>
  );
}
