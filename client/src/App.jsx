import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Donation from "./pages/Donation";
import Events from "./pages/Events";
import GalleryPage from "./pages/Gallery";
import NavratriList from "./pages/NavratriList";
import ServicesPage from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";

const AdminShell = lazy(() => import("./admin/Layouts/AdminShell"));
const LoginPage = lazy(() => import("./admin/Pages/LoginPage"));
const DashboardPage = lazy(() => import("./admin/Pages/DashboardPage"));
const DonationsPage = lazy(() => import("./admin/Pages/DonationsPage"));
const EventsPage = lazy(() => import("./admin/Pages/EventsPage"));
const NavratriPage = lazy(() => import("./admin/Pages/NavratriPage"));
const AdminServicesPage = lazy(() => import("./admin/Pages/ServicesPage"));
const AdminGalleryPage = lazy(() => import("./admin/Pages/GalleryPage"));
const ModulePlaceholderPage = lazy(() => import("./admin/Pages/ModulePlaceholderPage"));

function AdminFallback() {
  return <div className="p-6 text-sm text-slate-500">Loading admin panel...</div>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-body text-slate-800">
      <Suspense fallback={<AdminFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donation" element={<Donation />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/navratri/:type" element={<NavratriList />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetails />} />
          </Route>

          <Route path="/admin/login" element={<LoginPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="donations" element={<DonationsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="navratri" element={<NavratriPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="payments" element={<ModulePlaceholderPage title="Payments" description="Payment records require dedicated backend routes and schema definitions beyond the current system." />} />
            <Route path="enquiries" element={<ModulePlaceholderPage title="Temple Enquiries" description="Enquiry management depends on backend implementation for the currently placeholder `/api/enquiry` flow." />} />
            <Route path="reports" element={<ModulePlaceholderPage title="Reports" description="Reports will be added when the backend provides aggregated report endpoints and export workflows." />} />
            <Route path="users" element={<ModulePlaceholderPage title="Users" description="Role-based user CRUD needs explicit backend support and database fields before activation." />} />
            <Route path="settings" element={<ModulePlaceholderPage title="Settings" description="Temple settings management requires persistent backend storage that is not yet present in the current schema." />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}
