import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import AdminSidebar from "../Components/AdminSidebar";
import { useAdminTheme } from "../Hooks/useAdminTheme";
import { useAdminAuth } from "../Context/AdminAuthContext";

export default function AdminShell() {
  const { theme, toggleTheme } = useAdminTheme();
  const auth = useAdminAuth();
  const navigate = useNavigate();

  function handleLogout() {
    auth.logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminNavbar onLogout={handleLogout} onToggleTheme={toggleTheme} theme={theme} />
        <main className="px-4 pb-8 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
