import axios from "axios";
import { useEffect, useState } from "react";

const apiBaseUrl = "http://localhost:5000";

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

  return new Date(date).toLocaleDateString();
};

const getEventImageUrl = (image) => {
  if (!image || !image.startsWith("/uploads/")) {
    return "";
  }

  return `${apiBaseUrl}${image}`;
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("EVENT PAGE LOADED");

  useEffect(() => {
    const fetchEvents = async () => {
      console.log("FETCH START");

      try {
        const res = await axios.get(`${apiBaseUrl}/api/events`);
        console.log("API RESPONSE:", res.data);
        setEvents(res.data);
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

        <pre className="mb-6 overflow-auto rounded-xl bg-white p-4 text-left text-xs text-slate-600 shadow-md">
          {JSON.stringify(events, null, 2)}
        </pre>

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
                {getEventImageUrl(event.image) ? (
                  <img
                    src={getEventImageUrl(event.image)}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                  />
                ) : null}

                <div className="space-y-3 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#b45309]">
                    {getEventDate(event.date)}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-temple-maroon">
                    {event.title}
                  </h2>
                  <p className="font-display text-base leading-7 text-slate-600">
                    {getEventDescription(event.description)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
