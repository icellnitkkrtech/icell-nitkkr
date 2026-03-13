import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroPage() {
  const [isGlowing, setIsGlowing] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const quotes = [
    { text: "Where Ideas Turn Into Impact", emoji: "💡" },
    { text: "Build. Break. Innovate", emoji: "🚀" },
    { text: "Engineering The Future", emoji: "⚡" },
    { text: "Think Different. Create Bold", emoji: "🎯" },
  ];

  // Auto-rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative pt-24 min-h-screen w-full flex items-center justify-center text-white overflow-hidden">
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(250, 204, 21, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(250, 204, 21, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: 0 
          }}
          animate={{ 
            y: [null, Math.random() * -500],
            opacity: [0, 0.8, 0],
          }}
          transition={{ 
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}

      {/* Radial Gradient Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl w-full grid md:grid-cols-2 gap-16 items-center px-6 z-10">
        
        {/* LEFT SIDE - TEXT */}
        <motion.div 
          className="space-y-8"
          style={{
            x: mousePosition.x * 0.3,
            y: mousePosition.y * 0.3,
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium"
          >
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Student Innovation Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-yellow-500">
              Innovation
            </span>
            <br />
            <span className="text-white">Cell</span>
          </motion.h1>

          {/* Animated Quote with Emoji */}
          <div className="h-16 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 30, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -30, rotateX: 90 }}
                transition={{ duration: 0.6 }}
                className="absolute flex items-center gap-3"
              >
                <span className="text-4xl">{quotes[quoteIndex].emoji}</span>
                <p className="text-xl md:text-2xl text-yellow-400 font-bold">
                  {quotes[quoteIndex].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-neutral-300 text-lg max-w-lg leading-relaxed"
          >
            A student-driven community fostering innovation, creativity, 
            and technical excellence. We transform{" "}
            <span className="text-yellow-400 font-semibold">bold ideas</span>{" "}
            into real-world solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(250, 204, 21, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all"
            >
              Explore Events →
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-neutral-600 rounded-xl hover:bg-neutral-800 hover:border-yellow-500 transition-all font-semibold"
            >
              Join Us
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex gap-8 pt-4"
          >
            {[
              { label: "Projects", value: "50+" },
              { label: "Members", value: "200+" },
              { label: "Events", value: "30+" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE - LOGO */}
        <motion.div 
          className="flex justify-center relative"
          style={{
            x: mousePosition.x * -0.2,
            y: mousePosition.y * -0.2,
          }}
        >
          
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-96 h-96 border border-yellow-500/20 rounded-full"
          />
          
          {/* Inner Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-80 h-80 border border-yellow-500/30 rounded-full"
          />

          {/* Glow Background */}
          <motion.div
            animate={{
              scale: isGlowing ? [1, 1.3, 1] : [1, 1.1, 1],
              opacity: isGlowing ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-80 h-80 bg-gradient-radial from-yellow-500/40 via-yellow-500/20 to-transparent rounded-full blur-2xl"
          />

          {/* Logo */}
          <motion.img
            src="IIC_Logo.png"
            alt="Innovation Cell Logo"
            onClick={() => setIsGlowing(!isGlowing)}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              y: [0, -15, 0],
              filter: isGlowing ? "drop-shadow(0 0 30px rgba(250, 204, 21, 0.8))" : "drop-shadow(0 0 20px rgba(250, 204, 21, 0.4))"
            }}
            transition={{
              y: {
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              },
            }}
            className="relative w-72 cursor-pointer z-10"
          />

          {/* Orbiting Elements */}
          {[0, 120, 240].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              animate={{
                rotate: 360,
                x: Math.cos((angle * Math.PI) / 180) * 150,
                y: Math.sin((angle * Math.PI) / 180) * 150,
              }}
              transition={{
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              }}
              style={{
                transformOrigin: "center",
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500"
      >
        <span className="text-sm">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-neutral-600 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
        </motion.div>
      </motion.div>

    </section>
  );
}