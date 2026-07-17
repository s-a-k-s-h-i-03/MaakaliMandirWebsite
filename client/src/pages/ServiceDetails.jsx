import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiBaseUrl } from "../content";
import { getServiceBySlug } from "../services/serviceService";

function getImageUrl(image) {
  if (!image) return "";
  return image.startsWith("/uploads/") ? `${apiBaseUrl}${image}` : image;
}

export default function ServiceDetails() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadService() {
      try {
        const data = await getServiceBySlug(slug);
        setService(data);
      } catch (_error) {
        setService(null);
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [slug]);

  if (loading) {
    return (
      <section className="services-section py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">Loading service...</div>
        </div>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="services-section py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">Service not found.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="services-section py-16">
      <div className="mx-auto max-w-5xl px-4 lg:px-6">
        <div className="section-shell service-shell">
          {service.image ? (
            <img
              src={getImageUrl(service.image)}
              alt={service.title}
              className="h-80 w-full rounded-3xl object-cover"
            />
          ) : null}
          <div className="mt-8">
            <span className="section-kicker">{service.icon || "Temple Service"}</span>
            <h1 className="section-heading-left mt-3">{service.title}</h1>
            <p className="section-copy service-copy">{service.short_description}</p>
            <div className="mt-8 rounded-2xl bg-white/70 p-6 text-base leading-8 text-slate-700 shadow-md">
              {service.description}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
