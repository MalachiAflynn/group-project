import LostItem from "../models/LostItem.js";
import mongoose from "mongoose";

export async function findAll() {
  return LostItem.find().sort({ createdAt: -1 });
}

export async function create(data) {
  return LostItem.create(data);
}

export async function removeById(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return LostItem.findByIdAndDelete(id);
}