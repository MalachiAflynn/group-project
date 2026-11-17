import { Router } from "express";
import { showLostPage, createLostItem, deleteLostItem } from "../controllers/lostController.js";
import requireLogin from "../middleware/requireLogin.js";

const router = Router();

router.get("/", showLostPage);
router.post("/", requireLogin, createLostItem);
router.delete("/:id", requireLogin, deleteLostItem);

export default router;