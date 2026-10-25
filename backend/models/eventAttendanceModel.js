import { getDB } from "../config/mongodb.js";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

// Mark attendance
// event_source: "main" = from events collection, "other" = other events (society meets, sessions, workshops, etc.)
export async function markAttendance(
  eventName,
  eventType,
  eventDate,
  studentId,
  status,
  markedBy,
  eventSource = "other",
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

    // Query only records where status is actually marked (present or absent)
    // Excludes blank/null status entries
    const records = await attendance
      .find({
        student_id: studentId,
        status: { $in: ["present", "absent"] },
      })
      .sort({ marked_at: -1 })
      .toArray();

    return { data: records, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Fetch student attendance stats
// Only counts events where attendance was actually marked (status is present or absent)
export async function fetchStudentAttendanceStats(studentId) {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    // Query only records where status is actually marked (present or absent)
    // Percentage is based on: (present / (present + absent)) * 100
    const records = await attendance
      .find({
        student_id: studentId,
        status: { $in: ["present", "absent"] },
      })
      .toArray();

    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const totalCount = presentCount + absentCount;

    const stats = {
      total: totalCount,
      present: presentCount,
      absent: absentCount,
      // Percentage = (present / (present + absent)) * 100
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
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return { data: {}, error: null };
    }

    const db = getDB();
    const attendance = db.collection("event_attendance");

    // Initialize all requested student IDs with default stats
    const results = {};
    const sanitizedIds = Array.from(
      new Set(
        studentIds
          .filter((id) => id !== null && id !== undefined && id !== "")
          .map((id) => String(id).trim())
      )
    );

    for (const id of sanitizedIds) {
      results[id] = {
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0,
      };
    }

    if (sanitizedIds.length === 0) {
      return { data: results, error: null };
    }

    // Build query criteria to match both string UUIDs/IDs and MongoDB ObjectIds
    const queryIds = [];
    for (const id of sanitizedIds) {
      queryIds.push(id);
      if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
        try {
          queryIds.push(new ObjectId(id));
        } catch (e) {
          // Ignore invalid ObjectId format conversion errors
        }
      }
    }

    // Run single MongoDB aggregation pipeline across all student IDs
    // Excludes unmarked events and legacy leave options (only present and absent)
    const aggregatedStats = await attendance
      .aggregate([
        {
          $match: {
            student_id: { $in: queryIds },
            status: { $in: ["present", "absent", "Present", "Absent"] },
          },
        },
        {
          $group: {
            _id: { $toString: "$student_id" },
            present: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["present", "Present"]] },
                  1,
                  0,
                ],
              },
            },
            absent: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["absent", "Absent"]] },
                  1,
                  0,
                ],
              },
            },
            total: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Map aggregated metrics onto results dictionary
    for (const stat of aggregatedStats) {
      const studentId = String(stat._id);
      const total = stat.total || 0;
      const present = stat.present || 0;
      const absent = stat.absent || 0;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      results[studentId] = {
        total,
        present,
        absent,
        percentage,
      };
    }

    return { data: results, error: null };
  } catch (error) {
    console.error("fetchMultipleStudentsAttendanceStats error:", error);
    return { data: null, error };
  }
}

// Helper: Get unique events to populate a dropdown on the frontend
// Returns both main events (from events collection) and other events
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

// Get other events (society meets, internal sessions, workshops, etc.)
export async function fetchOtherEvents() {
  try {
    const db = getDB();
    const attendance = db.collection("event_attendance");

    const otherEvents = await attendance
      .aggregate([
        { $match: { event_source: { $ne: "main" } } }, // Match all other events (including historical attendance_only and other)
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

    return { data: otherEvents, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Backward-compatibility alias
export const fetchAttendanceOnlyEvents = fetchOtherEvents;

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
