import { useState } from "react";
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
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/* ------------------------------------------------------------------ */
/*  Data                                                                 */
/* ------------------------------------------------------------------ */

const events = [
  {
    id: "bidbizz",
    tag: "Finance Event",
    tagColor: "yellow",
    title: "BidBizz",
    subtitle: "Where strategy meets the thrill of bidding.",
    description:
      "BidBizz is ICell's flagship finance event — a high-stakes simulation where participants step into the shoes of traders, investors, and deal-makers. Build your portfolio, outbid your rivals, and prove your market instincts.",
    longDescription:
      "Teams compete in a multi-round bidding war where every decision — buy, hold, or sell — carries real consequences in the simulated market. From IPO launches to hostile takeovers, BidBizz throws every curveball finance can offer. Guided by industry mentors, participants sharpen their financial acumen, negotiation skills, and strategic thinking in a fast-paced, electrifying environment.",
    icon: Trophy,
    accentColor: "yellow",
    highlights: [
      { label: "Format", value: "Team-based (2–4 members)" },
      { label: "Rounds", value: "3 Elimination Rounds" },
      { label: "Prize Pool", value: "₹ 30,000+" },
      { label: "Duration", value: "Full Day Event" },
    ],
    tags: ["Stock Simulation", "Bidding War", "Finance Strategy", "Negotiation"],
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=80",
    status: "Upcoming",
  },
  {
    id: "caseonpoint",
    tag: "Ideation Event",
    tagColor: "purple",
    title: "Case on Point",
    subtitle: "Where Strategy Meets Innovation",
    description:
      "Case on Point is ICell's premier case-competition — a crucible for analytical thinking and business acumen. Teams dissect real-world business scenarios and present actionable strategies to a panel of judges from industry.",
    longDescription:
      "Participants receive a complex business case spanning domains like product strategy, marketing, operations, or social entrepreneurship. They research, identify root causes, devise solutions, and present their roadmap with conviction. The competition rewards not just the best idea, but the most compelling, well-reasoned argument. It's where future consultants, entrepreneurs, and leaders cut their teeth.",
    icon: Lightbulb,
    accentColor: "purple",
    highlights: [
      { label: "Format", value: "Team-based (2–3 members)" },
      { label: "Rounds", value: "2 Rounds + Grand Finale" },
      { label: "Prize Pool", value: "₹ 20,000+" },
      { label: "Duration", value: "Day & a Half" },
    ],
    tags: ["Case Analysis", "Business Strategy", "Presentation", "Problem Solving"],
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80",
    status: "Registration Open",
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                   */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Event Modal                                                          */
/* ------------------------------------------------------------------ */

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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-56 overflow-hidden rounded-t-3xl">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
          {/* Status pill */}
          <span
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
              event.status === "Registration Open"
                ? "bg-green-500/20 border border-green-500/40 text-green-400"
                : "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
            }`}
          >
            {event.status}
          </span>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                isYellow
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}
            >
              <Icon size={12} />
              {event.tag}
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-2">{event.title}</h2>
          <p
            className={`text-lg mb-6 ${
              isYellow ? "text-yellow-400/80" : "text-purple-400/80"
            }`}
          >
            {event.subtitle}
          </p>
          <p className="text-white/70 leading-relaxed mb-4">
            {event.description}
          </p>
          <p className="text-white/50 leading-relaxed text-sm">
            {event.longDescription}
          </p>

          {/* Highlights grid */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {event.highlights.map((h) => (
              <div
                key={h.label}
                className="p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                  {h.label}
                </p>
                <p className="text-white font-semibold">{h.value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {event.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs"
              >
                {t}
              </span>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`mt-8 w-full py-3.5 rounded-full font-semibold text-sm transition-all duration-300 ${
              isYellow
                ? "bg-yellow-400 text-zinc-950 hover:bg-yellow-500"
                : "bg-purple-500 text-white hover:bg-purple-600"
            }`}
          >
            Register Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event Card                                                           */
/* ------------------------------------------------------------------ */

function EventCard({ event, index, onOpen }) {
  const Icon = event.icon;
  const isYellow = event.accentColor === "yellow";

  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.1}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-white/3 backdrop-blur-sm cursor-pointer"
      onClick={() => onOpen(event)}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* Status badge */}
        <span
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
            event.status === "Registration Open"
              ? "bg-green-500/20 border border-green-500/40 text-green-400"
              : "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
          }`}
        >
          {event.status}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-7">
        {/* Tag */}
        <span
          className={`inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-medium border mb-4 ${
            isYellow
              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
              : "bg-purple-500/10 border-purple-500/20 text-purple-400"
          }`}
        >
          <Icon size={12} />
          {event.tag}
        </span>

        <h3 className="text-3xl font-bold text-white mb-2">{event.title}</h3>
        <p
          className={`text-sm mb-3 ${
            isYellow ? "text-yellow-400/70" : "text-purple-400/70"
          }`}
        >
          {event.subtitle}
        </p>
        <p className="text-white/60 text-sm leading-relaxed flex-1">
          {event.description}
        </p>

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {event.highlights.slice(0, 2).map((h) => (
            <div key={h.label} className="p-3 rounded-xl bg-white/5 border border-white/8">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">
                {h.label}
              </p>
              <p className="text-white text-sm font-medium">{h.value}</p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {event.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-white/50 text-xs"
            >
              {t}
            </span>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className={`mt-6 flex items-center gap-2 text-sm font-semibold ${
            isYellow ? "text-yellow-400" : "text-purple-400"
          }`}
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          Learn More <ArrowRight size={15} />
        </motion.div>
      </div>

      {/* Glow on hover */}
      <div
        className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          isYellow
            ? "shadow-[inset_0_0_60px_rgba(250,204,21,0.04)]"
            : "shadow-[inset_0_0_60px_rgba(168,85,247,0.04)]"
        }`}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                  */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Stats bar                                                            */
/* ------------------------------------------------------------------ */

const stats = [
  { label: "Events Hosted", value: "12+", icon: CalendarDays },
  { label: "Participants", value: "500+", icon: Users },
  { label: "Total Prize Pool", value: "₹1 Lakh+", icon: Trophy },
  { label: "Avg. Duration", value: "2 Days", icon: Clock },
];

/* ------------------------------------------------------------------ */
/*  Main Page                                                            */
/* ------------------------------------------------------------------ */

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <div className="fixed top-6 w-full z-50 flex justify-center">
        <Navbar />
      </div>

      {/* ---- HERO ---- */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-yellow-500/8 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-purple-500/8 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-xs font-medium tracking-widest uppercase">
              ICell Events 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold leading-tight tracking-tight"
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
            className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            From high-stakes finance simulations to boardroom-style case
            competitions — ICell events are designed to challenge your thinking,
            sharpen your skills, and connect you with tomorrow's leaders.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <motion.a
              href="#events"
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(250,204,21,0.25)" }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-full bg-yellow-400 text-zinc-950 font-semibold text-sm transition-all duration-300"
            >
              Explore Events
            </motion.a>
            <motion.a
              href="#faq"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-full border border-white/15 text-white/80 font-semibold text-sm hover:bg-white/5 transition-all duration-300"
            >
              FAQs
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ---- STATS ---- */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  custom={i * 0.05}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/3 border border-white/10 text-center"
                >
                  <span className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/15">
                    <Icon size={18} className="text-yellow-400" />
                  </span>
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-white/50 text-xs">{s.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ---- EVENTS GRID ---- */}
      <section id="events" className="px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Our Events
            </h2>
            <p className="text-white/50 mt-3 max-w-xl">
              Two flagship experiences — each crafted to push you beyond the
              classroom and into the real world.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 gap-8"
          >
            {events.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                onOpen={setSelectedEvent}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- TIMELINE TEASER ---- */}
      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-yellow-500/15 bg-gradient-to-br from-yellow-500/5 to-transparent p-10 md:p-14 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-yellow-400/5 blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4 mb-8">
              <span className="p-3 rounded-xl bg-yellow-500/15 border border-yellow-500/20">
                <MapPin size={20} className="text-yellow-400" />
              </span>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                  Venue
                </p>
                <p className="text-white font-semibold">
                  NIT Kurukshetra — Main Campus, Haryana
                </p>
              </div>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Season 2026 Kicks Off{" "}
              <span className="text-yellow-400">Soon.</span>
            </h3>
            <p className="text-white/60 leading-relaxed max-w-2xl">
              Mark your calendars. ICell's event season is about to begin. Whether
              you're a finance wizard or a born strategist, there's a stage for
              you. Stay tuned for exact dates and register before slots fill up.
            </p>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(250,204,21,0.2)" }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-yellow-400 text-zinc-950 font-semibold text-sm transition-all duration-300"
            >
              Get Notified
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section id="faq" className="px-6 pb-28">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h2 className="text-4xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-white/50 mt-3">
              Everything you need to know before registering.
            </p>
          </motion.div>
          <FAQ />
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <Footer />

      {/* ---- MODAL ---- */}
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
