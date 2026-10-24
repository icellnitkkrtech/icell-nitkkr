#!/usr/bin/env node

/**
 * Admin Setup Script
 * Run this script to create the initial admin account
 * Usage: node setup-admin.js
 */

import dotenv from "dotenv";
dotenv.config();

import { connectDB, closeDB } from "../config/mongodb.js";
import * as authModel from "../models/authModel.js";

async function setupAdmin() {
  try {
    console.log("  Admin Setup Started...\n");

    // Connect to MongoDB
    await connectDB();
    console.log("  Connected to MongoDB");

    // Check if admin already exists
    const adminExists = await authModel.checkAdminExists();
    if (adminExists) {
      console.log("  Admin already exists in the database.");
      console.log(
        "To create a new admin, delete the existing admin from database first.\n"
      );
      await closeDB();
      process.exit(0);
    }

    // Create admin account
    const email = "nav@nitkkr.ac.in";
    const password = "12345678";
    const name = "Admin";

    console.log(`\n  Creating admin account:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}\n`);

    const admin = await authModel.createAdmin(email, password, name);

    console.log("  Admin account created successfully!\n");
    console.log("Admin Details:");
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(
      "\n📌 You can now login with these credentials at /admin/login"
    );
    console.log("  Change the password after first login for security!\n");

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error("  Error during admin setup:", error.message);
    process.exit(1);
  }
}

setupAdmin();
