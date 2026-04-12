import {
  Home,
  FileText,
  CalendarDays,
  Users,
  LogIn,
  UserPlus,
  User,
  LayoutDashboard,
  Menu,
  X,
  Newspaper,
  Code,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set user role from auth context
  useEffect(() => {
    if (user) {
      setUserRole(user.role || "member");
    }
    setLoading(false);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUserRole(null);
    navigate("/");
    window.location.reload();
  };

  const tabs = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Blogs", icon: FileText, path: "/blogs" },
    { name: "Events", icon: CalendarDays, path: "/events" },
    { name: "Newsletter", icon: Newspaper, path: "/newsletter" },
    { name: "Team", icon: Users, path: "/team" },
    { name: "Developers", icon: Code, path: "/developer" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* DESKTOP NAVBAR (hidden on mobile) */}
      <div className="hidden sm:flex w-full justify-between items-center px-4 sm:px-6 md:px-8">
        {/* LEFT SPACER */}
        <div className="flex-1"></div>

        {/* MAIN NAVBAR */}
        <div className="flex items-center gap-4 md:gap-6 px-3 md:px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-lg">
          {/* TABS */}
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              return (
                <button
                  key={tab.name}
                  onClick={() => navigate(tab.path)}
                  className={`flex cursor-pointer items-center gap-2 md:gap-3 px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 
                    ${
                      active
                        ? "bg-white/10 text-white shadow-inner"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon size={14} className="md:w-4" />
                  <span className="hidden md:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-3 md:gap-4 ml-4 md:ml-6">
          <div className="flex items-center gap-2 px-2 sm:px-3 md:px-4 py-2">
            {user && !loading ? (
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="flex cursor-pointer items-center gap-2 p-2 md:p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 border border-white/10"
                >
                  <User size={18} className="md:w-5" />
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-3 w-40 md:w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-2 bg-white/5 text-xs text-white/60 border-b border-white/10">
                      Role:{" "}
                      <span className="text-white font-medium capitalize">
                        {userRole || "user"}
                      </span>
                    </div>

                    {userRole === "admin" || userRole === "post_holder" ? (
                      <>
                        <button
                          onClick={() => {
                            navigate("/admin/dashboard");
                            setOpenMenu(false);
                          }}
                          className="w-full cursor-pointer text-left px-4 py-3 text-xs md:text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </button>
                        <div className="border-t border-white/10"></div>
                      </>
                    ) : userRole === "member" ? (
                      <>
                        <button
                          onClick={() => {
                            navigate("/member-profile");
                            setOpenMenu(false);
                          }}
                          className="w-full cursor-pointer text-left px-4 py-3 text-xs md:text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2"
                        >
                          <User size={16} />
                          Member Profile
                        </button>
                        <div className="border-t border-white/10"></div>
                      </>
                    ) : userRole === "student" ? (
                      <>
                        <button
                          onClick={() => {
                            navigate("/student-profile");
                            setOpenMenu(false);
                          }}
                          className="w-full cursor-pointer text-left px-4 py-3 text-xs md:text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2"
                        >
                          <User size={16} />
                          Student Profile
                        </button>
                        <div className="border-t border-white/10"></div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setOpenMenu(false);
                          }}
                          className="w-full cursor-pointer text-left px-4 py-3 text-xs md:text-sm text-white/80 hover:bg-white/10 transition flex items-center gap-2"
                        >
                          <User size={16} />
                          My Profile
                        </button>
                        <div className="border-t border-white/10"></div>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full cursor-pointer text-left px-4 py-3 text-xs md:text-sm text-red-400 hover:bg-white/10 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : !loading ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="flex cursor-pointer items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 text-xs md:text-sm font-medium"
                >
                  <LogIn size={14} className="md:w-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>
                <button
                  onClick={() => navigate("/register_new")}
                  className="flex cursor-pointer items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 border border-white/10 text-xs md:text-sm font-medium"
                >
                  <UserPlus size={14} className="md:w-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* RIGHT SPACER */}
        <div className="flex-1"></div>
      </div>

      {/* MOBILE NAVBAR (hidden on desktop) */}
      <div className="sm:hidden flex w-full justify-between items-center px-3 py-3 bg-black/40 backdrop-blur-sm border-b border-white/5">
        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* MOBILE USER MENU */}
        <div>
          {user && !loading ? (
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <User size={20} />
            </button>
          ) : !loading ? (
            <button
              onClick={() => navigate("/login")}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <LogIn size={20} />
            </button>
          ) : null}
        </div>

        {/* USER DROPDOWN FOR MOBILE */}
        {openMenu && (
          <div className="absolute right-0 top-16 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg overflow-hidden z-50 mt-1">
            <div className="px-4 py-2 bg-white/5 text-xs text-white/60 border-b border-white/10">
              Role:{" "}
              <span className="text-white font-medium capitalize">
                {userRole || "user"}
              </span>
            </div>

            {userRole === "admin" || userRole === "post_holder" ? (
              <>
                <button
                  onClick={() => {
                    navigate("/admin/dashboard");
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
                >
                  <LayoutDashboard size={16} />
                  Admin Dashboard
                </button>
              </>
            ) : userRole === "member" ? (
              <>
                <button
                  onClick={() => {
                    navigate("/member-profile");
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
                >
                  <User size={16} />
                  Member Profile
                </button>
              </>
            ) : userRole === "student" ? (
              <>
                <button
                  onClick={() => {
                    navigate("/student-profile");
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
                >
                  <User size={16} />
                  Student Profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
                >
                  <User size={16} />
                  My Profile
                </button>
              </>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/10"
              >
                Logout
              </button>
            )}

            {!user && !loading && (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
                >
                  <LogIn size={16} />
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate("/register_new");
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Sign Up
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* MOBILE MENU EXPANDED */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-14 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40">
          <nav className="flex flex-col p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              return (
                <button
                  key={tab.name}
                  onClick={() => {
                    navigate(tab.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
