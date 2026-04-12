import {
  markAttendance,
  fetchEventAttendance,
  fetchStudentEventAttendance,
  fetchStudentAttendanceStats,
  fetchMultipleStudentsAttendanceStats,
  fetchUniqueEvents, // Added to get a list of past dynamic events
  fetchMainEvents, // Get main events from events collection
  fetchAttendanceOnlyEvents, // Get attendance-only events
  deleteEvent, // Delete event and all its attendance records
} from "../models/eventAttendanceModel.js";

// POST /api/event-attendance/mark - Mark attendance (using body)
export const markStudentAttendance = async (req, res) => {
  try {
    const {
      event_name,
      event_type,
      event_date,
      student_id,
      status,
      event_source,
      years, // Array of academic years this event is for
    } = req.body;

    // Validate required fields
    if (!event_name || !event_date || !student_id) {
      return res.status(400).json({ error: "Missing required event details" });
    }

    if (!["present", "absent", "leave", null].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const markedBy = req.user?.userId || null;
    const source = event_source || "attendance_only"; // Default to attendance_only if not specified

    const { data, error } = await markAttendance(
      event_name,
      event_type,
      event_date,
      student_id,
      status,
      markedBy,
      source,
      Array.isArray(years) ? years : [] // Pass years array
    );

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Attendance marked", attendance: data });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/event-attendance/event - Get attendance for specific event via query params
export const getEventAttendance = async (req, res) => {
  try {
    const { name, date } = req.query;

    if (!name || !date) {
      return res
        .status(400)
        .json({ error: "Event name and date are required" });
    }

    const { data, error } = await fetchEventAttendance(name, date);
    if (error) return res.status(400).json({ error: error.message });

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/event-attendance/student/:studentId - Get student's event attendance
export const getStudentEventAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await fetchStudentEventAttendance(studentId);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/event-attendance/student/:studentId/stats - Get student attendance stats
export const getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await fetchStudentAttendanceStats(studentId);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/event-attendance/students/bulk-stats - Get attendance stats for multiple students
export const getBulkStudentsAttendanceStats = async (req, res) => {
  try {
    const { studentIds } = req.body;

    console.log(
      "getBulkStudentsAttendanceStats called with studentIds:",
      studentIds
    );

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: "studentIds array is required" });
    }

    const { data, error } = await fetchMultipleStudentsAttendanceStats(
      studentIds
    );
    console.log(
      "fetchMultipleStudentsAttendanceStats returned:",
      data,
      "error:",
      error
    );
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error("getBulkStudentsAttendanceStats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/event-attendance/events/list - Get all unique events created
export const getUniqueEvents = async (req, res) => {
  try {
    const { data, error } = await fetchUniqueEvents();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/event-attendance/main-events - Get main events from events collection
export const getMainEvents = async (req, res) => {
  try {
    const { data, error } = await fetchMainEvents();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/event-attendance/attendance-only-events - Get attendance-only events
export const getAttendanceOnlyEvents = async (req, res) => {
  try {
    const { data, error } = await fetchAttendanceOnlyEvents();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/event-attendance/event - Delete event and all its attendance records via query params
export const deleteEventAttendance = async (req, res) => {
  try {
    const { name, date } = req.query;

    if (!name || !date) {
      return res.status(400).json({
        error: "Event name and date are required",
      });
    }

    const { data, error } = await deleteEvent(name, date);
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Event deleted successfully", data });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
