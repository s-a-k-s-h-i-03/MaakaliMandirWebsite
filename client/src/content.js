export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export const siteContent = {
  brand: "श्री श्री माँ आदिशक्तिपीठ",
  fullBrand: "श्री श्री माँ आदिशक्तिपीठ काली मंदिर",
  location: "मानस तीर्थ सोनकुंड, पेंड्रा जिला गौरेला पेंड्रा मरवाही, छत्तीसगढ़",
  phone: "+91 9876543210",
  phoneHref: "tel:+919876543210",
  whatsappHref: "https://wa.me/919876543210",
  email: "info@maakalisonkund.org",
  donationHref: "/donation"
};

export const heroSlides = [
  "/assets/images/photogalery/1a029cfa-e814-476e-8e60-d257c533d53e.jpg",
  "/assets/images/photogalery/IMG-20211109-WA0007.jpg",
  "/assets/images/photogalery/IMG20221004151412.jpg",
  "/assets/images/photogalery/IMG-20221003-WA0030.jpg",
  "/assets/images/7f06e84c-40c0-452c-9c49-d98e45402ca1.jpg"
];

export const servicesContent = {
  katha: [
    "रुद्र अभिषेक",
    "भागवत पुराण कथा",
    "सत्य नारायण कथा",
    "दीपदान कार्यक्रम",
    "ज्योति कलश स्थापना"
  ],
  sanskar: [
    {
      title: "मुंडन संस्कार",
      image: "/assets/images/mundan.jpg"
    },
    {
      title: "अस्थि विसर्जन",
      image: "/assets/images/ashtivisarjan.jpg"
    }
  ]
};

export const eventsContent = [
  {
    title: "चैत्र नवरात्रि 2026",
    image: "/assets/images/jyotikalash.jpg",
    type: "tel"
  },
  {
    title: "शारदीय नवरात्रि 2026",
    image: "/assets/images/jyotikalash.jpg",
    type: "ghrit"
  }
];

export const navratriLinks = [
  {
    label: "चैत्र नवरात्रि -2026 तेल ज्योति कलश स्थापना सूची",
    href: "/api/navratri?type=tel"
  },
  {
    label: "चैत्र नवरात्रि -2026 घृत ज्योति कलश स्थापना सूची",
    href: "/api/navratri?type=ghrit"
  },
  {
    label: "चैत्र नवरात्रि -2026 जवारें कलश स्थापना सूची",
    href: "/api/navratri?type=jawara"
  }
];

export const aboutContent = {
  title: "मंदिर के बारे में",
  paragraphs: [
    "श्री श्री माँ आदिशक्ति काली मानस तीर्थ सोनकुंड, पेंड्रा जिला गौरेला पेंड्रा मरवाही, छत्तीसगढ़ में स्थित है। यह एक पवित्र मंदिर है जहाँ देवी काली को समर्पित है।",
    "यह मंदिर भक्तों के लिए एक आध्यात्मिक केंद्र है जहाँ वे शांति, आनंद और दिव्य सुख प्राप्त करते हैं।"
  ],
  idolImage: "/assets/images/tooplate_image_01.jpg"
};
