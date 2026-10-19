import { Router } from "express";

const router = Router();

router.get("/", (req, res) => res.send("Found page coming soon"));

export default router;
