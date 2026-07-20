export default function AdminCard({ title, action, children, className = "" }) {
  return (
    <section className={`admin-card ${className}`}>
      {(title || action) ? (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title ? <h2 className="font-display text-2xl font-semibold text-slate-900">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
