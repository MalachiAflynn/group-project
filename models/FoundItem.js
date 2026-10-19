import mongoose from "mongoose";

const foundItemSchema = new mongoose.Schema(
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

export default mongoose.model("FoundItem", foundItemSchema);
