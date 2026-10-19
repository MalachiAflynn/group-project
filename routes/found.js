import { Router } from "express";
import { getFoundItems, handlenewitem } from "../controllers/foundController.js";

const fndrouter = Router();

fndrouter.get("/", getFoundItems);
fndrouter.post("/", handlenewitem);

export default fndrouter;