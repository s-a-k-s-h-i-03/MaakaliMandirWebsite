import { siteContent } from "../content";

export default function Footer() {
  return (
    <footer className="border-t border-temple-gold/20 bg-[#fff7e8] pb-5 pt-12 text-temple-text">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h5 className="mb-4 font-display text-xl font-bold text-temple-gold">
              {siteContent.brand}
            </h5>
            <p className="footer-text">मानस तीर्थ सोनकुंड</p>
            <p className="footer-text">
              पेंड्रा जिला गौरेला पेंड्रा मरवाही, छत्तीसगढ़
            </p>
          </div>
          <div>
            <h5 className="mb-4 font-display text-xl font-bold text-temple-gold">
              महत्वपूर्ण लिंक
            </h5>
            <ul className="space-y-2 font-display text-base">
              <li><a className="footer-link" href="/#about">मंदिर के बारे में</a></li>
              <li><a className="footer-link" href="/#services">सेवाएँ</a></li>
              <li><a className="footer-link" href="/events">कार्यक्रम</a></li>
              <li><a className="footer-link" href="/donation">दान करें</a></li>
              <li><a className="footer-link" href="/contact">संपर्क करें</a></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 font-display text-xl font-bold text-temple-gold">
              संपर्क जानकारी
            </h5>
            <p className="footer-text">पेंड्रा, छत्तीसगढ़</p>
            <p className="footer-text">
              <a className="footer-link" href={siteContent.phoneHref}>
                {siteContent.phone}
              </a>
            </p>
            <p className="footer-text">
              <a className="footer-link" href={`mailto:${siteContent.email}`}>
                {siteContent.email}
              </a>
            </p>
          </div>
        </div>
        <hr className="my-8 border-temple-gold/20" />
        <div className="text-center font-hindi text-sm text-temple-muted">
          <p>
            &copy; 2026 श्री श्री माँ आदिशक्तिपीठ काली मंदिर। सभी अधिकार सुरक्षित।
          </p>
        </div>
      </div>
    </footer>
  );
}
