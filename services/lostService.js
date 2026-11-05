import * as lostRepository from "../repositories/lostRepository.js";

const REQUIRED_FIELDS = ["title", "category", "location", "contactName", "contactEmail"];

export async function listLostItems() {
  return lostRepository.findAll();
}

export async function reportLostItem(body = {}) {
  const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
  if (missing.length > 0) {
    const err = new Error(`Missing required field(s): ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const { title, description, category, location, date, contactName, contactEmail } = body;
  return lostRepository.create({
    title,
    description,
    category,
    location,
    contactName,
    contactEmail,
    date: date || new Date(),
  });
}

export async function removeLostItem(id) {
  const deletedItem = await lostRepository.removeById(id);
  if (deletedItem == null) {
    const err = new Error(`Lost item not found`);
    err.status = 404;
    throw err;
  }
  return deletedItem;
}