import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Switch from "../DarkModeToggle";
import { jwtDecode } from "jwt-decode";
import awaazLogo from "../assets/awaaz-logo.svg";
import {
  User,
  LogOut,
  Shield,
  LayoutDashboard,
  BookOpen,
  Menu,
  X,
  Search,
  Sparkles,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const userMenuRef = useRef(null);
  const desktopSearchRef = useRef(null);

  const closeMobile = (cb) => {
    setMobileMenuOpen(false);
    cb?.();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    window.dispatchEvent(new Event("storage"));
    setUserMenuOpen(false);
    navigate("/");
  };

  // keep token in sync
  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close mobile menu on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e) => e.key === "Escape" && setMobileMenuOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileMenuOpen]);

  let isAdmin = false;
  let isOfficer = false;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      isAdmin = decoded.role === "admin";
      isOfficer = decoded.role === "officer";
    }
  } catch {
    /* invalid token — ignore */
  }

  const navLinks = [];

  const searchRoutes = [
    { title: "Home", href: "/", keywords: ["home", "landing", "awaaz"] },
    { title: "Report Issue", href: "/report-issue", keywords: ["report", "complaint", "issue", "pothole", "streetlight"] },
    { title: "My Complaints", href: "/complaints", keywords: ["my complaints", "status", "track", "history"] },
    { title: "Contact", href: "/contact", keywords: ["contact", "help", "support"] },
    { title: "Feedback", href: "/feedback", keywords: ["feedback", "review", "suggestion"] },
    { title: "Contributors", href: "/contributors", keywords: ["contributors", "team", "developers"] },
    { title: "Voting", href: "/voting-system", keywords: ["vote", "poll", "voting"] },
    { title: "Issue Map", href: "/user-map", keywords: ["map", "location", "issues map"] },
    { title: "Nearby Services", href: "/nearby-services", keywords: ["nearby", "services", "hospitals", "police", "atm"] },
    { title: "Community Holidays", href: "/community-holidays", keywords: ["holiday", "calendar", "events"] },
    { title: "Transport", href: "/transport", keywords: ["transport", "bus", "train", "metro"] },
    { title: "Civic Statistics", href: "/civic-stats", keywords: ["statistics", "data", "analytics"] },
    { title: "Government Schemes", href: "/govt-schemes", keywords: ["schemes", "welfare", "benefits"] },
    { title: "Elections Info", href: "/elections-info", keywords: ["election", "representative", "democracy"] },
    { title: "Civic Education", href: "/civic-education", keywords: ["education", "learn", "rights"] },
  ];

  const getMatches = (value) => {
    const term = value.trim().toLowerCase();
    if (!term) return [];

    return searchRoutes.filter((route) => {
      const inTitle = route.title.toLowerCase().includes(term);
      const inPath = route.href.toLowerCase().includes(term);
      const inKeywords = route.keywords.some((keyword) => keyword.includes(term));
      return inTitle || inPath || inKeywords;
    });
  };

  const suggestions = getMatches(query).slice(0, 6);

  const executeSearch = (value, onSuccess) => {
    const matches = getMatches(value);

    if (matches.length === 0) {
      setSearchError("No matching page found. Try 'report issue', 'voting', or 'transport'.");
      return;
    }

    setSearchError("");
    const target = matches[0].href;
    onSuccess?.(target);
    navigate(target);
  };

  useEffect(() => {
    setShowSearchSuggestions(false);
    setSearchError("");
    setQuery("");
    setMobileQuery("");
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(2,6,23,0.05)]">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/");
              }}
              className="flex items-center gap-2.5"
            >
              <img src={awaazLogo} alt="Awaaz" className="h-9 w-9" />
              <div className="leading-tight">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  Awaaz
                </span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                  आवाज़
                </span>
              </div>
            </button>

          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Desktop search */}
          <div className="hidden lg:block relative w-[360px]" ref={desktopSearchRef}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(query, () => {
                  setShowSearchSuggestions(false);
                });
              }}
              className="relative"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onFocus={() => setShowSearchSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchError("");
                  setShowSearchSuggestions(true);
                }}
                placeholder="Search pages, services, features..."
                className="w-full rounded-xl border border-slate-300/90 bg-white/90 py-2 pl-9 pr-20 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:focus:ring-orange-900/30"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Go
              </button>
            </form>

            {showSearchSuggestions && query.trim() && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        setShowSearchSuggestions(false);
                        navigate(item.href);
                      }}
                      className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
                    >
                      <span className="font-semibold">{item.title}</span>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{item.href}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No suggestions found</p>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Dark mode control dock */}
            <div className="hidden lg:flex items-center rounded-full border border-slate-300/80 bg-white/80 px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              Theme
              <span className="ml-2 inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                <Switch />
              </span>
            </div>

            {/* User dropdown — desktop */}
            <div className="hidden lg:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-sm ring-1 ring-slate-300 transition-all hover:-translate-y-0.5 hover:shadow-md dark:from-slate-800 dark:to-slate-700 dark:text-slate-200 dark:ring-slate-600"
                aria-label="User menu"
              >
                <User className="w-4 h-4" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/civic-education");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <BookOpen className="w-4 h-4" />
                    Civic Education
                  </button>

                  {!token ? (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/login");
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <User className="w-4 h-4" />
                      Login
                    </button>
                  ) : (
                    <>
                      <hr className="my-1 border-gray-100 dark:border-gray-800" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (isAdmin) navigate("/admin");
                          else if (isOfficer) navigate("/officer/dashboard");
                          else navigate("/user/dashboard");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {isAdmin ? (
                          <Shield className="w-4 h-4" />
                        ) : (
                          <LayoutDashboard className="w-4 h-4" />
                        )}
                        Dashboard
                      </button>
                      <hr className="my-1 border-gray-100 dark:border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="lg:hidden fixed inset-x-0 top-16 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeSearch(mobileQuery, () => closeMobile());
                }}
                className="mb-3"
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={mobileQuery}
                    onChange={(e) => {
                      setMobileQuery(e.target.value);
                      setSearchError("");
                    }}
                    placeholder="Search any page..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  Search
                </button>
              </form>

              {searchError && (
                <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {searchError}
                </p>
              )}

              {navLinks.map((item) => {
                const active = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={() => closeMobile()}
                    className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md ${
                      active
                        ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                );
              })}

              <hr className="my-3 border-gray-200 dark:border-gray-800" />

              {token && (
                <>
                  <button
                    onClick={() => closeMobile(() => navigate("/profile"))}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() =>
                      closeMobile(() => {
                        if (isAdmin) navigate("/admin");
                        else if (isOfficer) navigate("/officer/dashboard");
                        else navigate("/user/dashboard");
                      })
                    }
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                </>
              )}

              {token ? (
                <button
                  onClick={() => closeMobile(handleLogout)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-red-600 border border-red-200 dark:border-red-900 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => closeMobile(() => navigate("/login"))}
                    className="flex-1 py-3 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => closeMobile(() => navigate("/signup"))}
                    className="flex-1 py-3 text-sm font-semibold rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                <span className="text-xs text-gray-400">Theme</span>
                <Switch />
              </div>
            </div>
          </nav>
        </>
      )}

      {searchError && (
        <div className="hidden lg:block border-t border-slate-200 dark:border-slate-800 bg-red-50/70 dark:bg-red-950/20">
          <p className="mx-auto max-w-7xl px-4 py-2 text-xs text-red-700 dark:text-red-300">
            {searchError}
          </p>
        </div>
      )}
    </header>
  );
};

export default Navbar;
