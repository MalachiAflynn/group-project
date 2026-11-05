import { Router } from "express";
import { showLostPage, createLostItem, deleteLostItem } from "../controllers/lostController.js";

const router = Router();

router.get("/", showLostPage);
router.post("/", createLostItem);
router.delete("/:id", deleteLostItem);

export default router;