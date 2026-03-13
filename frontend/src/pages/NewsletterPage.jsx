import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  BookOpen,
  ChevronRight,
  Calendar,
  ArrowRight,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/* ------------------------------------------------------------------ */
/*  Data                                                                 */
/* ------------------------------------------------------------------ */

const newsletters = [
  {
    id: 1,
    edition: "Edition #12",
    date: "March 3, 2026",
    summary:
      "Nifty 50 hits a new all-time high — but is the rally sustainable? We dissect the macro drivers, sector rotation, and what retail investors should watch next.",
    excerpt:
      "This week the markets surged past 24,000, driven by robust FII inflows and strong quarterly earnings from the banking sector. Our analysts break down the technical indicators, support levels, and the key risk events (CPI data, RBI meet) that could determine the next leg of the movement.",
    topics: ["Nifty Analysis", "FII Inflows", "RBI Policy", "Sector Report"],
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    featured: true,
  },
  {
    id: 2,
    edition: "Edition #11",
    date: "February 24, 2026",
    summary:
      "Over ₹4,200 Cr raised by Indian startups in Q1 2026. We track the hottest rounds, emerging sectors, and what the funding landscape signals for founders.",
    excerpt:
      "FinTech, CleanTech, and AgriTech dominated Q1 deal flow. Notable rounds include a Series B from a Bengaluru-based BNPL startup and a seed round for a farmer-direct logistics play from Jaipur. We also cover insights from 3 VC partners on what they're prioritising in 2026.",
    topics: ["VC Landscape", "Series Rounds", "FinTech", "CleanTech"],
    readTime: "9 min read",
    image:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80",
    featured: false,
  },
  {
    id: 3,
    edition: "Edition #10",
    date: "February 17, 2026",
    summary:
      "SIPs are the poster child of retail investing — but most people still get them wrong. We explain step-up SIPs, the right funds to pick, and the compounding math.",
    excerpt:
      "A Systematic Investment Plan is powerful — but strategy matters. This edition covers how to choose between large-cap, mid-cap, and flexi-cap funds, how step-up SIPs multiply wealth, and why SIP pausing during volatility is a mistake most investors regret.",
    topics: ["SIP Strategy", "Mutual Funds", "Compounding", "Beginner Guide"],
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80",
    featured: false,
  },
  {
    id: 4,
    edition: "Edition #9",
    date: "February 10, 2026",
    summary:
      "Tax slabs, capex push, and fiscal deficit targets — we break down Budget 2026's winners, losers, and what it means for your wallet and your portfolio.",
    excerpt:
      "The Finance Minister presented a budget focused on inclusive growth and infrastructure. New tax slabs benefit the middle class, while increased capex in railways and highways may spur a multi-year construction cycle. We analyse the sectors poised to gain and those facing headwinds.",
    topics: ["Budget 2026", "Tax Reform", "Capex Cycle", "Sector Analysis"],
    readTime: "10 min read",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    featured: false,
  },
  {
    id: 5,
    edition: "Edition #8",
    date: "February 3, 2026",
    summary:
      "India's crypto regulatory framework takes shape. We compare global approaches, discuss TDS implications, and assess whether the ecosystem can still thrive under scrutiny.",
    excerpt:
      "With SEBI and RBI both staking regulatory claims over digital assets, India's crypto landscape is in flux. We cover the latest MeitY consultations, the impact of 30% tax on gains, and how blockchain startups are pivoting to remain compliant while innovating.",
    topics: ["Crypto Policy", "Web3", "SEBI", "Blockchain Startups"],
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1591994843349-f415893b3a6b?w=600&q=80",
    featured: false,
  },
];



/* ------------------------------------------------------------------ */
/*  Animation variants                                                   */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut", delay },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/* ------------------------------------------------------------------ */
/*  Newsletter Modal                                                     */
/* ------------------------------------------------------------------ */

function NewsletterModal({ item, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden rounded-t-3xl">
          <img
            src={item.image}
            alt={item.edition}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {item.date}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={12} />
              {item.readTime}
            </span>
          </div>

          <p className="text-white/40 text-xs font-medium tracking-wider uppercase mb-2">
            {item.edition}
          </p>
          <p className="text-white/70 leading-relaxed mb-4">{item.summary}</p>
          <p className="text-white/50 text-sm leading-relaxed">{item.excerpt}</p>

          {/* Topics */}
          <div className="flex flex-wrap gap-2 mt-6">
            {item.topics.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="mt-6 text-sm text-white/40 italic">
            🔒 Full edition available exclusively to ICell Newsletter subscribers.
          </p>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(250,204,21,0.2)" }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 w-full py-3.5 rounded-full bg-yellow-400 text-zinc-950 font-semibold text-sm"
          >
            Subscribe to Read Full Edition
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured Card                                                        */
/* ------------------------------------------------------------------ */

function FeaturedCard({ item, onOpen }) {

  return (
    <motion.div
      variants={fadeUp}
      custom={0}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="group relative rounded-3xl overflow-hidden border border-white/10 cursor-pointer bg-white/3"
      onClick={() => onOpen(item)}
    >
      <div className="md:flex">
        {/* Image */}
        <div className="relative md:w-2/5 h-60 md:h-auto overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950/80 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent md:hidden" />
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
              ⭐ Featured
            </span>
          </div>

          <p className="text-white/35 text-xs font-medium tracking-wider uppercase mb-2">
            {item.edition} · {item.date}
          </p>
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            {item.summary}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {item.topics.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-white/50 text-xs"
              >
                {t}
              </span>
            ))}
          </div>

          <motion.div
            className="flex items-center gap-2 text-yellow-400 text-sm font-medium"
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Read This Edition <ArrowRight size={15} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Regular Newsletter Card                                              */
/* ------------------------------------------------------------------ */

function NewsletterCard({ item, onOpen }) {

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="group flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-white/3 cursor-pointer"
      onClick={() => onOpen(item)}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={item.image}
          alt={item.edition}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between text-white/35 text-xs mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar size={11} />
            {item.date}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={11} />
            {item.readTime}
          </span>
        </div>

        <p className="text-white/35 text-xs font-medium tracking-wider uppercase mb-1.5">
          {item.edition}
        </p>
        <p className="text-white/55 text-sm leading-relaxed flex-1">
          {item.summary}
        </p>

        <motion.div
          className="mt-5 flex items-center gap-2 text-white/50 hover:text-yellow-400 text-sm font-medium transition-colors duration-300"
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          Read More <ChevronRight size={14} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subscribe Panel                                                      */
/* ------------------------------------------------------------------ */

function SubscribePanel() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  const perks = [
    "Weekly finance & market analysis",
    "Startup ecosystem updates",
    "Exclusive ICell event news",
    "Personal finance tips from experts",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative rounded-3xl overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-yellow-500/8 via-transparent to-transparent p-10 md:p-14"
    >
      {/* Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-yellow-400/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-5">
            <Sparkles size={13} className="text-yellow-400" />
            <span className="text-yellow-400 text-xs font-medium tracking-wider uppercase">
              Free Weekly Newsletter
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Stay Ahead of the
            <br />
            <span className="text-yellow-400">Markets.</span>
          </h2>
          <p className="text-white/60 leading-relaxed mb-8">
            Join 500+ readers who get ICell's finance newsletter every Monday.
            No spam — just sharp, student-distilled insights.
          </p>

          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/70 text-sm">
                <span className="mt-0.5 flex-shrink-0 p-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/30">
                  <Check size={11} className="text-yellow-400" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — subscribe form */}
        <div className="bg-white/4 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {!submitted ? (
            <>
              <Mail size={32} className="text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Subscribe Now
              </h3>
              <p className="text-white/50 text-sm mb-6">
                Drop your email below and get the next edition delivered to your inbox.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(250,204,21,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-yellow-400 text-zinc-950 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Subscribe for Free
                  <ArrowRight size={16} />
                </motion.button>
              </form>

              <p className="mt-4 text-white/30 text-xs text-center">
                Unsubscribe anytime. Your data is safe with us.
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-400/15 border border-yellow-400/25 flex items-center justify-center mb-5">
                <Check size={28} className="text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">You're in!</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Welcome to the ICell Finance Newsletter community. Watch your
                inbox every Monday morning. 🎉
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                            */
/* ------------------------------------------------------------------ */

export default function NewsletterPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const featured = newsletters.find((n) => n.featured);
  const rest = newsletters.filter((n) => !n.featured);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <div className="fixed top-6 w-full z-50 flex justify-center">
        <Navbar />
      </div>

      {/* ---- HERO ---- */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-yellow-500/7 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-white/3 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-xs font-medium tracking-widest uppercase">
              Finance Team · Weekly Newsletter
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold leading-tight"
          >
            <span className="text-white">The ICell</span>
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Finance Brief
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Every Monday, ICell's finance team curates the most important stories
            in markets, startups, policy, and personal finance — explained simply,
            so you learn while you read.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/45"
          >
            {["500+ Subscribers", "Weekly Editions", "Student-written", "Free Forever"].map(
              (tag) => (
                <span key={tag} className="flex items-center gap-2">
                  <Check size={13} className="text-yellow-400" />
                  {tag}
                </span>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ---- FEATURED EDITION ---- */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-white/40 text-xs font-medium tracking-widest uppercase">
              Latest Edition
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {featured && (
              <FeaturedCard item={featured} onOpen={setSelectedItem} />
            )}
          </motion.div>
        </div>
      </section>

      {/* ---- PAST EDITIONS ---- */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold text-white">Past Editions</h2>
            <p className="text-white/45 mt-2 text-sm">
              Browse our archive — every edition packed with carefully researched insights.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6"
          >
            {rest.map((item) => (
              <NewsletterCard key={item.id} item={item} onOpen={setSelectedItem} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- SUBSCRIBE ---- */}
      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          <SubscribePanel />
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <Footer />

      {/* ---- MODAL ---- */}
      <AnimatePresence>
        {selectedItem && (
          <NewsletterModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
