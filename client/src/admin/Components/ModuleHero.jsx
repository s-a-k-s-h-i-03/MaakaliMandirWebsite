export default function ModuleHero({ eyebrow, title, description, action }) {
  return (
    <div className="admin-hero">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-amber-50/90">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
