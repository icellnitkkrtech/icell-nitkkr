import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader, Images, Search, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import GalleryGroup from "../components/gallery/GalleryGroup";
import Footer from "../components/layout/Footer";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API = `${API_BASE}/api/gallery-groups`;

export default function GalleryPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch gallery groups
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(API);

        if (!res.ok) {
          throw new Error("Failed to fetch gallery groups");
        }

        const data = await res.json();
        const groupsArray = Array.isArray(data) ? data : [];

        if (groupsArray.length === 0) {
          setError("No gallery groups yet");
          setGroups([]);
        } else {
          const sanitizedGroups = groupsArray.map((group) => ({
            ...group,
            images: Array.isArray(group.images) ? group.images : [],
            total_images: group.total_images || 0,
            thumbnail_image: group.thumbnail_image || "",
            group_name: group.group_name || "Untitled",
          }));
          setGroups(sanitizedGroups);
        }
      } catch (err) {
        console.error("Gallery groups fetch error:", err);
        setError("Failed to load gallery groups");
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase().trim();
    return groups.filter((group) =>
      (group.group_name || "").toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  const totalPhotos = useMemo(() => {
    return groups.reduce((sum, g) => sum + (g.total_images || 0), 0);
  }, [groups]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white pt-24 sm:pt-28">
      <main className="flex-1 relative px-4 sm:px-6 md:px-8 py-10 max-w-7xl mx-auto w-full">
        {/* Subtle decorative glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-72 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-yellow-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400/90 text-xs font-semibold tracking-wider uppercase">
              Official Photo Archive
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
          >
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Event Moments Gallery
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-white/70 mt-4 sm:mt-5 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Explore every innovation workshop, hackathon, tech summit, and milestone
            celebrated by the Innovation Cell at NIT Kurukshetra.
          </motion.p>

          {/* Search & Stats Bar */}
          {!loading && !error && groups.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search albums by event name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-yellow-400/60 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Stats pill */}
              <div className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                <Images className="w-3.5 h-3.5 text-yellow-400" />
                <span>
                  {groups.length} Albums • {totalPhotos} Photos
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <Loader className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
            <p className="text-white/60 text-sm">Loading all event moments...</p>
          </div>
        ) : error && groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[35vh] text-center bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-white/70 text-base mb-2">{error}</p>
            <p className="text-white/40 text-xs">
              Check back soon for upcoming photo galleries.
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] text-center bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-white/70 text-base">
              No galleries match &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-yellow-400 hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group._id}
                variants={itemVariants}
                transition={{ delay: Math.min(index * 0.05, 0.4) }}
              >
                <GalleryGroup group={group} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
