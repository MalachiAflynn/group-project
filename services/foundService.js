
import foundRepository from "../repositories/foundRepository.js";
import { isOwnerOrAdmin } from "./ownership.js";

class FoundItmService {
  async getFoundItems() {
    return foundRepository.findAll();
  }

  async addFoundItem(body = {}, user) {
    const checkFields = [
      "title",
      "category",
      "location",
      "contactName",
      "contactEmail",
    ];

    const emptyFields = [];

    for (const field of checkFields) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        emptyFields.push(field);
      }
    }

    if (emptyFields.length > 0) {
      const valderror = new Error(
        `Empty required fields: ${emptyFields.join(", ")}`
      );
      valderror.status = 400;
      throw valderror;
    }

    // owner comes last so an owner field in the form can't override the logged-in user
    const data = {
      ...body,
      date: body.date || new Date(),
      owner: user.id,
    };

    return foundRepository.create(data);
  }

  async removeFoundItem(id, user) {
    const item = await foundRepository.findById(id);
    if (item == null) {
      const err = new Error("Found item not found");
      err.status = 404;
      throw err;
    }

    if (!isOwnerOrAdmin(user, item)) {
      const err = new Error("You can only delete found items you posted");
      err.status = 403;
      throw err;
    }

    return foundRepository.removeById(id);
  }
}

export default new FoundItmService();
