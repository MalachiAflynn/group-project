import asyncHandler from "../middleware/asyncHandler.js";
import * as lostService from "../services/lostService.js";
 
export const showLostPage = asyncHandler(async (req, res) => {
  const items = await lostService.listLostItems();
  res.render("lost", { title: "Lost Items | UMass Lost & Found", items });
});
 
export const createLostItem = asyncHandler(async (req, res) => {
  const item = await lostService.reportLostItem(req.body);
  res.status(201).json(item);
});