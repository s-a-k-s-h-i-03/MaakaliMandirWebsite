export default function AdminNavbar({ onLogout, onToggleTheme, theme }) {
  return (
    <header className="admin-topbar">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Temple Management System</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Administration</h1>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="admin-icon-button" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "light" ? "Dark" : "Light"}
        </button>
        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm md:block">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</p>
          <p className="font-semibold text-slate-900">Temple Manager</p>
        </div>
        <button type="button" className="admin-button-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
