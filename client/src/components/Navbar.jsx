import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { siteContent } from "../content";

const homeSectionLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" }
];

const routeLinks = [
  { label: "Events", to: "/events" },
  { label: "Contact", to: "/contact" },
  { label: "Donation", to: "/donation" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-temple-gold/20 bg-white/85 shadow-temple backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <a
          className="font-hindi text-lg font-bold text-temple-maroon transition-all duration-300 hover:text-[#b22222]"
          href="/"
        >
          {siteContent.brand}
        </a>
        <button
          className="rounded-xl border border-temple-maroon/20 bg-temple-soft px-3 py-2 text-sm text-temple-maroon shadow-sm lg:hidden"
          type="button"
          onClick={() => setOpen((value) => !value)}
        >
          मेनू
        </button>
        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 top-full w-full flex-col border-b border-temple-gold/15 bg-white/95 px-4 pb-4 shadow-lg lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-2 lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:shadow-none`}
        >
          {homeSectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link-item ${
                location.pathname === "/" && location.hash === link.href.slice(1)
                  ? "nav-link-active"
                  : ""
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          {routeLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link-item ${isActive ? "nav-link-active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
