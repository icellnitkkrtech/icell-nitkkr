#!/usr/bin/env node

/**
 * Blog Seeder Script
 * Run this script to populate the database with 10 sample blogs
 * Usage: node seedBlogs.js
 */

import dotenv from "dotenv";
dotenv.config();

import { connectDB, closeDB, getDB } from "../config/mongodb.js";
import { v4 as uuidv4 } from "uuid";

const sampleBlogs = [
  {
    _id: uuidv4(),
    title: "The Lean Startup Methodology Explained",
    description:
      "Learn how to build a company efficiently by testing your vision continuously, adapting, and adjusting before it's too late.",
    content:
      "The Lean Startup provides a scientific approach to creating and managing startups and get a desired product to customers' hands faster. The Lean Startup method teaches you how to drive a startup-how to steer, when to turn, and when to persevere-and grow a business with maximum acceleration.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Startup",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=800&q=80",
    status: "approved",
    created_at: new Date(Date.now() - 100000000),
    updated_at: new Date(Date.now() - 100000000),
  },
  {
    _id: uuidv4(),
    title: "Minimalism in UI/UX Design",
    description:
      "Why less is more when it comes to designing interfaces that users actually love to interact with.",
    content:
      "Minimalism in web design means simplifying the interface by removing unnecessary elements or content that does not support user tasks. It's about using negative space, clear typography, and a limited color palette to direct the user's focus exactly where it needs to be.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    status: "approved",
    created_at: new Date(Date.now() - 200000000),
    updated_at: new Date(Date.now() - 200000000),
  },
  {
    _id: uuidv4(),
    title: "Securing Seed Funding in 2026",
    description:
      "A comprehensive guide on how to approach angel investors and VCs in today's highly competitive market.",
    content:
      "Raising capital is harder than ever, but the fundamentals remain the same. Investors are looking for strong teams, a clear problem-solution fit, and a scalable business model. Ensure your pitch deck highlights your unique value proposition and traction.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Startup",
    image:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80",
    status: "approved",
    created_at: new Date(Date.now() - 300000000),
    updated_at: new Date(Date.now() - 300000000),
  },
  {
    _id: uuidv4(),
    title: "Color Theory for Modern Web Apps",
    description:
      "Mastering the color wheel to evoke the right emotions and drive user conversions.",
    content:
      "Color is powerful. It can set a mood, attract attention, or make a statement. You can use color to energize, or to cool down. By understanding the basics of color theory—complementary, analogous, and triadic schemes—you can craft visually stunning applications.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?w=800&q=80",
    status: "approved",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    _id: uuidv4(),
    title: "Building a Remote First Company Culture",
    description:
      "Strategies for keeping your startup team engaged, aligned, and productive across different time zones.",
    content:
      "Remote work isn't just a perk anymore; it's a standard. But building culture without a physical office requires intentionality. Regular syncs, virtual coffee chats, and asynchronous communication tools are vital to keeping the startup engine running smoothly.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Startup",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    status: "approved",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    _id: uuidv4(),
    title: "Typography Trends to Watch",
    description:
      "Serifs are making a comeback. Here is what you need to know about typography on the web.",
    content:
      "For years, sans-serif fonts dominated the tech landscape. Now, we are seeing a resurgence of high-contrast serif fonts that add elegance and personality to brands. Combining a bold serif header with a highly legible sans-serif body is the sweet spot.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=80",
    status: "approved",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    _id: uuidv4(),
    title: "Growth Hacking Strategies for SaaS",
    description:
      "Low-cost, highly effective ways to acquire your first 1,000 users.",
    content:
      "Growth hacking isn't about expensive ad campaigns. It's about finding clever ways to distribute your product. From leveraging viral referral loops (like Dropbox did) to engineering free mini-tools related to your niche, creativity beats a massive budget.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Startup",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    status: "approved",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    _id: uuidv4(),
    title: "Designing for Accessibility (a11y)",
    description:
      "Why inclusive design is non-negotiable and how to implement it effectively.",
    content:
      "Accessibility ensures that everyone, including people with disabilities, can use your product. This means proper color contrast, ARIA labels for screen readers, and keyboard-navigable interfaces. Good accessibility is just good design.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    status: "approved",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    _id: uuidv4(),
    title: "The Importance of Customer Discovery",
    description:
      "Stop building features nobody wants. Talk to your users first.",
    content:
      "The biggest mistake early-stage founders make is building a solution looking for a problem. Customer discovery flips this. You must interview potential users, understand their pain points deeply, and only then write the first line of code.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Startup",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    status: "approved",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    _id: uuidv4(),
    title: "Figma vs Sketch: A Perspective",
    description:
      "Analyzing the modern design tool landscape and why collaboration is key.",
    content:
      "Figma has largely won the UI/UX design war because it solved the collaboration problem natively in the browser. While Sketch remains powerful for Mac-native users, the ability to have developers, PMs, and designers in the same file at the same time is unbeatable.",
    author: "nav@gmail.com",
    author_id: uuidv4(),
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    status: "approved",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function seedBlogs() {
  try {
    console.log(" Blog Seed Started...\n");

    // Connect to MongoDB using your existing config
    await connectDB();
    console.log("  Connected to MongoDB");

    const db = getDB();
    const blogsCollection = db.collection("blogs");

    // Check if there are already blogs to prevent accidental duplicates
    const existingCount = await blogsCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`  Found ${existingCount} existing blogs.`);
      console.log(
        "If you want to clear them first, uncomment the deleteMany line in this script.\n"
      );
      // await blogsCollection.deleteMany({}); // Uncomment to clear existing blogs
    }

    console.log(` Inserting ${sampleBlogs.length} sample blogs...`);
    const result = await blogsCollection.insertMany(sampleBlogs);

    console.log(
      `\n Success! Inserted ${result.insertedCount} blogs into the database.`
    );
    console.log(" You can now view these on your frontend blog page!\n");

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error("\n Error during blog seeding:", error.message);
    process.exit(1);
  }
}

seedBlogs();
