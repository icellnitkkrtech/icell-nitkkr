



import { motion } from "framer-motion";
import { Linkedin, Instagram, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

// ✅ Always use the env variable — never hardcode localhost
const API = import.meta.env.VITE_API_URL ?? "";

export default function TeamSection() {
  const [team, setTeam] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/teams`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        // ✅ Always guarantee an array
        setTeam(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Could not load team data:", err.message);
        setTeam([]);
      }
    };

    fetchTeam();
  }, []);

  const safeTeam = Array.isArray(team) ? team : [];

  // Need at least 1 member to render the carousel.
  // Triple the array so the infinite scroll loop never shows a gap.
  const tripleTeam = safeTeam.length > 0
    ? [...safeTeam, ...safeTeam, ...safeTeam]
    : [];

  // Width of one card + gap in px — must match the Tailwind classes below
  const CARD_W  = 280; // w-[280px]
  const GAP     = 40;  // gap-10 = 2.5rem = 40px
  const loopPx  = safeTeam.length * (CARD_W + GAP);

  return (
    <section className="relative overflow-hidden bg-black py-12 sm:py-16 md:py-20">

      {/* ── Section heading ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative text-center mb-12 md:mb-16 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-4 sm:mb-6"
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
          <span className="text-yellow-400 text-xs sm:text-sm font-medium">Our Team</span>
        </motion.div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-3 sm:mb-4">
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Meet Our
          </span>{" "}
          <span className="text-white">Leadership</span>
        </h2>

        <p className="mt-3 sm:mt-4 text-white/50 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
          Visionaries driving innovation and excellence in everything we do
        </p>
      </motion.div>

      {/* ── Carousel ────────────────────────────────────────────────────────── */}
      {safeTeam.length === 0 ? (
        // Empty state — shown while loading or if DB is empty
        <div className="text-center py-16 text-white/30 text-sm">
          No team members yet.
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          {/* Edge fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-48 bg-gradient-to-r from-black via-black/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-48 bg-gradient-to-l from-black via-black/90 to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-10"
            animate={{ x: [0, -loopPx] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: Math.max(safeTeam.length * 4, 20), // speed scales with count
                ease: "linear",
              },
            }}
          >
            {tripleTeam.map((member, index) => (
              <motion.div
                key={`${member.id}-${index}`}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="flex-shrink-0 w-[280px] group cursor-pointer"
              >
                <motion.div
                  whileHover={{ y: -12 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative h-full"
                >
                  <div className="relative p-6 rounded-3xl border border-white/10 group-hover:border-yellow-400/30 transition-all duration-500 h-full flex flex-col">

                    {/* Avatar */}
                    <div className="relative mx-auto w-40 h-40 mb-5 flex-shrink-0">
                      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-yellow-400/40">
                        <img
                          src={
                            member.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name ?? member.id)}`
                          }
                          alt={member.name ?? "Team member"}
                          className="w-full h-full object-cover transition-shadow duration-500 group-hover:shadow-lg"
                        />
                      </div>
                    </div>

                    {/* Name + position */}
                    <div className="text-center space-y-2 flex-grow flex flex-col items-center justify-start mb-5">
                      <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 leading-tight line-clamp-2 w-full px-1 min-h-[3.5rem] flex items-center justify-center">
                        {member.name}
                      </h3>
                      <p className="text-yellow-400/80 text-sm font-medium tracking-wide uppercase line-clamp-2 w-full px-1 min-h-[2.5rem] flex items-center justify-center">
                        {member.position}
                      </p>
                    </div>

                    {/* Social links */}
                    <div className="mt-auto flex gap-2">
                      <motion.a
                        href={member.linkedin || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { if (!member.linkedin || member.linkedin === "#") e.preventDefault(); }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400/30 text-white/60 hover:text-yellow-400 transition-all duration-300 group/btn"
                      >
                        <Linkedin size={18} className="group-hover/btn:rotate-12 transition-transform flex-shrink-0" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </motion.a>

                      <motion.a
                        href={member.instagram || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { if (!member.instagram || member.instagram === "#") e.preventDefault(); }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/30 text-white/60 hover:text-pink-400 transition-all duration-300 group/btn"
                      >
                        <Instagram size={18} className="group-hover/btn:rotate-12 transition-transform flex-shrink-0" />
                        <span className="text-sm font-medium">Instagram</span>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}
