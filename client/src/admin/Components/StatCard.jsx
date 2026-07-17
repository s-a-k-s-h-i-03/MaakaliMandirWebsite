export default function StatCard({ label, value, hint, accent = "gold" }) {
  return (
    <article className="admin-card overflow-hidden">
      <div className={`admin-stat-glow admin-stat-${accent}`} />
      <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
        <p className="mt-3 text-sm text-slate-500">{hint}</p>
      </div>
    </article>
  );
}
