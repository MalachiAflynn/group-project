import { Router } from "express";
import { getFoundItems, handlenewitem, deleteFoundItem } from "../controllers/foundController.js";
import requireLogin from "../middleware/requireLogin.js";


const fndrouter = Router();

fndrouter.get("/", getFoundItems);
fndrouter.post("/", requireLogin, handlenewitem);
fndrouter.delete("/:id", requireLogin, deleteFoundItem);

export default fndrouter;