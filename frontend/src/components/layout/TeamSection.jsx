import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Linkedin, Instagram, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeamSection() {

  const [team, setTeam] = useState([])

  useEffect(() => {

    const fetchTeam = async () => {

      const res = await fetch("http://localhost:5000/teams")
      const data = await res.json();
      setTeam(data)
    }

    fetchTeam()

  }, [])

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const tripleTeam = [...team, ...team, ...team];

  return (
    <section className="relative overflow-hidden bg-black py-12 sm:py-16 md:py-20">

      {/* Header */}
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
          </span>
          {" "}
          <span className="text-white">Leadership</span>
        </h2>
        
        <p className="mt-3 sm:mt-4 text-white/50 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
          Visionaries driving innovation and excellence in everything we do
        </p>
      </motion.div>

      {/* Smooth infinite scroll container */}
      <div className="relative w-full overflow-hidden">
        {/* Enhanced gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-48 bg-gradient-to-r from-black via-black/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 lg:w-48 bg-gradient-to-l from-black via-black/90 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-4 sm:gap-5 md:gap-6 lg:gap-10"
          animate={{
            x: [0, -(team.length * 280 + (team.length - 1) * 24)]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear"
            }
          }}
        >
          {tripleTeam.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.5,
                delay: (index % team.length) * 0.05,
                ease: "easeOut"
              }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] lg:w-[280px] group cursor-pointer"
            >
              <motion.div
                whileHover={{ y: -12 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative h-full"
              >
                <div className="relative p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 group-hover:border-yellow-400/30 transition-all duration-500 h-full flex flex-col">
                  {/* Profile image */}
                  <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 mb-4 sm:mb-5 flex-shrink-0">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-yellow-400/40">
                      <img
                        src={member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.position}`}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:shadow-lg transition-shadow duration-500"
                      />
                    </div>
                  </div>

                  {/* Name & role - Fixed height container for symmetry */}
                  <div className="text-center space-y-1.5 sm:space-y-2 flex-grow flex flex-col items-center justify-start mb-4 sm:mb-5">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 leading-tight line-clamp-2 w-full px-1 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center">
                      {member.name}
                    </h3>
                    <p className="text-yellow-400/80 text-xs sm:text-sm font-medium tracking-wide uppercase line-clamp-2 w-full px-1 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
                      {member.position}
                    </p>
                  </div>

                  {/* Social links - Fixed at bottom */}
                  <div className="mt-auto flex gap-1.5 sm:gap-2">
                    <motion.a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400/30 text-white/60 hover:text-yellow-400 transition-all duration-300 group/btn"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <Linkedin size={16} className="sm:w-[18px] sm:h-[18px] group-hover/btn:rotate-12 transition-transform flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">LinkedIn</span>
                    </motion.a>
                    <motion.a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/30 text-white/60 hover:text-pink-400 transition-all duration-300 group/btn"
                      aria-label={`${member.name} Instagram`}
                    >
                      <Instagram size={16} className="sm:w-[18px] sm:h-[18px] group-hover/btn:rotate-12 transition-transform flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">Instagram</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}