import { Home, FileText, CalendarDays, Users, PenTool, Twitter, Github, Instagram, Mail } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("Home");

  const tabs = [
  { name: "Home", icon: Home },
  { name: "Post", icon: FileText },        
  { name: "Events", icon: CalendarDays },  
  { name: "Team", icon: Users },           
];

  const socials = [
    { icon: Twitter, link: "#" },
    { icon: Github, link: "#" },
    { icon: Instagram, link: "#" },
    { icon: Mail, link: "#" },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center gap-6 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-lg">

        {/* LEFT TABS */}
        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => setActive(tab.name)}
                className={`flex cursor-pointer items-center gap-3 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${
                    isActive
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon size={16} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* RIGHT SOCIAL ICONS */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          {socials.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.link}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <Icon size={16} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
