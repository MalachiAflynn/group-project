import LostItem from "../models/LostItem.js";

export async function findAll() {
  return LostItem.find().sort({ createdAt: -1 });
}

export async function create(data) {
  return LostItem.create(data);
}