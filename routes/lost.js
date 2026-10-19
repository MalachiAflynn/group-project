import { Router } from "express";
import { showLostPage, createLostItem } from "../controllers/lostController.js";

const router = Router();

router.get("/", showLostPage);
router.post("/", createLostItem);

export default router;