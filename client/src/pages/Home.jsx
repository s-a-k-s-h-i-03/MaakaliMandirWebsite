import { useState } from "react";
import HeroSlider from "../components/HeroSlider";
import Services from "../components/Services";
import EventsSection from "../components/EventsSection";
import AboutSection from "../components/AboutSection";
import { siteContent } from "../content";

const highlights = [
  {
    title: "ज्योति कलश स्थापना",
    text: "तेल, घृत और जवारे कलश के लिए स्पष्ट सूची, सरल पहुंच और भक्तों के लिए सुव्यवस्थित मार्गदर्शन।",
  },
  {
    title: "पूजा एवं संस्कार",
    text: "कथा कार्यक्रम, अभिषेक और पारंपरिक संस्कारों को आधुनिक, साफ और पढ़ने योग्य रूप में प्रस्तुत किया गया है।",
  },
  {
    title: "दर्शन और सहयोग",
    text: "संपर्क, दान और आयोजन जानकारी अब मोबाइल और डेस्कटॉप दोनों पर अधिक सहज अनुभव के साथ।",
  },
];

export default function Home() {
  const [whatsAppIconFailed, setWhatsAppIconFailed] = useState(false);

  return (
    <>
      <HeroSlider />
      <section className="relative z-20 -mt-14 pb-10">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 md:grid-cols-3 lg:px-6">
          {highlights.map((item) => (
            <article key={item.title} className="feature-card">
              <span className="feature-kicker">मंदिर सेवा</span>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-copy">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <EventsSection showCards={false} />
      <Services />
      <EventsSection showAnnouncement={false} />
      <AboutSection />
      <a href="/donation" className="floating-btn donate-float" title="दान करें">
        दान
      </a>
      <a
        href={siteContent.whatsappHref}
        className="floating-btn whatsapp-float"
        title="WhatsApp"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        {whatsAppIconFailed ? (
          <span className="whatsapp-fallback" aria-hidden="true">
            WA
          </span>
        ) : (
          <img
            src="/assets/images/whatsapp.png"
            alt=""
            aria-hidden="true"
            className="whatsapp-logo"
            onError={() => {
              console.error("WhatsApp icon failed to load from /assets/images/whatsapp.png");
              setWhatsAppIconFailed(true);
            }}
          />
        )}
      </a>
    </>
  );
}
