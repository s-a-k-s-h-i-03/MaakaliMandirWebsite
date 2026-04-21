import { Link, Outlet, useNavigate } from "react-router-dom";

const adminLinks = [
  { label: "Dashboard", to: "/admin/dashboard" },
  //{ label: "Donations", to: "/admin/donations" },
  { label: "Events", to: "/admin/events" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-[#FFF8E1]">
      <aside className="h-screen w-64 shrink-0 bg-white p-6 shadow-md">
        <h2 className="mb-6 text-lg font-bold text-[#7A1C1C]">Admin Panel</h2>

        <nav className="space-y-3 text-gray-700">
          {adminLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block rounded p-2 transition hover:bg-orange-100"
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={logout}
            className="mt-4 block w-full rounded p-2 text-left text-red-600 transition hover:bg-red-100"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
