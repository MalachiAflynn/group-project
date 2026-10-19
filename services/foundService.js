
import foundRepository from "../repositories/foundRepository.js";

class FoundItmService {
  async getFoundItems() {
    return foundRepository.findAll();
  }

  async addFoundItem(body = {}) {
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

    const data = {
      ...body,
      date: body.date || new Date(),
    };

    return foundRepository.create(data);
  }
}

export default new FoundItmService();
