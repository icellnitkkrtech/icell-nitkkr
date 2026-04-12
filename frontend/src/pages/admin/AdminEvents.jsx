import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit, // <-- Added the Edit icon
  X,
  Image as ImageIcon,
  Users,
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const INITIAL_FORM_DATA = {
  name: "",
  description: "",
  longDescription: "",
  date: "",
  time: "",
  location: "",
  image: "",
  category: "",
  capacity: "",
  status: "upcoming",
  format: "", // e.g., "Online", "Offline", "Hybrid"
  rounds: "",
  prizePool: "",
  registrationLink: "",
};

export default function AdminEvents() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null); // Tracks if we are editing
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const getToken = () => localStorage.getItem("accessToken");

  // Check auth
  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  // Fetch Events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Open modal for a new event
  const handleCreateNewClick = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingEventId(null);
    setShowModal(true);
  };

  // Open modal and pre-fill data for editing
  const handleEditClick = (event) => {
    setFormData({
      name: event.name || "",
      description: event.description || "",
      longDescription: event.long_description || "",
      date: event.date ? new Date(event.date).toISOString().split("T")[0] : "",
      time: event.time || "",
      location: event.location || "",
      image: event.image || "",
      category: event.category || "",
      capacity: event.capacity || "",
      status: event.status || "upcoming",
      format: event.format || "",
      rounds: event.rounds || "",
      prizePool: event.prize_pool || "",
      registrationLink: event.registration_link || "",
    });
    setEditingEventId(event._id);
    setShowModal(true);
  };

  // Handle Save (Handles BOTH Create POST and Edit PATCH)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = getToken();

      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
      };

      // Decide if we are POSTing a new event or PATCHing an existing one
      const url = editingEventId
        ? `${API}/api/events/${editingEventId}`
        : `${API}/api/events`;
      const method = editingEventId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save event");
      }

      setShowModal(false);
      setEditingEventId(null);
      setFormData(INITIAL_FORM_DATA);
      fetchEvents(); // Refresh the grid
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  // Helper: Determine if event is past or upcoming based on date
  const getEventDisplayStatus = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);
    return eventDateObj < today ? "past" : "upcoming";
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = getToken();
      const response = await fetch(`${API}/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete event");
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex h-screen bg-[#0d0d0d] text-white">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex items-center justify-center">
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto p-8 max-md:pt-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Events</h1>
            <p className="text-[#555] text-sm">
              Create and organize club events, workshops, and meets.
            </p>
          </div>
          <button
            onClick={handleCreateNewClick}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={18} /> Create Event
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-400">
            {error}
          </div>
        )}

        {/* Event Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12 border border-[#1f1f1f] rounded-xl bg-[#111111] text-[#555]">
            No events found. Create your first event!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events
              .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort descending: upcoming first
              .map((event) => (
                <div
                  key={event._id}
                  className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-purple-500/50 transition group relative flex flex-col"
                >
                  {/* Action Buttons (Show on hover) */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
                    <button
                      onClick={() => handleEditClick(event)}
                      className="p-2 bg-black/60 rounded-lg text-[#aaa] hover:text-blue-500 hover:bg-black transition"
                      title="Edit Event"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="p-2 bg-black/60 rounded-lg text-[#aaa] hover:text-red-500 hover:bg-black transition"
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Image Placeholder */}
                  <div className="h-40 bg-[#1a1a1a] border-b border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={
                          typeof event.name === "string" ? event.name : "Event"
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={40} className="text-[#333]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold truncate pr-4">
                        {typeof event.name === "string"
                          ? event.name
                          : "Corrupted Event"}
                      </h3>
                    </div>
                    <span
                      className={`self-start px-2 py-1 rounded text-xs font-semibold mb-3 capitalize ${
                        getEventDisplayStatus(event.date) === "past"
                          ? "bg-gray-500/20 text-gray-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {getEventDisplayStatus(event.date)}
                    </span>

                    <p className="text-sm text-[#888] mb-4 line-clamp-2">
                      {event.description || "No description provided."}
                    </p>

                    <div className="mt-auto space-y-2 text-sm text-[#aaa]">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-purple-400" />
                        <span>
                          {event.date
                            ? new Date(event.date).toLocaleDateString()
                            : "No date"}
                        </span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-purple-400" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-purple-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-purple-400" />
                        <span>Capacity: {event.capacity || "Unlimited"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Universal Form Modal (Create & Edit) */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingEventId ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#555] hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#888] mb-1">
                      Event Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#888] mb-1">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Date *
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Main Auditorium"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Workshop, Cultural"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for unlimited"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#888] mb-1">
                      Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Additional Details Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 mt-6">
                      Event Details
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Format (e.g., Online, Offline, Hybrid)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Online, Offline, Hybrid"
                      value={formData.format}
                      onChange={(e) =>
                        setFormData({ ...formData, format: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Number of Rounds
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3, 2, Single"
                      value={formData.rounds}
                      onChange={(e) =>
                        setFormData({ ...formData, rounds: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-1">
                      Prize Pool
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹1,00,000"
                      value={formData.prizePool}
                      onChange={(e) =>
                        setFormData({ ...formData, prizePool: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#888] mb-1">
                      Registration Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://forms.google.com/..."
                      value={formData.registrationLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationLink: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#888] mb-1">
                      Detailed Description (for modal view)
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Detailed description shown when users click 'Learn More'"
                      value={formData.longDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longDescription: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 mt-4 border-t border-[#1f1f1f]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-lg border border-[#333] hover:bg-[#1a1a1a] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition flex items-center justify-center gap-2"
                  >
                    {saving
                      ? "Saving..."
                      : editingEventId
                      ? "Update Event"
                      : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
