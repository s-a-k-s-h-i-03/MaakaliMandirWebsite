import { aboutContent, heroSlides, siteContent } from "../content";
import { useEffect, useState } from "react";

export default function AboutSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section id="about" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="section-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
            <div>
              <span className="section-kicker">आध्यात्मिक परिचय</span>
              <h2 className="section-heading-left mb-5">{aboutContent.title}</h2>
              {aboutContent.paragraphs.map((paragraph) => (
                <p key={paragraph} className="about-text">
                  {paragraph}
                </p>
              ))}
              <div className="mt-10 grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                <img
                  src={aboutContent.idolImage}
                  alt="Temple Idol"
                  className="h-full min-h-[180px] w-full rounded-3xl object-cover shadow-temple"
                />
                <div className="rounded-3xl border border-temple-gold/20 bg-[#fff9ef] p-6 shadow-temple">
                  <span className="feature-kicker">मंदिर अनुभूति</span>
                  <p className="mt-4 font-display text-lg leading-8 text-slate-700">
                    शांत वातावरण, पारंपरिक आस्था और नवरात्रि की गरिमा इस तीर्थ को
                    भक्तों के लिए विशिष्ट बनाती है।
                  </p>
                </div>
              </div>
            </div>
            <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] shadow-temple">
              {heroSlides.map((slide, slideIndex) => (
                <img
                  key={slide}
                  src={slide}
                  alt={`Temple Photo ${slideIndex + 1}`}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    slideIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="rounded-[1.5rem] border border-white/15 bg-black/25 p-5 backdrop-blur-sm">
                  <p className="font-display text-base leading-7 text-white/90">
                    दर्शन, सेवा और साधना के लिए एक गरिमामय परिसर जहाँ परंपरा और
                    समर्पण साथ चलते हैं।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="donation-section">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <span className="section-kicker text-white/80">समर्पण</span>
          <h2 className="section-heading mt-4 text-white">मंदिर को समर्पित करें</h2>
          <p className="mx-auto max-w-2xl font-display text-lg leading-8 text-white/90">
            मंदिर के विकास में सहयोग करें और आशीर्वाद प्राप्त करें।
          </p>
          <a className="temple-btn mt-8 inline-flex" href={siteContent.donationHref}>
            अभी दान करें
          </a>
        </div>
      </section>
    </>
  );
}
