export default function GalleryCard({ item, onOpen }) {
  return (
    <article className="feature-card overflow-hidden p-0">
      <button
        type="button"
        className="block w-full text-left"
        onClick={onOpen}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="h-64 w-full object-cover transition duration-500 hover:scale-[1.03]"
        />
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="feature-kicker">{item.category}</span>
            {item.featured ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                Featured
              </span>
            ) : null}
          </div>
          <h3 className="feature-title text-xl">{item.title}</h3>
          {item.description ? <p className="feature-copy">{item.description}</p> : null}
        </div>
      </button>
    </article>
  );
}
