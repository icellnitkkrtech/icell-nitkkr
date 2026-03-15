import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function EventSection() {
  const [stackHover, setStackHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Smaller image URLs for faster decode and less layout shift
  const images = [
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80",
    "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400&q=80",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&q=80",
  ];

  const desktopCardOffsets = [
    {
      x: -200,
      y: -140,
      rotate: -8,
      hover: { x: -260, y: -100, rotate: -16 }
    },
    {
      x: -160,
      y: -160,
      rotate: -4,
      hover: { x: -170, y: -190, rotate: -6 }
    },
    {
      x: -120,
      y: -160,
      rotate: 4,
      hover: { x: -90, y: -190, rotate: 6 }
    },
    {
      x: -80,
      y: -140,
      rotate: 8,
      hover: { x: -10, y: -100, rotate: 16 }
    }
  ];

  const mobileCardOffsets = [
    {
      x: -80,
      y: -48,
      rotate: -6,
      hover: { x: -110, y: -35, rotate: -10 }
    },
    {
      x: -56,
      y: -58,
      rotate: -3,
      hover: { x: -60, y: -78, rotate: -5 }
    },
    {
      x: -32,
      y: -58,
      rotate: 3,
      hover: { x: -18, y: -78, rotate: 5 }
    },
    {
      x: -10,
      y: -48,
      rotate: 6,
      hover: { x: 18, y: -35, rotate: 10 }
    }
  ];

  useEffect(() => {
    const syncMobileState = () => setIsMobile(window.innerWidth < 768);
    syncMobileState();
    window.addEventListener("resize", syncMobileState);
    return () => window.removeEventListener("resize", syncMobileState);
  }, []);

  const cardOffsets = isMobile ? mobileCardOffsets : desktopCardOffsets;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
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

  return (
    <section className="relative min-h-screen bg-black px-4 sm:px-6 py-16 sm:py-20 md:py-24 overflow-hidden">

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center min-h-[70vh]">
          {/* Left: Society text - staggered entrance animation */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
            className="order-2 md:order-1"
          >
            {/* Small badge above title */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400/90 text-xs font-medium tracking-wider uppercase">
                Flagship Event
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold bg-yellow-500 bg-clip-text text-transparent tracking-tight"
            >
              InnoKshetra
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-white/90 mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed"
            >
              Our flagship innovation event where minds collide, ideas ignite,
              and startups are born. Innovation Cell NIT Kurukshetra brings together
              students, mentors, and industry leaders to turn ideas into impact.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-white/60 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed"
            >
              From hackathons and workshops to speaker sessions and networking,
              we build a culture of creativity and problem-solving. Join us to
              learn, build, and lead the next wave of innovation.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3"
            >
              {["Hackathons", "Workshops", "Speaker Sessions"].map((tag, i) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs sm:text-sm hover:bg-white/10 hover:border-yellow-500/30 transition-all duration-300 cursor-default"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* Call to action button */}
            <motion.div variants={itemVariants} className="mt-8 sm:mt-10">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(250, 204, 21, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-yellow-400 text-zinc-950 font-semibold text-sm overflow-hidden transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Events
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-yellow-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right: Four-pic folder / card stack with entrance animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative order-1 md:order-2 flex justify-center md:justify-end items-center min-h-[260px] sm:min-h-[320px] md:min-h-[380px]"
          >
            <div
              className="relative w-[220px] h-[250px] sm:w-[280px] sm:h-[340px] md:w-[320px] md:h-[380px] cursor-pointer"
              onMouseEnter={() => setStackHover(true)}
              onMouseLeave={() => setStackHover(false)}
            >
              {images.map((img, index) => (
                <div
                  key={index}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <motion.div
                    variants={{
                      rest: {
                        x: cardOffsets[index].x,
                        y: cardOffsets[index].y,
                        rotate: cardOffsets[index].rotate,
                      },
                      hover: {
                        x: cardOffsets[index].hover.x,
                        y: cardOffsets[index].hover.y,
                        rotate: cardOffsets[index].hover.rotate,
                      },
                    }}
                    initial="rest"
                    animate={stackHover ? "hover" : "rest"}
                    transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                    whileHover={{ scale: 1.02 }}
                    className="absolute w-[85%] h-[85%] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl origin-center backdrop-blur-sm"
                    style={{
                      left: "50%",
                      top: "50%",
                      x: "-50%",
                      y: "-50%",
                      pointerEvents: "none",
                      zIndex: stackHover ? index + 10 : index,
                      willChange: "transform",
                      boxShadow: stackHover
                        ? "0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(250, 204, 21, 0.2)"
                        : "0 10px 40px rgba(0,0,0,0.3)",
                    }}
                  >
                    <img
                      src={img}
                      alt={`Event ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}