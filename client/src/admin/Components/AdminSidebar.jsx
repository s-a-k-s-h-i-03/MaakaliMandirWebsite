import { NavLink } from "react-router-dom";
import { adminModules } from "../Services/modules";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">Temple Admin</p>
        <h2 className="mt-3 font-display text-2xl font-bold text-white">Maa Kali</h2>
        <p className="mt-2 text-sm leading-6 text-amber-50/75">Operational dashboard for temple records, events, and donor activity.</p>
      </div>

      <nav className="mt-8 space-y-2" aria-label="Admin navigation">
        {adminModules.map((module) => (
          <NavLink
            key={module.key}
            to={module.to}
            className={({ isActive }) =>
              `admin-sidebar-link ${isActive ? "admin-sidebar-link-active" : ""}`
            }
          >
            <span>{module.label}</span>
            <span className={`admin-badge ${module.status === "live" ? "admin-badge-live" : module.status === "partial" ? "admin-badge-partial" : "admin-badge-pending"}`}>
              {module.status}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
