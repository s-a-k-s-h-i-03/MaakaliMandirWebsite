export default function Lightbox({ open, items, index, onClose, onNext, onPrev }) {
  if (!open || !items.length || index < 0) {
    return null;
  }

  const item = items[index];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 p-4">
      <button
        type="button"
        className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        onClick={onClose}
      >
        Close
      </button>
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4">
        <button
          type="button"
          className="rounded-full bg-white/10 px-4 py-3 text-white"
          onClick={onPrev}
          aria-label="Previous image"
        >
          ←
        </button>
        <div className="min-w-0 flex-1 rounded-[2rem] bg-white/5 p-4 backdrop-blur">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-[72vh] w-full rounded-[1.5rem] object-contain"
          />
          <div className="mt-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
              {item.category}
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold">{item.title}</h3>
            {item.description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">{item.description}</p> : null}
          </div>
        </div>
        <button
          type="button"
          className="rounded-full bg-white/10 px-4 py-3 text-white"
          onClick={onNext}
          aria-label="Next image"
        >
          →
        </button>
      </div>
    </div>
  );
}
