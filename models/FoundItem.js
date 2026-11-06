import mongoose from "mongoose";

const foundItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    location: { type: String, required: true },
    date: Date,
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
  },
  { timestamps: true }
);
export default mongoose.model("FoundItem", foundItemSchema);
