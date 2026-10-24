import * as eventModel from "../models/eventModel.js";
import * as attendanceModel from "../models/eventAttendanceModel.js";
import { getDB } from "../config/mongodb.js";

// ── Public ────────────────────────────────────────────────────────────────────

// GET /api/events — list all events
export async function listEvents(req, res) {
  try {
    const events = await eventModel.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error("List events error:", error);
    res.status(500).json({ error: "Failed to get events" });
  }
}

// GET /api/events/:id — get single event
export async function getEvent(req, res) {
  try {
    const event = await eventModel.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ error: "Failed to get event" });
  }
}

// GET /api/events/upcoming — get upcoming events
export async function getUpcomingEvents(req, res) {
  try {
    const events = await eventModel.getUpcomingEvents();
    res.json(events);
  } catch (error) {
    console.error("Get upcoming events error:", error);
    res.status(500).json({ error: "Failed to get upcoming events" });
  }
}

// ── Admin – Events CRUD ───────────────────────────────────────────────────────

// POST /api/events — create new event (admin)
export async function createEvent(req, res) {
  try {
    const {
      name,
      description,
      date,
      time,
      location,
      image,
      category,
      capacity,
      status,
      years, // Array of academic years selected by admin
      format, // "Online", "Offline", "Hybrid"
      rounds, // Number of rounds
      prizePool, // Prize pool string
      registrationLink, // Registration URL
      longDescription, // Detailed description
    } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: "Name and date are required" });
    }

    // Create event with all new fields
    const event = await eventModel.createEvent(
      name,
      description || "",
      date,
      time || "",
      location || "",
      image || "",
      category || "",
      capacity ? parseInt(capacity) : 0,
      req.user?.userId, // Admin ID
      Array.isArray(years) ? years : [],
      format || "",
      rounds || "",
      prizePool || "",
      registrationLink || "",
      longDescription || ""
    );

    res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
}
// PATCH /api/events/:id — update event (admin)
export async function updateEvent(req, res) {
  try {
    // console.log("  UPDATE EVENT REQUEST:");
    // console.log("  Event ID:", req.params.id);
    // console.log("  Fields received:", Object.keys(req.body));
    // console.log("  Registration Link:", req.body.registrationLink);
    // console.log("  Prize Pool:", req.body.prizePool);
    // console.log("  Long Description:", req.body.longDescription);

    const updated = await eventModel.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }
    // Return the updated event
    const event = await eventModel.getEventById(req.params.id);

    // console.log("  EVENT UPDATED");
    // console.log("  Stored registration_link:", event.registration_link);
    // console.log("  Stored prize_pool:", event.prize_pool);
    // console.log("  Stored long_description:", event.long_description);

    res.json(event);
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
}

// DELETE /api/events/:id — delete event (admin)
export async function deleteEvent(req, res) {
  try {
    const deleted = await eventModel.deleteEvent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "Event deleted successfully", eventId: req.params.id });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
}

// ── Admin – Attendance ────────────────────────────────────────────────────────

// POST /api/events/:eventId/attendance — mark attendance (admin)
export async function markAttendance(req, res) {
  try {
    const { eventId } = req.params;
    const { studentId, status } = req.body;

    if (!studentId || !status) {
      return res
        .status(400)
        .json({ error: "Student ID and status are required" });
    }

    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await attendanceModel.markAttendance(
      eventId,
      studentId,
      status,
      req.user.userId
    );

    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
}

// GET /api/events/:eventId/attendance — get event attendance (admin)
export async function getEventAttendance(req, res) {
  try {
    const { eventId } = req.params;
    const attendance = await attendanceModel.getEventAttendance(eventId);
    res.json(attendance);
  } catch (error) {
    console.error("Get event attendance error:", error);
    res.status(500).json({ error: "Failed to get attendance" });
  }
}

// ── Student – Personal Attendance ─────────────────────────────────────────────

// GET /api/student/attendance — get student's attendance history
export async function getStudentAttendance(req, res) {
  try {
    const studentId = req.user.userId;
    const attendance = await attendanceModel.getStudentEventAttendance(
      studentId
    );
    res.json(attendance);
  } catch (error) {
    console.error("Get student attendance error:", error);
    res.status(500).json({ error: "Failed to get attendance" });
  }
}

// GET /api/student/attendance/stats — get student attendance stats
export async function getAttendanceStats(req, res) {
  try {
    const studentId = req.user.userId;
    const stats = await attendanceModel.getStudentAttendanceStats(studentId);
    res.json(stats);
  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({ error: "Failed to get attendance stats" });
  }
}

// GET /api/events/:id/check-my-certificate — check if user participated and has certificate
export async function checkMyCertificate(req, res) {
  try {
    const { id: eventId } = req.params;
    const userId = req.user?.userId;

    // If not authenticated, return not-participant
    if (!userId) {
      return res.status(401).json({
        isParticipant: false,
        hasCertificate: false,
        participantName: null,
      });
    }

    // Get event details
    const event = await eventModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is in attendance records for this event
    // Note: attendance model uses event_name and event_date for matching
    const db = getDB();
    const attendanceCollection = db.collection("event_attendance");

    const attendance = await attendanceCollection.findOne({
      event_name: event.name || event._id,
      event_date: event.date,
      student_id: userId,
    });

    if (!attendance) {
      return res.json({
        isParticipant: false,
        hasCertificate: false,
        participantName: null,
      });
    }

    // Check if user has a certificate for this event
    const certificatesCollection = db.collection("certificates");
    const certificate = await certificatesCollection.findOne({
      event_id: eventId,
      user_id: userId,
      certificate_type: "event",
    });

    // Get user profile for participant name
    const profilesCollection = db.collection("profiles");
    const profile = await profilesCollection.findOne({ _id: userId });

    return res.json({
      isParticipant: true,
      hasCertificate: !!certificate,
      participantName: profile?.name || null,
      certificateId: certificate?._id || null,
    });
  } catch (error) {
    console.error("Check certificate error:", error);
    res.status(500).json({ error: "Failed to check certificate status" });
  }
}

// GET /api/events/:id/my-certificate — download event certificate
export async function getEventCertificate(req, res) {
  try {
    const { id: eventId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = getDB();

    // Verify user is a participant
    const event = await eventModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const attendanceCollection = db.collection("event_attendance");
    const attendance = await attendanceCollection.findOne({
      event_name: event.name || event._id,
      event_date: event.date,
      student_id: userId,
    });

    if (!attendance) {
      return res
        .status(403)
        .json({ error: "You did not participate in this event" });
    }

    // Get certificate record
    const certificatesCollection = db.collection("certificates");
    const certificate = await certificatesCollection.findOne({
      event_id: eventId,
      user_id: userId,
      certificate_type: "event",
    });

    if (!certificate) {
      return res
        .status(404)
        .json({ error: "Certificate not found for this event" });
    }

    // Mark as downloaded
    await certificatesCollection.updateOne(
      { _id: certificate._id },
      {
        $set: {
          is_downloaded: true,
          last_downloaded: new Date(),
          updated_at: new Date(),
        },
      }
    );

    // Return certificate with file metadata
    // Assumes certificate stores file_url or file_path
    const fileName = `${event.name}_certificate_${userId}.pdf`;

    return res.json({
      signedUrl: certificate.file_url || certificate.file_path || null,
      fileName: fileName,
      certificateId: certificate._id,
      issuedDate: certificate.issued_date,
    });
  } catch (error) {
    console.error("Get event certificate error:", error);
    res.status(500).json({ error: "Failed to retrieve certificate" });
  }
}
