import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Github, Mail, Phone, MapPin, Send } from "lucide-react";
import awaazLogo from "../assets/awaaz-logo.svg";

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = useCallback(
    (e) => {
      e.preventDefault();
      if (!email.trim()) return;
      // TODO: wire up to real API
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    },
    [email]
  );

  const linkGroups = [
    {
      heading: "Platform",
      links: [
        { label: "About", to: "/about" },
        { label: "Features", to: "/#features" },
        { label: "Feedback", to: "/feedback" },
      ],
    },
    {
      heading: "Quick Links",
      links: [
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
        { label: "Contributors", to: "/contributors" },
        { label: "Voting", to: "/voting-system" },
        { label: "Issue Map", to: "/user-map" },
        { label: "Feedback", to: "/feedback" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
        { label: "Contributors", to: "/contributors" },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <img src={awaazLogo} alt="Awaaz" className="w-8 h-8" />
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                Awaaz
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              Empowering citizens to report issues and improve their
              communities.
            </p>

            {/* Social / contact */}
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <a
                href="mailto:support@awaaz.com"
                className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> support@awaaz.com
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> +1 (555) 123-4567
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Bangalore, India
              </span>
            </div>

            <a
              href="https://github.com/HarshS16/Awaaz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>

          {/* Link groups */}
          {linkGroups.map((group) => (
            <div key={group.heading}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {group.heading}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Stay updated
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Get notified about new features.
            </p>

            {subscribed ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Subscribed! Check your inbox.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 min-w-0 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>&copy; {year} Awaaz. All rights reserved.</span>
          <span>
            Built by{" "}
            <a
              href="https://github.com/gauravmishra2744"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:underline"
            >
              Gaurav Mishra
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
