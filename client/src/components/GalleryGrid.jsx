import GalleryCard from "./GalleryCard";

export default function GalleryGrid({ items, onOpen }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-md">
        No gallery images found for this category.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <GalleryCard
          key={item.id}
          item={item}
          onOpen={() => onOpen(index)}
        />
      ))}
    </div>
  );
}
