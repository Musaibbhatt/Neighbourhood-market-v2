import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const { data: config } = useQuery({
    queryKey: ['store-config'],
    queryFn: async () => {
      const res = await fetch('/api/store-config');
      return res.json();
    }
  });

  const instagramUsername = config?.instagramUsername || 'Neighborhood_market__';

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Neighbourhood
            </Link>
            <p className="text-primary-foreground/70 text-sm max-w-xs mb-6">
              Your local community store dedicated to fresh food and friendly service.
            </p>
            <div className="flex items-center gap-4">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors group"
              >
                <Instagram size={20} />
              </a>
              <span className="text-xs text-primary-foreground/50">@{instagramUsername}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[{ to: "/", label: "Home" }, { to: "/shop", label: "Shop" }, { to: "/offers", label: "Offers" }, { to: "/cart", label: "My Cart" }].map(l => (
                <li key={l.to}><Link to={l.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2.5">
              {[{ to: "/about", label: "About Us" }, { to: "/contact", label: "Contact" }].map(l => (
                <li key={l.to}><Link to={l.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Store Hours</h3>
            <div className="space-y-1.5 text-sm text-primary-foreground/70">
              <p>Mon - Fri: 7am - 10pm</p>
              <p>Saturday: 8am - 9pm</p>
              <p>Sunday: 9am - 8pm</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Neighbourhood Market. All rights reserved. Made with ❤ by Musaib
        </div>
      </div>
    </footer>
  );
}
