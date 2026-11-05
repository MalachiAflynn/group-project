import FoundItem from "../models/FoundItem.js";
import mongoose from "mongoose";

class FoundItemRepo {
  async findAll() {
    return FoundItem.find().sort({ createdAt: -1 });
  }
  async create(data) {
    return FoundItem.create(data);
  }
  async removeById(id) {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    return FoundItem.findByIdAndDelete(id);
  }
}
export default new FoundItemRepo();