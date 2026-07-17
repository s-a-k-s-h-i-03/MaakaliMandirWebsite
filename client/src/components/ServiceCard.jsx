import { Link } from "react-router-dom";
import { apiBaseUrl } from "../content";

function getImageUrl(image) {
  if (!image) return "";
  return image.startsWith("/uploads/") ? `${apiBaseUrl}${image}` : image;
}

export default function ServiceCard({ service, compact = false }) {
  return (
    <article className="feature-card h-full">
      {service.image ? (
        <img
          src={getImageUrl(service.image)}
          alt={service.title}
          className={`${compact ? "h-44" : "h-56"} w-full rounded-2xl object-cover`}
        />
      ) : null}
      <div className="mt-4">
        <span className="feature-kicker">{service.icon || "Temple Service"}</span>
        <h3 className="feature-title">{service.title}</h3>
        <p className="feature-copy">{service.short_description}</p>
        <Link
          to={`/services/${service.slug}`}
          className="mt-4 inline-flex rounded-xl border border-[#eed3a5] px-4 py-2 text-sm font-semibold text-temple-maroon transition hover:bg-[#fff4dc]"
        >
          Read More
        </Link>
      </div>
    </article>
  );
}
