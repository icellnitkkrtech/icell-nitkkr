import express from "express";
import verifyUser from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import {
  markStudentAttendance,
  getEventAttendance,
  getStudentEventAttendance,
  getStudentAttendanceStats,
  getBulkStudentsAttendanceStats,
  getUniqueEvents, // We will add this to help the frontend dropdown!
  getMainEvents, // Get main events from events collection
  getAttendanceOnlyEvents, // Get attendance-only events
  deleteEventAttendance, // Delete event and all its records
} from "../controllers/eventAttendanceController.js";

const router = express.Router();

// 1. POST /api/event-attendance/mark - Everything goes in the body now
router.post("/mark", verifyUser, isAdmin, markStudentAttendance);

// 2. GET /api/event-attendance/event - Use query params (e.g. ?name=Meet&date=2026-03-15)
router.get("/event", verifyUser, isAdmin, getEventAttendance);

// 2.1. DELETE /api/event-attendance/event - Delete event and all its records
router.delete("/event", verifyUser, isAdmin, deleteEventAttendance);

// 3. GET /api/event-attendance/events/list - Get a list of all unique events marked so far
router.get("/events/list", verifyUser, isAdmin, getUniqueEvents);

// 4. GET /api/event-attendance/main-events - Get main events from events collection
router.get("/main-events", verifyUser, isAdmin, getMainEvents);

// 5. GET /api/event-attendance/attendance-only-events - Get attendance-only events
router.get(
  "/attendance-only-events",
  verifyUser,
  isAdmin,
  getAttendanceOnlyEvents
);

// 6. POST /api/event-attendance/students/bulk-stats - Get attendance stats for multiple students
router.post(
  "/students/bulk-stats",
  verifyUser,
  isAdmin,
  getBulkStudentsAttendanceStats
);

// 7. GET student specific stats
router.get("/student/:studentId", verifyUser, getStudentEventAttendance);
router.get("/student/:studentId/stats", verifyUser, getStudentAttendanceStats);

export default router;
