import LostItem from "../models/LostItem.js";
import mongoose from "mongoose";

export async function findAll() {
  return LostItem.find().sort({ createdAt: -1 });
}

export async function getAll() {
  return findAll();
}

export async function findById(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return LostItem.findById(id);
}

export async function create(data) {
  return LostItem.create(data);
}

export async function updateById(id, data) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return LostItem.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true });
}

export async function removeById(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  return LostItem.findByIdAndDelete(id);
}
