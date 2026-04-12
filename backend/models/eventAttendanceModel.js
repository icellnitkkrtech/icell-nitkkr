import { getDB } from "../config/mongodb.js";
import { v4 as uuidv4 } from "uuid";

// Mark attendance
// event_source: "main" = from events collection, "attendance_only" = created just for attendance
export async function markAttendance(
  eventName,
  eventType,
  eventDate,
  studentId,
  status,
  markedBy,
  eventSource = "attendance_only",
  years = [] // Array of academic years this event is for
) {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    const existing = await attendance.findOne({
      event_name: eventName,
      event_date: eventDate,
      student_id: studentId,
    });

    if (existing) {
      await attendance.updateOne(
        { _id: existing._id },
        {
          $set: {
            status,
            event_type: eventType, // Update in case the admin changed the type
            years:
              Array.isArray(years) && years.length > 0
                ? years
                : existing.years || [], // Update years
            marked_at: new Date(),
            marked_by: markedBy,
            updated_at: new Date(),
          },
        }
      );
      return {
        data: { ...existing, status, event_type: eventType },
        error: null,
      };
    } else {
      const record = {
        _id: uuidv4(),
        event_name: eventName,
        event_type: eventType,
        event_date: eventDate,
        student_id: studentId,
        status,
        marked_at: new Date(),
        marked_by: markedBy,
        event_source: eventSource, // Track where this event came from
        years: Array.isArray(years) && years.length > 0 ? years : [], // Store selected years
        created_at: new Date(),
        updated_at: new Date(),
      };
      await attendance.insertOne(record);
      return { data: record, error: null };
    }
  } catch (error) {
    return { data: null, error };
  }
}

// Fetch event attendance
export async function fetchEventAttendance(eventName, eventDate) {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");
    const profiles = db.collection("profiles");

    const records = await attendance
      .find({
        event_name: eventName,
        event_date: eventDate,
      })
      .toArray();

    const enriched = await Promise.all(
      records.map(async (record) => {
        const student = await profiles.findOne({ _id: record.student_id });
        return {
          ...record,
          student_name: student?.name,
          student_email: student?.email,
          student_branch: student?.branch,
        };
      })
    );
    return { data: enriched, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Fetch student attendance history
// Only returns records where attendance was actually marked (status is not blank/null)
export async function fetchStudentEventAttendance(studentId) {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    // Query only records where status is actually marked (present, absent, or leave)
    // Excludes blank/null status entries
    const records = await attendance
      .find({
        student_id: studentId,
        status: { $in: ["present", "absent", "leave"] },
      })
      .sort({ marked_at: -1 })
      .toArray();

    return { data: records, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Fetch student attendance stats
// Only counts events where attendance was actually marked (status is not blank/null)
export async function fetchStudentAttendanceStats(studentId) {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    // Query only records where status is actually marked (present, absent, OR leave)
    // Percentage is based on: (present / (present + absent + leave)) * 100
    const records = await attendance
      .find({
        student_id: studentId,
        status: { $in: ["present", "absent", "leave"] },
      })
      .toArray();

    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const leaveCount = records.filter((r) => r.status === "leave").length;
    const totalCount = presentCount + absentCount + leaveCount; // Include ALL marked events

    const stats = {
      total: totalCount,
      present: presentCount,
      absent: absentCount,
      leave: leaveCount,
      // Percentage = (present / (present + absent + leave)) * 100
      percentage:
        totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
    };
    return { data: stats, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetch attendance stats for multiple students (bulk)
 * Returns array of {studentId, stats} for efficient loading in student management
 */
export async function fetchMultipleStudentsAttendanceStats(studentIds) {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    const results = {};

    for (const studentId of studentIds) {
      console.log(`Querying attendance for studentId: ${studentId}`);

      // Query only records where status is actually marked (present, absent, OR leave)
      const records = await attendance
        .find({
          student_id: studentId,
          status: { $in: ["present", "absent", "leave"] },
        })
        .toArray();

      console.log(`  Found ${records.length} attendance records`);

      const presentCount = records.filter((r) => r.status === "present").length;
      const absentCount = records.filter((r) => r.status === "absent").length;
      const leaveCount = records.filter((r) => r.status === "leave").length;
      const totalCount = presentCount + absentCount + leaveCount; // Include ALL marked events

      results[studentId] = {
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        leave: leaveCount,
        percentage:
          totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
      };
    }

    console.log("Final results:", results);
    return { data: results, error: null };
  } catch (error) {
    console.error("fetchMultipleStudentsAttendanceStats error:", error);
    return { data: null, error };
  }
}

// Helper: Get unique events to populate a dropdown on the frontend
// Returns both main events (from events collection) and attendance-only events
// Sorted by created_at DESC (newest first)
export async function fetchUniqueEvents() {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    // Uses MongoDB aggregation to group by event name and date so we don't get duplicates
    const uniqueEvents = await attendance
      .aggregate([
        {
          $group: {
            _id: { name: "$event_name", date: "$event_date" },
            type: { $first: "$event_type" },
            source: { $first: "$event_source" }, // Get the source of the event
            createdAt: { $max: "$created_at" }, // Get the latest created_at for sorting
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id.name",
            date: "$_id.date",
            type: 1,
            source: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } }, // Sort by created_at DESC (newest first)
      ])
      .toArray();

    return { data: uniqueEvents, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Get main events from the events collection (the ones created in AdminEvents section)
export async function fetchMainEvents() {
  try {
    const db = getDB();
    const events = db.collection("events");

    const mainEvents = await events
      .find({})
      .sort({ created_at: -1 }) // Newest first
      .toArray();

    return { data: mainEvents, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Get attendance-only events (created just for tracking, not visible in events section)
export async function fetchAttendanceOnlyEvents() {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    const attendanceOnlyEvents = await attendance
      .aggregate([
        { $match: { event_source: "attendance_only" } }, // Only attendance-only events
        {
          $group: {
            _id: { name: "$event_name", date: "$event_date" },
            type: { $first: "$event_type" },
            createdAt: { $max: "$created_at" },
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id.name",
            date: "$_id.date",
            type: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } }, // Newest first
      ])
      .toArray();

    return { data: attendanceOnlyEvents, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Delete event - removes all attendance records for a specific event
export async function deleteEvent(eventName, eventDate) {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    const result = await attendance.deleteMany({
      event_name: eventName,
      event_date: eventDate,
    });

    if (result.deletedCount === 0) {
      return {
        data: null,
        error: new Error("Event not found. No records deleted."),
      };
    }

    return {
      data: { deletedCount: result.deletedCount },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}
