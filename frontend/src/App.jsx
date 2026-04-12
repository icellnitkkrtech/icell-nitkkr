import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import EventsPage from "./pages/EventsPage";
import NewsletterPage from "./pages/NewsletterPage";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import BlogsPage from "./pages/BlogsPage";
import WriteBlogPage from "./pages/WriteBlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminNewsletters from "./pages/admin/AdminNewsletters";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminCertificates from "./pages/admin/AdminCertificates";
import Login from "./pages/auth/login";
import RegisterNew from "./pages/auth/register_new";
import ForgotPassword from "./pages/auth/forgot_password";
import ProfilePage from "./pages/ProfilePage";
import MemberProfile from "./pages/Profile/MemberProfile";
import StudentProfile from "./pages/Profile/StudentProfile";
import TeamSection from "./components/layout/TeamSection";
import { AuthProvider } from "./context/AuthContext";
import AdminProfile from "./pages/admin/AdminProfile";
import NewsletterSection from "./components/layout/NewsletterSection";
import DeveloperPage from "./pages/DeveloperPage";

import Loader from "./components/Loader";
import { useEffect, useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadApp = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 4500));
      } finally {
        setLoading(false);
      }
    };

    loadApp();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        {" "}
        <Routes>
          {/* Public Home Page */}
          <Route
            path="/"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <Home />
              </div>
            }
          />

          {/* Blogs List Page */}
          <Route
            path="/blogs"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <BlogsPage />
              </div>
            }
          />

          {/* Write Blog Page */}
          <Route
            path="/write-blog"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <WriteBlogPage />
              </div>
            }
          />

          {/* Blog Detail Page */}
          <Route
            path="/blog/:id"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <BlogDetailPage />
              </div>
            }
          />

          {/* Events page */}
          <Route
            path="/events"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <EventsPage />
              </div>
            }
          />

          {/* Newsletter Page */}
          <Route
            path="/newsletter"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <NewsletterPage />
              </div>
            }
          />

          {/* Team Page */}
          <Route
            path="/team"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <TeamSection />
              </div>
            }
          />

          {/* Developer Page */}
          <Route
            path="/developer"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <DeveloperPage />
              </div>
            }
          />

          {/* Profile Page */}
          <Route
            path="/profile"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <ProfilePage />
              </div>
            }
          />

          {/* Student Profile */}
          <Route
            path="/student-profile"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <StudentProfile />
              </div>
            }
          />

          {/* Member Profile */}
          <Route
            path="/member-profile"
            element={
              <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
                <div className="fixed top-6 w-full z-50 flex justify-center">
                  <Navbar />
                </div>

                <MemberProfile />
              </div>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterNew />} />
          <Route path="/register_new" element={<RegisterNew />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/blogs" element={<AdminBlogs />} />
          <Route path="/admin/newsletters" element={<AdminNewsletters />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
