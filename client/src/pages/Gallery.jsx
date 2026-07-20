import { useEffect, useMemo, useRef, useState } from "react";
import CategoryFilter from "../components/CategoryFilter";
import GalleryGrid from "../components/GalleryGrid";
import Lightbox from "../components/Lightbox";
import { galleryCategories, getGallery } from "../services/galleryService";
import { resolveMediaUrl } from "../utils/media";

const fallbackGalleryItems = [
  {
    id: "fallback-mandirmain",
    title: "Maa Kali Mandir",
    description: "Temple view from the main gallery collection.",
    image: "/assets/images/mandirmain.jpg",
    category: "Temple",
    featured: true,
    status: "Active",
  },
  {
    id: "fallback-sonkund",
    title: "Sonkund",
    description: "Sonkund view displayed in the public gallery.",
    image: "/assets/images/sonkund.jpg",
    category: "Temple",
    featured: true,
    status: "Active",
  },
  {
    id: "fallback-1a029cfa",
    title: "Temple Gallery 1",
    description: "Temple gallery image.",
    image: "/assets/images/photogalery/1a029cfa-e814-476e-8e60-d257c533d53e.jpg",
    category: "Temple",
    featured: true,
    status: "Active",
  },
  {
    id: "fallback-1d9518c0",
    title: "Temple Gallery 2",
    description: "Temple gallery image.",
    image: "/assets/images/photogalery/1d9518c0-1570-41ae-8b56-5b33023e0c9d.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-7f06e84c",
    title: "Temple Gallery 3",
    description: "Temple gallery image.",
    image: "/assets/images/photogalery/7f06e84c-40c0-452c-9c49-d98e45402ca1.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-8ec70b3b",
    title: "Temple Gallery 4",
    description: "Temple gallery image.",
    image: "/assets/images/photogalery/8ec70b3b-37f5-48bd-9cc2-979dc8a069df.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-134c26d3",
    title: "Temple Gallery 5",
    description: "Temple gallery image.",
    image: "/assets/images/134c26d3-fd4c-4720-8a84-3f0c50d16444.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-162eb6b8",
    title: "Temple Gallery 6",
    description: "Temple gallery image.",
    image: "/assets/images/162eb6b8-9d51-47a8-9b46-e4cfc3061d2e.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-4360d0e7",
    title: "Temple Gallery 7",
    description: "Temple gallery image.",
    image: "/assets/images/4360d0e7-7f09-454d-b8bc-7214d8893ac4.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-99ca065f",
    title: "Temple Gallery 8",
    description: "Temple gallery image.",
    image: "/assets/images/99ca065f-93b3-47f7-b565-a69784ef07fe.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-a2df3147",
    title: "Temple Gallery 9",
    description: "Temple gallery image.",
    image: "/assets/images/a2df3147-7e1a-4533-b19d-e8caf67425ac.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-img-20211109",
    title: "Temple Gallery 10",
    description: "Temple gallery image.",
    image: "/assets/images/photogalery/IMG-20211109-WA0007.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-img-20221003",
    title: "Temple Gallery 11",
    description: "Temple gallery image.",
    image: "/assets/images/photogalery/IMG-20221003-WA0030.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-img-20221004",
    title: "Temple Gallery 12",
    description: "Temple gallery image.",
    image: "/assets/images/photogalery/IMG20221004151412.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
  {
    id: "fallback-img-20250922",
    title: "Temple Gallery 13",
    description: "Temple gallery image.",
    image: "/assets/images/photogalery/IMG20250922132957.jpg",
    category: "Temple",
    featured: false,
    status: "Active",
  },
];

function mapGalleryItem(item) {
  return {
    ...item,
    imageUrl: resolveMediaUrl(item.image),
    featured: Boolean(item.featured),
  };
}

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const sentinelRef = useRef(null);

  useEffect(() => {
    async function loadGallery() {
      try {
        const data = await getGallery();
        const rows = Array.isArray(data) && data.length > 0 ? data : fallbackGalleryItems;
        setItems(rows.map(mapGalleryItem));
      } catch {
        setItems(fallbackGalleryItems.map(mapGalleryItem));
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  const featuredItems = useMemo(
    () => items.filter((item) => item.featured).slice(0, 4),
    [items],
  );

  const filteredItems = useMemo(() => {
    const rows = category === "All"
      ? items
      : items.filter((item) => item.category === category);

    return rows;
  }, [category, items]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(9);
  }, [category]);

  useEffect(() => {
    if (!sentinelRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((current) => Math.min(filteredItems.length, current + 6));
      }
    }, { rootMargin: "240px" });

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [filteredItems.length]);

  return (
    <section className="services-section py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 text-center">
          <span className="section-kicker">Temple Gallery</span>
          <h1 className="section-heading mb-4 mt-3">Gallery</h1>
          <p className="mx-auto max-w-2xl font-display text-lg leading-8 text-slate-600">
            Explore temple moments, festivals, puja memories, and community highlights through the live gallery.
          </p>
        </div>

        {category === "All" && featuredItems.length ? (
          <div className="section-shell service-shell mb-10">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <span className="section-kicker">Featured</span>
                <h2 className="section-heading-left mb-0 mt-3 text-3xl">Highlighted temple moments</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {featuredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="overflow-hidden rounded-[1.5rem] bg-white text-left shadow-md"
                  onClick={() => setLightboxIndex(items.findIndex((row) => row.id === item.id))}
                >
                  <img src={item.imageUrl} alt={item.title} loading="lazy" className="h-52 w-full object-cover" />
                  <div className="p-4">
                    <p className="feature-kicker">{item.category}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-temple-maroon">{item.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="section-shell service-shell">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="section-kicker">Browse</span>
              <h2 className="section-heading-left mb-0 mt-3 text-3xl">Photo collection</h2>
            </div>
            <CategoryFilter categories={galleryCategories} value={category} onChange={setCategory} />
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-md">Loading gallery...</div>
          ) : (
            <>
              <GalleryGrid items={visibleItems} onOpen={setLightboxIndex} />
              <div ref={sentinelRef} className="h-10" aria-hidden="true" />
            </>
          )}
        </div>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        items={filteredItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onPrev={() => setLightboxIndex((current) => (current <= 0 ? filteredItems.length - 1 : current - 1))}
        onNext={() => setLightboxIndex((current) => (current >= filteredItems.length - 1 ? 0 : current + 1))}
      />
    </section>
  );
}
