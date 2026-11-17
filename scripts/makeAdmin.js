import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const username = process.argv[2];

if (!username) {
    console.error("Usage: npm run make-admin -- <username>");
    process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const user = await User.findOneAndUpdate(
    { username: username.toLowerCase().trim() },
    { role: "admin" },
    { returnDocument: "after" }
);

if (user) {
    console.log(`${user.username} is now an admin`);
} else {
    console.error(`No user named ${username}`);
    process.exitCode = 1;
}

await mongoose.disconnect();