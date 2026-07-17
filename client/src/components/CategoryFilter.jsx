export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const active = value === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-temple-maroon text-white shadow-lg"
                : "border border-[#eed3a5] bg-white text-temple-maroon hover:bg-[#fff4dc]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
