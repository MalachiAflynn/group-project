import FoundItem from "../models/FoundItem.js";

class FoundItemRepo {
  async findAll() {
    return FoundItem.find().sort({ createdAt: -1 });
  }
  async getAll() {
    return this.findAll();
  }
  async findById(id) {
    return FoundItem.findById(id);
  }
  async create(data) {
    return FoundItem.create(data);
  }
  async updateById(id, data) {
    return FoundItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
  async removeById(id) {
    return FoundItem.findByIdAndDelete(id);
  }
}
export default new FoundItemRepo();