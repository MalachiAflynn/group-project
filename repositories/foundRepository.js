import FoundItem from "../models/FoundItem.js";

class FoundItemRepo {
  async findAll() {
    return FoundItem.find().sort({ createdAt: -1 });
  }
  async create(data) {
    return FoundItem.create(data);
  }
}
export default new FoundItemRepo();