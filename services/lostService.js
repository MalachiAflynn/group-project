import * as lostRepository from "../repositories/lostRepository.js";

const REQUIRED_FIELDS = ["title", "category", "location", "contactName", "contactEmail"];

export async function listLostItems() {
  return lostRepository.findAll();
}

export async function reportLostItem(body = {}, user) {
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
    owner: user.id,
  });
}

export function isOwnerOrAdmin(user, item) {
  if (user.role === "admin") {
    return true;
  }
  return item.owner != null && item.owner.toString() === user.id;
}

export async function removeLostItem(id, user) {
  const item = await lostRepository.findById(id);
  if (item == null) {
    const err = new Error(`Lost item not found`);
    err.status = 404;
    throw err;
  }

  if (!isOwnerOrAdmin(user, item)) {
    const err = new Error("You can only delete lost items you posted");
    err.status = 403;
    throw err;
  }

  return lostRepository.removeById(id);
}
