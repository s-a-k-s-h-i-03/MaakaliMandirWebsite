import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../admin/Services/eventService";
import { eventsContent, navratriLinks } from "../content";
import { resolveMediaUrl } from "../utils/media";

const fallbackEvents = eventsContent.map((event) => ({
  id: event.title,
  title: event.title,
  image: event.image,
  description: "",
  type: event.type,
}));

export default function EventsSection({
  showAnnouncement = true,
  showCards = true,
}) {
  const [events, setEvents] = useState(fallbackEvents);

  useEffect(() => {
    if (!showCards) {
      return undefined;
    }

    let active = true;

    async function loadEvents() {
      try {
        const rows = await getEvents();

        if (!active || !Array.isArray(rows) || rows.length === 0) {
          return;
        }

        setEvents(rows);
      } catch (error) {
        console.error("Failed to load homepage events", error);
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, [showCards]);

  return (
    <>
      {showAnnouncement ? (
        <section className="announcement-banner py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/15 p-6 backdrop-blur-sm md:p-10">
              <div className="max-w-3xl">
                <span className="section-kicker text-white/80">नवरात्रि विशेष</span>
                <h4 className="mt-4 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
                  चैत्र नवरात्रि 2026 के लिए ज्योति कलश स्थापना सूची
                </h4>
                <p className="mt-4 font-display text-lg leading-8 text-white/80">
                  तेल, घृत और जवारे कलश के लिए उपलब्ध सूचियाँ नीचे दी गई हैं।
                  प्रत्येक लिंक सीधे संबंधित सूची तक ले जाएगा।
                </p>
              </div>
              <div className="navratri-container mt-8 grid gap-4 md:grid-cols-3 md:items-stretch">
                {navratriLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="navratri-card navratri-card-dark"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {showCards ? (
        <section id="events" className="bg-temple-cream py-12">
          <div className="mx-auto max-w-5xl px-4 lg:px-6">
            <div className="section-shell">
              <div className="max-w-2xl">
                <span className="section-kicker">आगामी आयोजन</span>
                <h2 className="section-heading-left mb-4">नवरात्रि और विशेष पर्व</h2>
                <p className="section-copy">
                  प्रमुख पर्वों और मंदिर आयोजनों को संतुलित, साफ कार्ड लेआउट में रखा
                  गया है ताकि भक्त तुरंत संबंधित जानकारी तक पहुंच सकें।
                </p>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {events.map((event) => (
                  <article key={event.id || event.title} className="event-card group">
                    <div className="overflow-hidden">
                      <img
                        src={resolveMediaUrl(event.image)}
                        alt={event.title}
                        className="h-48 w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-4 p-5">
                      <span className="feature-kicker">मंदिर कार्यक्रम</span>
                      <h5 className="font-display text-2xl font-semibold text-temple-maroon">
                        {event.title}
                      </h5>
                      <p className="font-display text-base leading-7 text-slate-600">
                        {event.description || "Temple event details and participation updates are available on the event page."}
                      </p>
                      {event.type ? (
                        <Link className="temple-btn inline-flex" to={`/navratri/${event.type}`}>
                          सूची देखें
                        </Link>
                      ) : (
                        <Link className="temple-btn inline-flex" to="/events">
                          View Event
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
