import { servicesContent } from "../content";

const serviceImages = [
  "/assets/images/rudraabhisek.jpg",
  "/assets/images/bhagwatpuran.jpg",
  "/assets/images/bhagwatpuran.jpg",
  "/assets/images/deepdaan.jpg",
  "/assets/images/jyotikalashww.jpg",
];

export default function Services() {
  return (
    <section id="services" className="services-section py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="section-shell service-shell">
          <div className="max-w-2xl">
            <span className="section-kicker">सेवा व्यवस्था</span>
            <h2 className="section-heading-left mb-5">भक्ति, अनुष्ठान और संस्कार</h2>
            <p className="section-copy service-copy">
              मंदिर की प्रमुख सेवाओं को साफ कार्ड-आधारित लेआउट में व्यवस्थित किया गया है
              ताकि भक्त एक नज़र में उपलब्ध कार्यक्रम समझ सकें।
            </p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="service-panel">
              <h3 className="sub-heading">कथा कार्यक्रम</h3>
              <ul className="grid gap-4 sm:grid-cols-2">
                {servicesContent.katha.map((service, index) => (
                  <li key={service} className="service-row">
                    <img
                      src={serviceImages[index]}
                      alt={service}
                      className="service-thumb"
                    />
                    <span className="font-display text-lg leading-7">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="service-panel">
              <h3 className="sub-heading">किये जाने वाले संस्कार</h3>
              <div className="grid gap-5">
                {servicesContent.sanskar.map((item) => (
                  <div key={item.title} className="sanskar-card">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-40 w-full object-cover sm:h-full sm:w-40"
                    />
                    <div className="flex flex-1 items-center p-6">
                      <div>
                        <span className="feature-kicker">संस्कार</span>
                        <h5 className="mt-3 font-display text-xl font-semibold text-temple-maroon">
                          {item.title}
                        </h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
