import { connectDB, getDB, closeDB } from "../config/mongodb.js";

async function backfillRollNumbers() {
  try {
    console.log("=========================================");
    console.log("Starting Roll Number Backfill Migration");
    console.log("=========================================");
    console.log("Connecting to MongoDB...");
    await connectDB();
    const db = getDB();
    const profiles = db.collection("profiles");

    // Find all users except admin
    const nonAdminUsers = await profiles
      .find({
        role: { $ne: "admin" },
      })
      .toArray();

    console.log(`Found ${nonAdminUsers.length} non-admin accounts to inspect.\n`);

    let updatedCount = 0;
    let alreadyCorrectCount = 0;
    let skippedCount = 0;

    for (const user of nonAdminUsers) {
      if (!user.email) {
        console.warn(`[SKIP] User ID ${user._id} has no email.`);
        skippedCount++;
        continue;
      }

      // Extract roll number from part before @nitkkr.ac.in (or @)
      const extractedRollNo = user.email.split("@")[0].trim();

      if (!extractedRollNo) {
        console.warn(`[SKIP] Could not extract roll number from email: ${user.email}`);
        skippedCount++;
        continue;
      }

      // Check if user already has this exact roll number
      if (user.roll_number && user.roll_number.trim() === extractedRollNo) {
        alreadyCorrectCount++;
        continue;
      }

      // Update user with extracted roll number
      await profiles.updateOne(
        { _id: user._id },
        {
          $set: {
            roll_number: extractedRollNo,
            updated_at: new Date(),
          },
        }
      );

      console.log(
        `[UPDATED] ${user.email} -> Roll No: ${extractedRollNo} (Role: ${user.role || "student"})`
      );
      updatedCount++;
    }

    console.log("\n=========================================");
    console.log("Migration Summary:");
    console.log(`- Total Accounts Inspected : ${nonAdminUsers.length}`);
    console.log(`- Successfully Updated     : ${updatedCount}`);
    console.log(`- Already Had Roll Number  : ${alreadyCorrectCount}`);
    console.log(`- Skipped / Missing Email  : ${skippedCount}`);
    console.log("=========================================");
    console.log("Roll number backfill completed successfully!\n");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await closeDB();
    console.log("Database connection closed.");
  }
}

backfillRollNumbers();
