import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import EventsPage from "./pages/EventsPage";
import NewsletterPage from "./pages/NewsletterPage";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoutes";
import BlogsPage from "./pages/BlogsPage";
import WriteBlogPage from "./pages/WriteBlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminNewsletters from "./pages/admin/AdminNewsletters";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
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

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/blogs" element={<AdminBlogs />} />
            <Route path="/admin/newsletters" element={<AdminNewsletters />} />
            <Route path="/admin/teams" element={<AdminTeams />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/gallery" element={<AdminGallery />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
