import AdminCard from "../Components/AdminCard";
import EmptyState from "../Components/EmptyState";
import ModuleHero from "../Components/ModuleHero";

export default function ModulePlaceholderPage({ title, description }) {
  return (
    <div className="space-y-6">
      <ModuleHero
        eyebrow="Backend Pending"
        title={title}
        description={description}
      />
      <AdminCard title="Current Status">
        <EmptyState
          title={`${title} will be added safely`}
          description="This module is scaffolded in the admin panel, but the current backend and database schema do not yet provide the real endpoints required for production CRUD. It is intentionally left pending instead of faking behavior."
        />
      </AdminCard>
    </div>
  );
}
