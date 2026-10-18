import { connectDB, getDB, closeDB } from "../config/mongodb.js";

async function incrementYears() {
  try {
    console.log("Connecting to the database...");
    await connectDB();
    const db = getDB();
    const profiles = db.collection("profiles");

    // Find all users who are currently students or members
    const students = await profiles.find({
      role: { $in: ["student", "member", "post_holder"] }
    }).toArray();

    console.log(`Found ${students.length} students/members to process.`);

    let updatedCount = 0;

    for (const student of students) {
      // Skip if year is empty or missing
      if (!student.year) continue;

      const yearNum = parseInt(student.year, 10);

      // Skip if year is not a valid number
      if (isNaN(yearNum)) continue;

      const newYear = (yearNum + 1).toString();

      await profiles.updateOne(
        { _id: student._id },
        {
          $set: {
            year: newYear,
            updated_at: new Date()
          }
        }
      );

      updatedCount++;
    }

    console.log(`Successfully incremented the year for ${updatedCount} profiles.`);

  } catch (error) {
    console.error("Error incrementing years:", error);
  } finally {
    // Always close the connection
    await closeDB();
  }
}

incrementYears();