import { Router } from "express";
import { showSignup, showLogin, signup, login, logout } from "../controllers/authController.js";

const router = Router();

router.get("/signup", showSignup);
router.post("/signup", signup);
router.get("/login", showLogin);
router.post("/login", login);
router.post("/logout", logout);

export default router;
