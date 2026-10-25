import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Check,
  X,
  Save,
  Search,
  Plus,
  Calendar,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminAttendance() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // App State
  const [students, setStudents] = useState([]);
  const [mainEvents, setMainEvents] = useState([]);
  const [attendanceOnlyEvents, setAttendanceOnlyEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Active View State
  // 'list' = show all past events, 'select' = choose between main/attendance-only, 'create' = new attendance-only, 'edit' = mark attendance
  const [viewState, setViewState] = useState("list");
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("meet");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [eventSource, setEventSource] = useState("attendance_only"); // Track where event came from
  const [eventYears, setEventYears] = useState([]); // Years selected for the event ["1st", "2nd", etc.]
  const [attendance, setAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // Filter by role: "all", "student", "member"

  // On-screen Modals & Notifications
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, confirmText, onConfirm }
  const [alertDialog, setAlertDialog] = useState(null); // { title, message, type: "error"|"warning"|"success" }
  const [toast, setToast] = useState(null); // { type: "success"|"error", message: string }

  const showAlert = (title, message, type = "error") => {
    setAlertDialog({ title, message, type });
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Handle Escape key to close active dialogs
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (confirmDialog && !deleting) setConfirmDialog(null);
        if (alertDialog) setAlertDialog(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDialog, alertDialog, deleting]);

  // Academic years available (stored as strings in database: "1st", "2nd", "3rd", "4th")
  const AVAILABLE_YEARS = ["1", "2", "3", "4"];

  const getToken = () => localStorage.getItem("accessToken");

  // Check authorization
  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Initial Data Load (Parallelized for optimal performance & fault tolerance)
  const fetchInitialData = async () => {
    try {
      setEventsLoading(true);
      setStudentsLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch all required resources concurrently via Promise.allSettled
      const [eventsRes, mainEventsRes, attendanceOnlyRes, studentsRes] =
        await Promise.allSettled([
          fetch(`${API}/api/event-attendance/events/list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/event-attendance/main-events`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/event-attendance/attendance-only-events`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      // 1. Process Past Events (The primary data for the default "list" view)
      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        const allEventsData = await eventsRes.value.json();
        const sortedEvents = (
          Array.isArray(allEventsData) ? allEventsData : []
        ).sort(
          (a, b) =>
            new Date(b.createdAt || b.created_at) -
            new Date(a.createdAt || a.created_at)
        );
        setPastEvents(sortedEvents);
      } else {
        console.warn("Could not fetch events list:", eventsRes);
        if (eventsRes.status === "fulfilled" && eventsRes.value.status === 401) {
          navigate("/login");
          return;
        }
      }

      // 2. Process Main Events
      if (mainEventsRes.status === "fulfilled" && mainEventsRes.value.ok) {
        const mainEventsData = await mainEventsRes.value.json();
        setMainEvents(Array.isArray(mainEventsData) ? mainEventsData : []);
      }

      // 3. Process Attendance-only Events
      if (
        attendanceOnlyRes.status === "fulfilled" &&
        attendanceOnlyRes.value.ok
      ) {
        const attendanceOnlyData = await attendanceOnlyRes.value.json();
        setAttendanceOnlyEvents(
          Array.isArray(attendanceOnlyData) ? attendanceOnlyData : []
        );
      }

      // 4. Process Students List
      if (studentsRes.status === "fulfilled" && studentsRes.value.ok) {
        const studentData = await studentsRes.value.json();
        setStudents(Array.isArray(studentData) ? studentData : []);
      } else {
        console.warn("Could not fetch students list:", studentsRes);
      }
    } catch (err) {
      console.error("fetchInitialData error:", err);
      setError("Failed to load attendance events. Please try again.");
    } finally {
      setEventsLoading(false);
      setStudentsLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch specific event attendance when editing
  const loadEventAttendance = async (
    name,
    date,
    type,
    source = "attendance_only"
  ) => {
    try {
      setLoading(true);
      setEventName(name);
      setEventDate(date);
      setEventType(type);
      setEventSource(source);
      setEventYears([]);
      setViewState("edit");
      setSearchTerm("");

      const token = getToken();

      const fetchAttendance = fetch(
        `${API}/api/event-attendance/event?name=${encodeURIComponent(
          name
        )}&date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If students haven't completed loading yet, fetch them concurrently
      const fetchStudents =
        students.length === 0
          ? fetch(`${API}/api/students`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null);

      const [res, studentRes] = await Promise.all([
        fetchAttendance,
        fetchStudents,
      ]);

      if (res.ok) {
        const data = await res.json();
        const attendanceMap = {};
        data?.forEach((record) => {
          attendanceMap[record.student_id] = record.status;
        });
        setAttendance(attendanceMap);
      }

      if (studentRes && studentRes.ok) {
        const studentData = await studentRes.json();
        setStudents(Array.isArray(studentData) ? studentData : []);
      }
    } catch (err) {
      console.error("Failed to load existing attendance", err);
      showAlert(
        "Error Loading Event",
        "Failed to load attendance records for this event.",
        "error"
      );
    } finally {
      setLoading(false);
      setStudentsLoading(false);
    }
  };

  // Delete an entire event with custom confirmation dialog
  const handleDeleteEvent = (name, date, e) => {
    e.stopPropagation(); // Prevent triggering the row click

    setConfirmDialog({
      title: "Delete Attendance Event",
      message: `Are you sure you want to delete "${name}" (${new Date(
        date
      ).toLocaleDateString()})? This will permanently remove all student attendance records for this event.`,
      confirmText: "Delete Event",
      onConfirm: async () => {
        try {
          setDeleting(true);
          const token = getToken();
          const res = await fetch(
            `${API}/api/event-attendance/event?name=${encodeURIComponent(
              name
            )}&date=${date}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) throw new Error("Failed to delete event");

          // Refresh the list
          await fetchInitialData();
          setConfirmDialog(null);
          showToast("success", `Event "${name}" deleted successfully!`);
        } catch (err) {
          console.error(err);
          setConfirmDialog(null);
          showAlert(
            "Delete Failed",
            `Could not delete event: ${err.message}`,
            "error"
          );
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handleCreateNew = () => {
    // Go to selection view where user can choose between main or attendance-only
    // Clear ALL fields for fresh start
    setEventName("");
    setEventType("meet");
    setEventDate(new Date().toISOString().split("T")[0]);
    setEventSource("attendance_only");
    setEventYears([]);
    setAttendance({});
    setSearchTerm("");
    setViewState("select");
  };

  const handleSelectMainEvent = (event) => {
    // User selected a main event from the events collection
    setEventName(event.name);
    setEventType(event.category || "meet");
    setEventDate(
      event.date
        ? new Date(event.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setEventSource("main");
    setEventYears([]);
    setAttendance({});
    setSearchTerm("");
    setViewState("edit");
  };

  const handleCreateAttendanceOnly = () => {
    // User chose to create a new attendance-only event
    // Initialize empty fields for new event creation (called from "list" view)
    setEventName("");
    setEventType("meet");
    setEventDate(new Date().toISOString().split("T")[0]);
    setEventSource("attendance_only");
    setEventYears([]);
    setAttendance({});
    setSearchTerm("");
    setViewState("create");
  };

  const handleProceedToMarkAttendance = () => {
    // User filled form in "select" view and clicked "Create & Mark Attendance"
    // Preserve the filled values and transition to attendance marking view
    if (!eventName.trim()) {
      showAlert(
        "Event Name Required",
        "Please provide an Event Name before proceeding to mark attendance.",
        "warning"
      );
      return;
    }
    setAttendance({}); // Clear attendance data for the new event
    setViewState("create");
  };

  const handleBackToList = () => {
    setViewState("list");
    fetchInitialData(); // Refresh the list in case we just saved a new event
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = { ...attendance };
    filteredStudents.forEach((student) => {
      newAttendance[student._id || student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    if (!eventName.trim()) {
      showAlert(
        "Event Name Required",
        "Please provide an Event Name before saving attendance.",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);
      const token = getToken();

      const savePromises = Object.entries(attendance).map(
        ([studentId, status]) => {
          return fetch(`${API}/api/event-attendance/mark`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              event_name: eventName,
              event_type: eventType,
              event_date: eventDate,
              student_id: studentId,
              status,
              event_source: eventSource, // Pass the event source
            }),
          }).then((res) => {
            if (!res.ok)
              throw new Error(`Failed to save for student ${studentId}`);
            return res.json();
          });
        }
      );

      await Promise.all(savePromises);
      showToast("success", `Attendance for "${eventName}" saved successfully!`);
      if (viewState === "create") {
        setViewState("edit"); // Switch to edit mode so they don't create duplicates
      }
    } catch (err) {
      console.error(err);
      showAlert(
        "Save Failed",
        `Could not save attendance: ${err.message}`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    // Filter by search term
    const matchesSearch = `${student.name} ${student.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filter by role
    let matchesRole = true;
    if (roleFilter === "student") {
      matchesRole = student.role === "student";
    } else if (roleFilter === "member") {
      matchesRole = student.role === "member";
    }
    // else roleFilter === "all" means both are included

    // Filter by event years - only show if years are selected AND student's year matches
    let matchesYear = true;
    if (eventYears.length > 0) {
      matchesYear = eventYears.includes(student.year);
    }

    return matchesSearch && matchesRole && matchesYear;
  });

  const stats = {
    total: filteredStudents.length,
    present: filteredStudents.filter(
      (s) => attendance[s._id || s.id] === "present"
    ).length,
    absent: filteredStudents.filter(
      (s) => attendance[s._id || s.id] === "absent"
    ).length,
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto p-8 max-md:pt-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Event Attendance</h1>
            <p className="text-[#555] text-sm">
              Manage events and track student participation.
            </p>
          </div>
          {viewState === "list" ? (
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-medium transition"
            >
              <Plus size={18} /> New Event
            </button>
          ) : (
            <button
              onClick={handleBackToList}
              className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#2f2f2f] text-white rounded-lg flex items-center gap-2 font-medium transition"
            >
              <ArrowLeft size={18} /> Back to Events
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchInitialData}
              className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-white rounded text-xs font-semibold transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* VIEW 1: PAST EVENTS LIST */}
        {viewState === "list" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#ddd]">
                All Events (by Recent First)
              </h2>
              {eventsLoading && (
                <span className="flex items-center gap-1.5 text-xs text-purple-400">
                  <Loader2 size={13} className="animate-spin" />
                  Loading events...
                </span>
              )}
            </div>

            {eventsLoading ? (
              /* SKELETON CARDS GRID while loading */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((sk) => (
                  <div
                    key={sk}
                    className="p-5 rounded-xl border border-[#1f1f1f] bg-[#111111] animate-pulse space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-3/4 h-5 bg-[#202020] rounded-md"></div>
                      <div className="w-5 h-5 bg-[#202020] rounded-md"></div>
                    </div>
                    <div className="w-1/3 h-3.5 bg-[#181818] rounded"></div>
                    <div className="pt-2 flex gap-3">
                      <div className="w-24 h-4 bg-[#1c1c1c] rounded"></div>
                      <div className="w-14 h-4 bg-[#1c1c1c] rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pastEvents.length === 0 ? (
              <div className="p-8 rounded-xl border border-[#1f1f1f] bg-[#111111] text-center">
                <Calendar size={32} className="mx-auto mb-3 text-[#444]" />
                <p className="text-white font-medium text-sm mb-1">
                  No attendance events found
                </p>
                <p className="text-xs text-[#666] mb-4">
                  Start tracking student participation by creating your first attendance event.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Plus size={14} /> Create First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map((ev, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      loadEventAttendance(ev.name, ev.date, ev.type, ev.source)
                    }
                    className="p-5 rounded-xl border border-[#1f1f1f] bg-[#111111] hover:border-purple-500/50 cursor-pointer transition group relative hover:bg-[#141414]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white truncate pr-6">
                          {ev.name}
                        </h3>
                        <p className="text-xs text-[#666] mt-1">
                          {ev.source === "main"
                            ? "📌 Main Event"
                            : "📝 Attendance-Only"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteEvent(ev.name, ev.date, e)}
                        disabled={deleting}
                        className="absolute top-4 right-4 text-[#555] hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-950/20"
                        title="Delete Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex gap-3 text-xs text-[#888]">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />{" "}
                        {new Date(ev.date).toLocaleDateString()}
                      </span>
                      <span className="capitalize px-2 py-0.5 bg-[#1f1f1f] rounded text-[#aaa]">
                        {ev.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SELECT EVENT TYPE */}
        {viewState === "select" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              How would you like to mark attendance?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Select from Main Events */}
              <div className="rounded-2xl border-2 border-[#1f1f1f] bg-[#111111] p-8 hover:border-purple-500 transition">
                <h3 className="text-xl font-bold text-white mb-4">
                  📌 From Main Events
                </h3>
                <p className="text-[#888] text-sm mb-6">
                  Select from events created in the Events section. Recently
                  created first.
                </p>

                {eventsLoading ? (
                  <div className="space-y-2.5 mb-6">
                    <div className="h-14 rounded-lg bg-[#181818] border border-[#222] animate-pulse" />
                    <div className="h-14 rounded-lg bg-[#181818] border border-[#222] animate-pulse" />
                  </div>
                ) : mainEvents.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#0d0d0d] border border-[#2f2f2f] text-[#666] text-sm text-center mb-4">
                    No main events created yet. Create events in the Events
                    section first.
                  </div>
                ) : (
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {mainEvents.map((event) => (
                      <button
                        key={event._id}
                        onClick={() => handleSelectMainEvent(event)}
                        className="w-full p-4 rounded-lg bg-[#0d0d0d] border border-[#2f2f2f] hover:border-purple-500 hover:bg-[#1a1a1a] transition text-left"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white">
                              {event.name}
                            </p>
                            <p className="text-xs text-[#666] mt-1">
                              {event.date
                                ? new Date(event.date).toLocaleDateString()
                                : "No date"}
                            </p>
                          </div>
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded capitalize">
                            {event.category || "event"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {mainEvents.length > 0 && (
                  <button
                    onClick={() => setViewState("list")}
                    className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
                  >
                    Select from Events
                  </button>
                )}
              </div>

              {/* Option 2: Create Attendance-Only Event */}
              <div className="rounded-2xl border-2 border-[#1f1f1f] bg-[#111111] p-8 hover:border-blue-500 transition">
                <h3 className="text-xl font-bold text-white mb-4">
                  📝 New Attendance-Only Event
                </h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm text-[#888] mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Spring Fest Prep"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#2f2f2f] text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-2">
                      Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#2f2f2f] text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="meet">Regular Meet</option>
                      <option value="internal">Internal Event</option>
                      <option value="external">External Event</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#888] mb-2">
                      Event Date
                    </label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555]"
                      />
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0d0d0d] border border-[#2f2f2f] text-white focus:border-blue-500 focus:outline-none"
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToMarkAttendance}
                  disabled={!eventName.trim()}
                  className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
                >
                  Create & Mark Attendance
                </button>
              </div>
            </div>

            <button
              onClick={() => setViewState("list")}
              className="mt-6 px-4 py-2 text-[#888] hover:text-white transition"
            >
              ← Back to Events List
            </button>
          </div>
        )}

        {/* VIEW 3: CREATE OR EDIT ATTENDANCE */}
        {(viewState === "create" || viewState === "edit") && (
          <>
            {/* Event Details Form */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-purple-400">
                {viewState === "create"
                  ? "New Attendance-Only Event"
                  : `Editing Event${
                      eventSource === "main"
                        ? " (Main Event)"
                        : eventSource === "attendance_only"
                        ? " (Attendance-Only)"
                        : ""
                    }`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-[#888] mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Spring Fest Prep"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    disabled={viewState === "edit"}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] focus:border-purple-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#888] mb-2">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] focus:border-purple-500 focus:outline-none"
                  >
                    <option value="meet">Regular Meet</option>
                    <option value="internal">Internal Event</option>
                    <option value="external">External Event</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#888] mb-2">Date</label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555]"
                    />
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      disabled={viewState === "edit"}
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] focus:border-purple-500 focus:outline-none disabled:opacity-50"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Tools */}
            <div className="mb-6 flex flex-col gap-4">
              {/* Row 1: Search and Role Filter */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555]"
                  />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111111] border border-[#1f1f1f] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Role Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setRoleFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      roleFilter === "all"
                        ? "bg-purple-600 text-white border border-purple-500"
                        : "bg-[#1f1f1f] text-[#aaa] border border-[#2f2f2f] hover:bg-[#2f2f2f]"
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => setRoleFilter("student")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      roleFilter === "student"
                        ? "bg-blue-600 text-white border border-blue-500"
                        : "bg-[#1f1f1f] text-[#aaa] border border-[#2f2f2f] hover:bg-[#2f2f2f]"
                    }`}
                  >
                    Students Only
                  </button>
                  <button
                    onClick={() => setRoleFilter("member")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      roleFilter === "member"
                        ? "bg-cyan-600 text-white border border-cyan-500"
                        : "bg-[#1f1f1f] text-[#aaa] border border-[#2f2f2f] hover:bg-[#2f2f2f]"
                    }`}
                  >
                    Members Only
                  </button>
                </div>

                {/* Year Filter Checkboxes */}
                <div className="flex gap-2 flex-wrap">
                  {AVAILABLE_YEARS.map((year) => (
                    <label
                      key={year}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={eventYears.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEventYears([...eventYears, year]);
                          } else {
                            setEventYears(eventYears.filter((y) => y !== year));
                          }
                        }}
                        className="w-4 h-4 rounded border-[#2f2f2f] cursor-pointer"
                      />
                      <span className="text-sm text-[#aaa] hover:text-white transition">
                        {year} Year
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 2: Mark All and Clear Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkAll("present")}
                  className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition text-sm font-medium"
                >
                  All Present
                </button>
                <button
                  onClick={() => handleMarkAll("absent")}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition text-sm font-medium"
                >
                  All Absent
                </button>
                <button
                  onClick={() => setAttendance({})}
                  className="px-4 py-2 rounded-lg bg-[#1f1f1f] text-[#aaa] hover:bg-[#2f2f2f] transition text-sm font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-[#111111] border border-[#1f1f1f] text-center">
                <p className="text-xs text-[#555] mb-1">Total</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <p className="text-xs text-green-400 mb-1">Present</p>
                <p className="text-xl font-bold text-green-400">
                  {stats.present}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                <p className="text-xs text-red-400 mb-1">Absent</p>
                <p className="text-xl font-bold text-red-400">{stats.absent}</p>
              </div>
            </div>

            {/* Students Table */}
            <div className="rounded-lg border border-[#1f1f1f] overflow-hidden mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#111111] border-b border-[#1f1f1f]">
                    <th className="px-6 py-3 text-left text-sm text-[#888]">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-[#888]">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-[#888]">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentsLoading || loading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-12 text-center text-[#666]"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2
                            size={24}
                            className="animate-spin text-purple-400"
                          />
                          <span className="text-sm">
                            Loading students & attendance...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-[#666]"
                      >
                        No students found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const studentId = student._id || student.id;
                      return (
                        <tr
                          key={studentId}
                          className="border-b border-[#1f1f1f] hover:bg-[#1a1a1a] transition"
                        >
                          <td className="px-6 py-4 text-sm text-white">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#666]">
                            {student.branch}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleAttendanceChange(studentId, "present")
                                }
                                className={`p-2 rounded ${
                                  attendance[studentId] === "present"
                                    ? "bg-green-500 text-white"
                                    : "bg-[#1f1f1f] text-[#666] hover:bg-[#2f2f2f]"
                                }`}
                                title="Mark Present"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleAttendanceChange(studentId, "absent")
                                }
                                className={`p-2 rounded ${
                                  attendance[studentId] === "absent"
                                    ? "bg-red-500 text-white"
                                    : "bg-[#1f1f1f] text-[#666] hover:bg-[#2f2f2f]"
                                }`}
                                title="Mark Absent"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center gap-2 font-medium"
            >
              <Save size={18} /> {saving ? "Saving..." : "Save Attendance"}
            </button>
          </>
        )}
      </div>

      {/* ── ON-SCREEN CONFIRMATION MODAL ───────────────────────── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <Trash2 size={24} />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-bold text-white mb-1.5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {confirmDialog.title}
                </h3>
                <p className="text-sm text-[#888] leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#1f1f1f]">
              <button
                onClick={() => !deleting && setConfirmDialog(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#aaa] hover:text-white hover:bg-[#1a1a1a] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                {deleting
                  ? "Deleting..."
                  : confirmDialog.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ON-SCREEN ALERT MODAL ──────────────────────────────── */}
      {alertDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-xl border shrink-0 ${
                  alertDialog.type === "success"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : alertDialog.type === "warning"
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {alertDialog.type === "success" ? (
                  <CheckCircle2 size={24} />
                ) : alertDialog.type === "warning" ? (
                  <AlertTriangle size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-bold text-white mb-1.5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {alertDialog.title}
                </h3>
                <p className="text-sm text-[#888] leading-relaxed">
                  {alertDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end mt-6 pt-4 border-t border-[#1f1f1f]">
              <button
                onClick={() => setAlertDialog(null)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition ${
                  alertDialog.type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : alertDialog.type === "warning"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                OK, got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING TOAST NOTIFICATION ────────────────────────── */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl"
          style={{
            background: toast.type === "success" ? "#0f2a1f" : "#2a1212",
            borderColor: toast.type === "success" ? "#10b98150" : "#ef444450",
            color: toast.type === "success" ? "#6ee7b7" : "#fca5a5",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-rose-400" />
          )}
          <span className="flex-1 font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-white/10 transition"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
