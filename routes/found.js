import { Router } from "express";
import { getFoundItems, handlenewitem, deleteFoundItem } from "../controllers/foundController.js";


const fndrouter = Router();

fndrouter.get("/", getFoundItems);
fndrouter.post("/", handlenewitem);
fndrouter.delete("/:id", deleteFoundItem);

export default fndrouter;