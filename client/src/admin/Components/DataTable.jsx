export default function DataTable({ columns, rows, emptyState, sort, onSortChange }) {
  if (!rows.length) {
    return emptyState;
  }

  function handleSort(column) {
    if (!column.sortable || !onSortChange) {
      return;
    }

    const nextDirection =
      sort?.key === column.key && sort?.direction === "asc" ? "desc" : "asc";

    onSortChange({ key: column.key, direction: nextDirection });
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-left"
                      onClick={() => handleSort(column)}
                    >
                      <span>{column.label}</span>
                      <span aria-hidden="true">
                        {sort?.key === column.key
                          ? sort.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, rowIndex) => (
              <tr key={row.id || row.receiptNo || rowIndex} className="hover:bg-amber-50/40">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-slate-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
