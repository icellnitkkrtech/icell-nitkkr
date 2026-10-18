import {
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const links = [
    { text: "Home", href: "/" },
    { text: "Events", href: "/events" },
    { text: "Gallery", href: "/gallery" },
    { text: "Newsletter", href: "/newsletter" },
    { text: "Team", href: "/team" },
  ];

  const socials = [
    { icon: Linkedin, link: "https://www.linkedin.com/company/icell-nitkkr/" },
    {
      icon: Instagram,
      link: "https://www.instagram.com/innovationcell_nitkkr",
    },
    { icon: Mail, link: "mailto:inno_incub@nitkkr.ac.in" },
  ];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <footer className="relative mt-12 w-full flex justify-center px-4 sm:px-6 pb-8 sm:pb-10">
      {/* Outer Glass Container */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, margin: "-100px" }}
        className="w-full max-w-8xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-12"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {/* About */}
          <motion.div variants={itemVariants}>
            <h2 className="text-white text-lg font-semibold mb-4">
              Innovation Cell
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Official technical society of NIT Kurukshetra fostering
              creativity, innovation and entrepreneurship through student-driven
              initiatives.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {links.map((item) => (
                <li key={item.text}>
                  <a
                    href={item.href}
                    className="text-white/60 hover:text-white transition-all duration-300"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-medium mb-4">Connect</h3>
            <div className="flex gap-3">
              {socials.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={index}
                    href={item.link}
                    target="_blank"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-full bg-white/5 border border-white/10
                               text-white/60 hover:text-white hover:bg-white/10
                               transition-all duration-300"
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-medium mb-4">Contact</h3>
            <div className="flex items-start gap-3 text-white/60 text-sm">
              <MapPin size={18} className="mt-1" />
              <span>NIT Kurukshetra, Haryana, India - 136119</span>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-10 md:mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-white/40 gap-4 sm:gap-6"
        >
          <p className="text-center sm:text-left">
            © 2026 Innovation Cell, NIT Kurukshetra.
          </p>

          <div className="flex gap-4 sm:gap-6">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
