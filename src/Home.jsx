import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./Home.css";
import { toast, ToastContainer } from "react-toastify";
import EnhancedQRCode from "./components/EnhancedQRCode";
import ProfileCompletionBanner from "./components/ProfileCompletionBanner";
import useProfileStatus from "./hooks/useProfileStatus";
import heroMission from "./assets/mission.png";
import heroCitizen from "./assets/login.png";
import heroSignup from "./assets/signup.png";
import {
  FileText, List, User, Headphones, BarChart3, BookOpen,
  MessageCircle, MapPin, Search, Calendar, Bus, ChartColumn,
  Vote, Building2, Car, Zap, HandCoins, ReceiptIndianRupee,
  TrainFront, School, ShieldCheck, Landmark, ScanSearch,
} from "lucide-react";

function Home() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isSignedIn = !!token;
  const { isProfileComplete, isLoading: profileLoading } = useProfileStatus();

  // simple scroll reveal — no heavy library needed
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-in-on-scroll").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
          el.classList.add("is-visible");
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("storage"));
      toast.info("You have been logged out");
      setTimeout(() => navigate("/"), 2500);
    } catch {
      toast.error("Error logging out");
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Data                                                               */
  /* ------------------------------------------------------------------ */

  const faqs = [
    {
      id: 1,
      q: "What is Awaaz?",
      a: "Awaaz is a civic engagement platform where citizens can report and track local issues — potholes, broken lights, garbage collection, etc. Reports get classified and sent to the right department.",
    },
    {
      id: 2,
      q: "How do I report an issue?",
      a: "Take a photo of the problem, describe what's wrong, and drop a pin on the map. Your report goes straight to the relevant city department.",
    },
    {
      id: 3,
      q: "Is it free?",
      a: "Completely free. No hidden charges, no premium tiers.",
    },
    {
      id: 4,
      q: "How do I track my report?",
      a: "Go to your dashboard — you'll see every report you've filed and its current status. You also get notifications when things change.",
    },
    {
      id: 5,
      q: "Can I upvote other people's reports?",
      a: "Yes. Upvoting helps surface the most urgent issues so they get attention faster.",
    },
  ];

  const features = [
    {
      title: "Report Issues",
      desc: "Snap a photo, pin the location, describe the problem. That's it — your report is filed.",
      bullets: ["Photo uploads", "Map integration", "Auto-categorization"],
      link: "/report-issue",
    },
    {
      title: "Track Progress",
      desc: "See exactly where your report stands. No more calling the helpline and getting put on hold.",
      bullets: ["Real-time status", "Notifications", "Resolution timeline"],
      link: "/complaints",
    },
    {
      title: "Community Voting",
      desc: "Upvote issues that affect you too. The more votes, the higher the priority.",
      bullets: ["Upvote issues", "Trending problems", "Neighbourhood stats"],
      link: "/community-voting",
    },
  ];

  const services = [
    { title: "File a Complaint", desc: "Submit a new issue with full details.", link: "/report-issue", icon: FileText },
    { title: "My Complaints", desc: "Track all complaints you've raised.", link: "/complaints", icon: List },
    { title: "Profile", desc: "View or edit your profile details.", link: "/profile", icon: User },
    { title: "Support", desc: "Need help? Contact our support.", link: "/contact", icon: Headphones },
    { title: "Community Voting", desc: "Cast your vote on trending topics and decisions.", link: "/community-voting", icon: BarChart3 },
    { title: "Resources", desc: "Read FAQs, citizen rights, and more.", link: "/resources", icon: BookOpen },
    { title: "Chat Room", desc: "Join real-time community discussions.", link: "/chatroom", icon: MessageCircle },
    { title: "Nearby Services", desc: "Find hospitals, police stations, and fire stations.", link: "/nearby-services", icon: MapPin },
    { title: "Lost & Found", desc: "Bringing lost items back to their owners.", link: "/lost-found", icon: Search },
    { title: "Community Holidays", desc: "Upcoming community holidays near you.", link: "/community-holidays", icon: Calendar },
    { title: "Public Transport", desc: "Real-time transit information.", link: "/transport", icon: Bus },
    { title: "Civic Statistics", desc: "Population & Water Resources Analytics.", link: "/civic-stats", icon: ChartColumn },
    { title: "Election & Governance", desc: "Electoral Information & Voter Analytics.", link: "/elections-info", icon: Vote },
    { title: "Government Schemes", desc: "Government Schemes & Financial Analytics.", link: "/govt-schemes", icon: Building2 },
    { title: "Traffic Fines & Vehicle Info", desc: "Essential vehicle and transport services.", link: "/vehical", icon: Car },
    { title: "Water & Electricity", desc: "Supply schedules & outage notifications.", link: "/electricity", icon: Zap },
    { title: "SDRF & NFSA", desc: "Disaster Response Fund & Food Security data.", link: "/sdrf", icon: HandCoins },
    { title: "Budget Estimates", desc: "Evaluate Budget Estimates & analytics.", link: "/budget", icon: ReceiptIndianRupee },
    { title: "Train Schedule", desc: "Real-Time Train Schedule information.", link: "/train", icon: TrainFront },
    { title: "School Statistics", desc: "Nationwide school data & analysis.", link: "/school", icon: School },
  ];

  const steps = [
    {
      num: "1",
      title: "Report",
      desc: "Take a photo and mark the location. Add details about what's wrong.",
    },
    {
      num: "2",
      title: "Review",
      desc: "City workers review and prioritize based on severity and community votes.",
    },
    {
      num: "3",
      title: "Resolve",
      desc: "Track the fix from start to finish. Get notified when it's done.",
    },
  ];

  const testimonials = [
    {
      quote:
        "Reported a pothole on my street — fixed within a week. Being able to track it made all the difference.",
      name: "Aarav P.",
      role: "Bangalore",
    },
    {
      quote:
        "As a city worker, Awaaz completely changed how we manage complaints. The dashboard is genuinely useful.",
      name: "Akshay R.",
      role: "Delhi",
    },
    {
      quote:
        "Finally, a way to actually see what happens after you complain. This should exist everywhere.",
      name: "Meera S.",
      role: "Chennai",
    },
    {
      quote:
        "Community engagement went up 3x after we started using this. People feel like their voice matters.",
      name: "Rahul S.",
      role: "Mumbai",
    },
  ];

  const heroSlides = [
    { src: heroMission, alt: "Citizen service mission visual" },
    { src: heroCitizen, alt: "Community participation visual" },
    { src: heroSignup, alt: "Citizen onboarding visual" },
    { src: "/profiles/michael.jpg", alt: "Community volunteer profile" },
    { src: "/profiles/sarah.jpg", alt: "Citizen engagement profile" },
  ];

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const intervalId = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [heroSlides.length]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="dark"
        bodyClassName="text-sm"
      />

      <Helmet>
        <title>Awaaz — Report Local Issues & Improve Your Community</title>
        <meta
          name="description"
          content="Report and track civic issues like potholes, broken lights, and garbage collection. Make your neighbourhood better."
        />
      </Helmet>

      <main className="flex-1">
        <ProfileCompletionBanner />

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#f9fbff] dark:bg-[#020812] py-16 md:py-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
            <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-5">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative z-10">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:ring-slate-700">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    Next-gen civic intelligence layer
                  </span>
                  <span className="inline-flex h-2 w-20 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-700">
                    <span className="w-1/3 bg-[#FF9933]" />
                    <span className="w-1/3 bg-white" />
                    <span className="w-1/3 bg-[#138808]" />
                  </span>
                </div>

                <h1 className="text-balance text-4xl font-black leading-[1.05] text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
                  Your city, now in
                  <br />
                  <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                    real-time mode.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  Post an issue in seconds, let AI auto-prioritize it, and follow every action live
                  as departments respond across the city grid.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate(isSignedIn ? "/report-issue" : "/signup")}
                    className="rounded-xl bg-orange-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:bg-orange-700"
                  >
                    {isSignedIn ? "Trigger a Live Report" : "Enter the Civic Grid"}
                  </button>

                  <button
                    onClick={() =>
                      document
                        .getElementById("how-it-works")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="rounded-xl border border-slate-300 bg-white/80 px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Watch How It Flows
                  </button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-700">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">24/7</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Always-on citizen reporting lane</p>
                  </div>
                  <div className="rounded-xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-700">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">AI+</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Smart triage and route prediction</p>
                  </div>
                  <div className="rounded-xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-700">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">LiveX</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">See every workflow state in motion</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <div className="hero-visual-shell relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="relative h-[460px] w-full">
                    {heroSlides.map((slide, index) => (
                      <img
                        key={`${slide.src}-${index}`}
                        src={slide.src}
                        alt={slide.alt}
                        aria-hidden={index !== activeHeroSlide}
                        className={`hero-image-moving absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                          index === activeHeroSlide ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/25 to-transparent" />
                  <div className="hero-overlay-sheen absolute inset-0" />

                  <div className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full bg-slate-900/50 px-2 py-1 backdrop-blur">
                    {heroSlides.map((_, index) => (
                      <span
                        key={`dot-${index}`}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          index === activeHeroSlide ? "bg-white w-4" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-2">
                    <div className="hero-float-one rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-slate-900/85">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hot zone</p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <Landmark size={15} className="text-orange-500" />
                        Roads & Mobility Stack
                      </p>
                    </div>
                    <div className="hero-float-two rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-slate-900/85">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Live pipeline</p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <ScanSearch size={15} className="text-emerald-500" />
                        Verified → Routed → Actioned
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900/60">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center mb-14 fade-in-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold">
                What you can do with{" "}
                <span className="text-orange-600 dark:text-orange-400">
                  Awaaz
                </span>
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
                Three core features that make civic engagement actually work.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <Link
                  key={i}
                  to={f.link}
                  className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 hover:border-orange-300 dark:hover:border-orange-700 transition-colors fade-in-on-scroll"
                >
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    {f.desc}
                  </p>
                  <ul className="space-y-1.5">
                    {f.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ─────────────────────────────────────────── */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center mb-14 fade-in-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold">
                Explore all{" "}
                <span className="text-orange-600 dark:text-orange-400">
                  Services
                </span>
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
                Everything you need — from filing complaints to checking train schedules.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 fade-in-on-scroll">
              {services.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={i}
                    to={s.link}
                    className="group flex flex-col items-center text-center rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                  >
                    <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 transition-colors">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-sm font-semibold mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {s.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900/60">
          <div className="mx-auto max-w-4xl px-5">
            <div className="text-center mb-14 fade-in-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold">
                Three steps. That's it.
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">
                No paperwork, no phone trees, no bureaucracy.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 fade-in-on-scroll">
              {steps.map((s, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-bold text-lg mb-4">
                    {s.num}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────── */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900/60">
          <div className="mx-auto max-w-5xl px-5">
            <div className="text-center mb-14 fade-in-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold">
                People are using it
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">
                Here's what they say.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 fade-in-on-scroll">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
                >
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faqs" className="py-20 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-2xl px-5">
            <div className="text-center mb-12 fade-in-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold">
                Common questions
              </h2>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-800 fade-in-on-scroll">
              {faqs.map((faq) => (
                <div key={faq.id} className="py-4">
                  <button
                    className="w-full flex items-center justify-between text-left"
                    onClick={() =>
                      setActiveFaq(activeFaq === faq.id ? null : faq.id)
                    }
                    aria-expanded={activeFaq === faq.id}
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100 pr-4">
                      {faq.q}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        activeFaq === faq.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {activeFaq === faq.id && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Download CTA ─────────────────────────────────────── */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/60">
          <div className="mx-auto max-w-5xl px-5">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="fade-in-on-scroll">
                <h2 className="text-3xl font-bold mb-3">
                  Ready to make a difference?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Download Awaaz and start reporting issues in your
                  neighbourhood today.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/download-ios"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                  >
                    <svg width="14" height="17" viewBox="0 0 28 34" fill="currentColor">
                      <path d="M23.1 17.6c0-4.2 3.6-6.2 3.7-6.3-2-2.9-5.1-3.3-6.2-3.3-2.6-.3-5.2 1.5-6.5 1.5s-3.4-1.5-5.6-1.5C5.6 8.1 2.9 9.8 1.4 12.3c-3 5.1-.8 12.6 2.1 16.7 1.5 2 3.2 4.3 5.4 4.2 2.2-.1 3-1.3 5.6-1.3s3.4 1.3 5.7 1.2c2.3 0 3.8-2 5.3-4.1 1.7-2.3 2.3-4.6 2.4-4.7-.1 0-4.5-1.7-4.6-6.7z" />
                      <path d="M18.8 5.3c1.2-1.4 2-3.4 1.7-5.3-1.7.1-3.8 1.1-5 2.5-1.1 1.2-2 3.2-1.8 5.1 1.9.1 3.9-1 5.1-2.3z" />
                    </svg>
                    App Store
                  </Link>
                  <Link
                    to="/download-android"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                  >
                    <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.5 2.3l1.4-2.5a.5.5 0 00-.9-.5l-1.5 2.5A11 11 0 0012 1c-1.6 0-3.2.3-4.6.8L5.9-.7a.5.5 0 00-.9.5L6.4 2.3C3.5 4.2 1.4 7.3 1.1 11h21.8c-.3-3.7-2.4-6.8-5.4-8.7zM7.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </svg>
                    Google Play
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex justify-end fade-in-on-scroll">
                <EnhancedQRCode />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
