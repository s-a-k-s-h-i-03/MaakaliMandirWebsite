import { useEffect, useState } from "react";
import { getEvents } from "../admin/Services/eventService";
import { resolveMediaUrl } from "../utils/media";

const getEventDescription = (description) => {
  if (!description || description === "null") {
    return "No description available";
  }

  return description;
};

const getEventDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error("API ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="bg-temple-cream py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 text-center">
          <span className="section-kicker">Temple Events</span>
          <h1 className="section-heading mb-4 mt-3">Events</h1>
          <p className="mx-auto max-w-2xl font-display text-lg leading-8 text-slate-600">
            Stay updated with the latest temple programs, festivals, and community events.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-md">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-md">
            No events available
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
              >
                {resolveMediaUrl(event.image) ? (
                  <img
                    src={resolveMediaUrl(event.image)}
                    alt={event.title}
                    className="h-56 w-full object-cover"
                  />
                ) : null}

                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-wide text-[#b45309]">
                    <span>{getEventDate(event.event_date || event.date)}</span>
                    {event.location ? <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] text-amber-800">{event.location}</span> : null}
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-temple-maroon">
                    {event.title}
                  </h2>
                  <p className="font-display text-base leading-7 text-slate-600">
                    {getEventDescription(event.description)}
                  </p>
                  <button type="button" className="rounded-xl border border-[#eed3a5] px-4 py-2 text-sm font-semibold text-temple-maroon transition hover:bg-[#fff4dc]">
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
