export default function DonationFilters({ search, onSearchChange, heads, filters, onFilterChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <input className="admin-input" placeholder="Search donations..." value={search} onChange={(event) => onSearchChange(event.target.value)} />
      <select className="admin-input" value={filters.head_id} onChange={(event) => onFilterChange("head_id", event.target.value)}>
        <option value="">All Heads</option>
        {heads.map((head) => <option key={head.id} value={head.id}>{head.name}</option>)}
      </select>
      <select className="admin-input" value={filters.payment_status} onChange={(event) => onFilterChange("payment_status", event.target.value)}>
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Success">Success</option>
        <option value="Failed">Failed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <input className="admin-input" type="date" value={filters.date_from} onChange={(event) => onFilterChange("date_from", event.target.value)} />
      <input className="admin-input" type="date" value={filters.date_to} onChange={(event) => onFilterChange("date_to", event.target.value)} />
    </div>
  );
}
