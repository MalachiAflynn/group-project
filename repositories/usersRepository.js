import User from "../models/User.js";
import mongoose from "mongoose";

export async function findByUsername(username) {
    if ((typeof username) !== "string") {
        return null;
    }
    const cleanedUsername = username.toLowerCase().trim();
    return User.findOne({username: cleanedUsername});
}

export async function findById(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }
    return User.findById(id);
}

export async function createUser(username, passwordHash) {
    return User.create({ 
        username, 
        passwordHash} 
    );
}