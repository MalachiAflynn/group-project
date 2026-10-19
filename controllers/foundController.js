import asyncHandler from "../middleware/asyncHandler.js";
import foundService from "../services/foundService.js";


export const getFoundItems = asyncHandler(async (req, res) => {
  const itemlist = await foundService.getFoundItems();
  return res.render("found", {
    title: "Found Items | UMass Lost & Found",
    items: itemlist,
  });
});
export const handlenewitem = asyncHandler(async (req, res) => {
  const item = await foundService.addFoundItem(req.body);
  return res.status(201).json(item);
});