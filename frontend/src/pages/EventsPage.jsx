// frontend/src/pages/EventsPage.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Trophy,
  Lightbulb,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  X,
  ChevronDown,
  Download,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

// ─── helpers ──────────────────────────────────────────────────────────────────

// Helper function to determine if event is past or upcoming
function isEventPast(eventDate) {
  const eventDateObj = new Date(eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDateObj.setHours(0, 0, 0, 0);
  return eventDateObj < today;
}

function normaliseEvent(e) {
  // Properly map backend fields to frontend fields
  const title = e.name || e.title || "Unnamed Event";
  const category = e.category || "Event";
  const isFinanceEvent = category.toLowerCase().includes("finance");
  const eventDate = new Date(e.date);
  const isPast = isEventPast(eventDate);

  // Format date as "DD Mon YYYY"
  const dateStr = eventDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return {
    id: e._id || e.id,
    tag: category ?? "Event",
    tagColor: e.tag_color ?? "yellow",
    title: title,
    subtitle: e.subtitle ?? "",
    description: e.description ?? "",
    longDescription: e.long_description ?? "",
    icon: isFinanceEvent ? Trophy : Lightbulb,
    accentColor: e.accent_color ?? "yellow",
    highlights: [
      { label: "Date", value: dateStr },
      { label: "Format", value: e.format ?? "—" },
      { label: "Rounds", value: e.rounds ?? "—" },
      { label: "Prize Pool", value: e.prize_pool ?? "—" },
    ],
    tags: Array.isArray(e.tags) ? e.tags : [],
    image:
      e.image ||
      e.image_url ||
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80",
    status: e.status ?? "Upcoming",
    venue: e.location || e.venue || "",
    date: eventDate,
    dateStr: dateStr,
    time: e.time || "",
    format: e.format || "—",
    rounds: e.rounds || "—",
    prizePool: e.prize_pool || "—",
    registrationLink: e.registration_link || "",
    isPast: isPast,
  };
}

// ─── animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", delay },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

// ─── Event Modal ───────────────────────────────────────────────────────────────
function EventModal({ event, onClose }) {
  const Icon = event.icon;
  const isYellow = event.accentColor === "yellow";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-40 sm:h-56 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
          <img
            src={event.image}
            alt={event.title}
            // className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
          <span
            className={`absolute top-3 sm:top-4 left-3 sm:left-4 px-3 py-1 rounded-full text-xs font-semibold
            ${
              event.isPast
                ? "bg-gray-500/20 border border-gray-500/40 text-gray-400"
                : "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
            }`}
          >
            {event.isPast ? "Past Event" : "Upcoming Event"}
          </span>
        </div>

        <div className="p-5 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
              ${
                isYellow
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}
            >
              <Icon size={12} />
              {event.tag}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            {event.title}
          </h2>
          <p className="text-white/70 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
            {event.description}
          </p>
          <p className="text-white/50 leading-relaxed text-xs sm:text-sm mb-6">
            {event.longDescription}
          </p>

          {/* Details Grid - 4 boxes */}
          {!event.isPast && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 mb-6">
              {event.highlights.map((h) => (
                <div
                  key={h.label}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10"
                >
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    {h.label}
                  </p>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    {h.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Registration Link Button */}
          {!event.isPast && event.registrationLink && (
            <motion.a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`block w-full py-2.5 sm:py-3.5 rounded-full font-semibold text-center text-sm transition-all duration-300 mb-4
                ${
                  isYellow
                    ? "bg-yellow-400 text-zinc-950 hover:bg-yellow-500"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
            >
              Register Now
            </motion.a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Past Event Card ──────────────────────────────────────────────────────────
function PastEventCard({ event, index, onOpen }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.1}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-white/3 backdrop-blur-sm cursor-pointer"
      onClick={() => onOpen(event)}
    >
      <div className="relative h-40 sm:h-52 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        <span className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 border border-gray-500/40 text-gray-400">
          Past Event
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-7">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
          {event.title}
        </h3>
        <p className="text-white/60 text-xs sm:text-sm leading-relaxed flex-1">
          {event.description}
        </p>

        <div className="mt-4 sm:mt-6 flex items-center justify-between gap-2">
          <motion.div
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/40"
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            View Details <ArrowRight size={14} className="sm:w-[15px]" />
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_60px_rgba(255,255,255,0.02)]" />
    </motion.div>
  );
}

// ─── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ event, index, onOpen }) {
  const Icon = event.icon;
  const isYellow = event.accentColor === "yellow";

  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.1}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-white/3 backdrop-blur-sm cursor-pointer"
      onClick={() => onOpen(event)}
    >
      <div className="relative h-40 sm:h-52 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        <span
          className={`absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold
          ${
            event.status === "Registration Open"
              ? "bg-green-500/20 border border-green-500/40 text-green-400"
              : "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
          }`}
        >
          {event.status}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-7">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
          {event.title}
        </h3>
        <p
          className={`text-xs sm:text-sm mb-2 sm:mb-3 ${
            isYellow ? "text-yellow-400/70" : "text-purple-400/70"
          }`}
        >
          {event.subtitle}
        </p>
        <p className="text-white/60 text-xs sm:text-sm leading-relaxed flex-1">
          {event.description}
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6">
          {event.highlights.slice(0, 2).map((h) => (
            <div
              key={h.label}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/8"
            >
              <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">
                {h.label}
              </p>
              <p className="text-white text-xs sm:text-sm font-medium">
                {h.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {event.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/5 border border-white/8 text-white/50 text-xs"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 flex items-center justify-between gap-2">
          <motion.div
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${
              isYellow ? "text-yellow-400" : "text-purple-400"
            }`}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Learn More <ArrowRight size={14} className="sm:w-[15px]" />
          </motion.div>
        </div>
      </div>

      <div
        className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
        ${
          isYellow
            ? "shadow-[inset_0_0_60px_rgba(250,204,21,0.04)]"
            : "shadow-[inset_0_0_60px_rgba(168,85,247,0.04)]"
        }`}
      />
    </motion.div>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Who can participate in ICell events?",
    a: "All students of NIT Kurukshetra can participate. Some events also invite participants from other institutions — check each event's registration page for eligibility.",
  },
  {
    q: "Do I need prior finance or business knowledge for BidBizz?",
    a: "Basic curiosity and willingness to learn is enough! We conduct pre-event workshops to level the playing field for all participants.",
  },
  {
    q: "How are teams formed for Case on Point?",
    a: "Teams of 2–3 members register together. Solo registrations are allowed and we'll help you find teammates through our Discord server.",
  },
  {
    q: "Will there be mentorship during the events?",
    a: "Yes — industry mentors and ICell seniors guide teams during the preparation phase. Office hours are scheduled before each event.",
  },
  {
    q: "How do I download my certificate?",
    a: "Once certificates are generated, open the event card. If your roll number (from your profile) matches the participant list, a Download button will appear. Make sure your profile has your correct roll number set.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden"
        >
          <button
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-white/90 font-medium">{faq.q}</span>
            <motion.span
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 text-white/40"
            >
              <ChevronDown size={18} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <p className="px-6 pb-5 text-white/55 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { label: "Events Hosted", value: "12+", icon: CalendarDays },
  { label: "Participants", value: "500+", icon: Users },
  { label: "Total Prize Pool", value: "₹1 Lakh+", icon: Trophy },
  // { label: "Avg. Duration", value: "2 Days", icon: Clock },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const { user } = useAuth();

  // Load events with error handling
  const loadEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await api.get("/events");
      const rawEvents = Array.isArray(response.data) ? response.data : [];

      // Filter and normalize events
      const normalizedEvents = rawEvents.map(normaliseEvent);
      setEvents(normalizedEvents);
      setLastFetchTime(new Date());

      console.log(`✅ Loaded ${normalizedEvents.length} events`);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to load events";
      console.error("❌ Failed to load events:", errorMsg);
      setError(errorMsg);
      // Keep showing old events even if fetch fails
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    loadEvents(false);
  }, []);

  // Polling mechanism - check for updates every 30 seconds
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      loadEvents(true);
    }, 30000); // 30 seconds

    return () => {
      clearInterval(pollingInterval);
    };
  }, []);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    await loadEvents(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-6 w-full z-50 flex justify-center">
        <Navbar />
      </div>

      {/* HERO */}
      <section className="relative pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-yellow-500/8 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-purple-500/8 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4 sm:mb-6 text-xs sm:text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 font-medium tracking-widest uppercase">
              ICell Events 2026
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight sm:leading-tight tracking-tight px-2"
          >
            <span className="text-white">Where Ideas</span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Become Impact
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed px-2"
          >
            From high-stakes finance simulations to boardroom-style case
            competitions — ICell events are designed to challenge your thinking,
            sharpen your skills, and connect you with tomorrow's leaders.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-2"
          >
            <motion.a
              href="#events"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 30px rgba(250,204,21,0.25)",
              }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 sm:flex-initial px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-yellow-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap text-center"
            >
              Explore Events
            </motion.a>
            <motion.a
              href="#faq"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 sm:flex-initial px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full border border-white/15 text-white/80 font-semibold text-xs sm:text-sm hover:bg-white/5 transition-all duration-300 whitespace-nowrap text-center"
            >
              FAQs
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6"
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  custom={i * 0.05}
                  className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-2xl bg-white/3 border border-white/10 text-center w-40 sm:w-48"
                >
                  <span className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-yellow-500/10 border border-yellow-500/15">
                    <Icon size={16} className="sm:w-[18px] text-yellow-400" />
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {s.value}
                  </p>
                  <p className="text-white/50 text-xs sm:text-xs">{s.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* EVENTS GRID */}
      <section id="events" className="px-4 sm:px-6 pb-20 sm:pb-28 md:pb-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12 flex items-center justify-between gap-4"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Our Events
              </h2>
              <p className="text-white/50 mt-2 sm:mt-3 max-w-xl text-sm sm:text-base">
                Two flagship experiences — each crafted to push you beyond the
                classroom and into the real world.
              </p>
              {lastFetchTime && (
                <p className="text-white/30 text-xs sm:text-sm mt-2">
                  Last updated: {lastFetchTime.toLocaleTimeString()}
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-medium text-xs sm:text-sm hover:bg-yellow-500/30 disabled:opacity-50 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
            >
              {refreshing ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4"
                  >
                    ↻
                  </motion.span>
                  <span className="hidden sm:inline">Refreshing…</span>
                </>
              ) : (
                <>
                  <span>↻</span>
                  <span className="hidden sm:inline">Refresh</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              <p className="font-medium">⚠️ Error loading events</p>
              <p className="text-red-400/70 text-xs mt-1">{error}</p>
              <p className="text-red-400/60 text-xs mt-2">
                Old events are shown below. Trying again in 30 seconds…
              </p>
            </motion.div>
          )}

          {loading && events.length === 0 ? (
            <div className="flex justify-center py-16 sm:py-20 text-white/40 text-sm sm:text-base">
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-3xl"
                >
                  ↻
                </motion.div>
                Loading events…
              </div>
            </div>
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-16 sm:py-20 px-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <p className="text-white/60 text-base sm:text-lg">
                No events available yet. Check back soon!
              </p>
            </motion.div>
          ) : (
            <>
              {/* Upcoming Events Section */}
              {events.filter((e) => !e.isPast).length > 0 && (
                <div className="mb-20">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-3"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    Upcoming Events
                  </motion.h3>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid md:grid-cols-2 gap-6 sm:gap-8"
                  >
                    {events
                      .filter((e) => !e.isPast)
                      .sort((a, b) => a.date - b.date) // Sort ascending: earliest first
                      .map((event, i) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          index={i}
                          onOpen={setSelectedEvent}
                        />
                      ))}
                  </motion.div>
                </div>
              )}

              {/* Past Events Section */}
              {events.filter((e) => e.isPast).length > 0 && (
                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl font-bold text-white/60 mb-6 sm:mb-8"
                  >
                    Past Events
                  </motion.h3>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                  >
                    {events
                      .filter((e) => e.isPast)
                      .sort((a, b) => b.date - a.date) // Sort descending: most recent first
                      .map((event, i) => (
                        <PastEventCard
                          key={event.id}
                          event={event}
                          index={i}
                          onOpen={setSelectedEvent}
                        />
                      ))}
                  </motion.div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* TIMELINE TEASER */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-28 md:pb-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl sm:rounded-3xl border border-yellow-500/15 bg-gradient-to-br from-yellow-500/5 to-transparent p-6 sm:p-10 md:p-14 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-yellow-400/5 blur-3xl pointer-events-none" />
            <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
              <span className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex-shrink-0">
                <MapPin size={18} className="sm:w-[20px] text-yellow-400" />
              </span>
              <div className="min-w-0">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                  Venue
                </p>
                <p className="text-white font-semibold text-sm sm:text-base break-words">
                  NIT Kurukshetra — Main Campus, Haryana
                </p>
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Season 2026 Kicks Off{" "}
              <span className="text-yellow-400">Soon.</span>
            </h3>
            <p className="text-white/60 leading-relaxed max-w-2xl text-sm sm:text-base">
              Mark your calendars. ICell's event season is about to begin.
              Whether you're a finance wizard or a born strategist, there's a
              stage for you. Stay tuned for exact dates and register before
              slots fill up.
            </p>
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 25px rgba(250,204,21,0.2)",
              }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-yellow-400 text-zinc-950 font-semibold text-xs sm:text-sm transition-all duration-300"
            >
              Get Notified <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-10 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-white/50 mt-2 sm:mt-3 text-sm sm:text-base">
              Everything you need to know before registering.
            </p>
          </motion.div>
          <FAQ />
        </div>
      </section>

      <Footer />

      <AnimatePresence>
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
