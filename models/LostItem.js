import mongoose from "mongoose";

const lostItemSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    location: String,
    date: Date,
    contactName: String,
    contactEmail: String,
  },
  { timestamps: true }
);

export default mongoose.model("LostItem", lostItemSchema);
