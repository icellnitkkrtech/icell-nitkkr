import { Twitter, Github, Instagram, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const links = ["Home", "Post", "Events", "Team"];

  const socials = [
    { icon: Twitter, link: "#" },
    { icon: Github, link: "#" },
    { icon: Instagram, link: "#" },
    { icon: Mail, link: "#" },
  ];

  return (
    <footer className="relative mt-32 w-full flex justify-center px-6 pb-10">
      
      {/* Outer Glass Container */}
      <div className="w-full max-w-8xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl p-12">

        <div className="grid md:grid-cols-4 gap-12">

          {/* About */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">
              Innovation Cell
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Official technical society of NIT Kurukshetra fostering 
              creativity, innovation and entrepreneurship through 
              student-driven initiatives.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {links.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/60 hover:text-white transition-all duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-medium mb-4">Connect</h3>
            <div className="flex gap-3">
              {socials.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.link}
                    className="p-3 rounded-full bg-white/5 border border-white/10 
                               text-white/60 hover:text-white hover:bg-white/10 
                               transition-all duration-300"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-medium mb-4">Contact</h3>
            <div className="flex items-start gap-3 text-white/60 text-sm">
              <MapPin size={18} className="mt-1" />
              <span>
                NIT Kurukshetra, Haryana, India - 136119
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
          <p>© 2026 Innovation Cell, NIT Kurukshetra.</p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
