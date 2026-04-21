import { useEffect, useState } from "react";
import { heroSlides, siteContent } from "../content";

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="home" className="hero-section">
      {heroSlides.map((slide, slideIndex) => (
        <div
          key={slide}
          className={`hero-slide ${slideIndex === index ? "hero-slide-active" : ""}`}
          style={{ backgroundImage: `url('${slide}')` }}
          aria-hidden={slideIndex !== index}
        />
      ))}
      <div className="hero-overlay" />
      <div className="hero-gradient" />
      <div className="hero-content mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[minmax(0,1.1fr)_320px] lg:px-6">
        <div className="max-w-3xl text-left">
          <span className="hero-eyebrow">मानस तीर्थ सोनकुंड</span>
          <h1 className="hero-title">{siteContent.fullBrand}</h1>
          <p className="hero-copy">{siteContent.location}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a className="temple-btn inline-flex justify-center" href={siteContent.donationHref}>
              दान करें
            </a>
            <a className="temple-btn-secondary inline-flex justify-center" href="/contact">
              संपर्क करें
            </a>
          </div>
        </div>
        <div className="hidden self-end lg:block">
          <div className="hero-side-note">
            <span className="feature-kicker text-temple-gold">आध्यात्मिक केंद्र</span>
            <p className="mt-4 font-display text-lg leading-8 text-white/90">
              नवरात्रि आयोजन, पारंपरिक संस्कार और भक्तों के लिए शांत, गरिमामय
              मंदिर अनुभव।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
