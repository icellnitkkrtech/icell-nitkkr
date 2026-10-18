import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import GalleryGroup from "../gallery/GalleryGroup";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API = `${API_BASE}/api/gallery-groups`;

export default function GallerySection() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch gallery groups
  useEffect(() => {
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
          // Ensure all groups have sanitized data structures
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <section className="relative min-h-screen bg-black px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative min-h-screen bg-black px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-white/60">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (groups.length === 0) {
    return null; // Don't show section if no groups
  }

  return (
    <section className="relative min-h-screen bg-black px-4 sm:px-6 py-12 sm:py-20 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4 sm:mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400/90 text-xs font-medium tracking-wider uppercase">
              Photo Gallery
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-yellow-500 bg-clip-text text-transparent tracking-tight"
          >
            Event Moments
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-white/90 mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed max-w-3xl"
          >
            Explore the vibrant moments from our Innovation Cell events. From
            hackathons to workshops, celebrate the creativity and innovation
            that defines our community.
          </motion.p>
        </motion.div>

        {/* Gallery Groups Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Groups Grid - Responsive 2x3 layout (max 6 items on home page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.slice(0, 6).map((group, index) => (
              <motion.div
                key={group._id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GalleryGroup group={group} />
              </motion.div>
            ))}
          </div>

          {/* View More Button */}
          {groups.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="mt-12 sm:mt-16 flex flex-col items-center justify-center gap-3"
            >
              <Link
                to="/gallery"
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:scale-105 active:scale-95"
              >
                <span>View More Moments</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}

          {/* Info text */}
          <motion.div
            variants={itemVariants}
            className="mt-8 text-center text-white/60 text-sm"
          >
            <p>
              Showing {Math.min(groups.length, 6)} of {groups.length} galleries (
              {groups.reduce((sum, g) => sum + g.total_images, 0)} total photos)
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Background gradient accent */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}
