import "dotenv/config";
import express from "express";
import connectDB from "./db.js";
import lostRoutes from "./routes/lost.js";
import foundRoutes from "./routes/found.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => res.redirect("/lost"));
app.use("/lost", lostRoutes);
app.use("/found", foundRoutes);

app.use(errorHandler);

try {
  await connectDB();
  app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
} catch (err) {
  console.error("Could not connect to MongoDB:", err.message);
  process.exit(1);
}
